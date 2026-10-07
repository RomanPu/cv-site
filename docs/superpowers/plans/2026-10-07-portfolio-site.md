# Portfolio Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Single-page, dark/lime, edgy portfolio for Roman Puchinsky with a Resend-backed contact form.

**Architecture:** Next.js App Router page composed of section components that read all content from `src/data/profile.ts`. A `POST /api/contact` route validates input with a pure validator and sends mail via Resend, returning a fallback signal when unconfigured.

**Tech Stack:** Next.js (latest, App Router), React, TypeScript, Tailwind CSS v4, `resend`, Vitest.

**Spec:** `docs/superpowers/specs/2026-10-07-portfolio-site-design.md`

## Global Constraints

- Dark-only. Tokens in `globals.css`: `--bg: #0a0a0a`, `--fg: #ededed`, `--muted: #8a8a8a`, `--line: #222`, `--accent: #c6ff00`.
- Fonts via `next/font/google`: Space Grotesk (headings/body), JetBrains Mono (labels).
- Section labels format: `// 0N — NAME` (em dash, uppercase).
- All placeholder content marked with a `// TODO:` comment in `profile.ts`.
- All animations disabled under `prefers-reduced-motion: reduce`.
- No horizontal scroll at 360px width.
- Env vars: `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, optional `CONTACT_FROM_EMAIL` (default `Portfolio <onboarding@resend.dev>`).

## Review Focus

1. Contact form with whitespace-only fields or padded email — expect trimmed values, 400 for empty.
2. Oversized message (> 5000 chars) or name (> 100) — expect 400, not a forwarded giant email.
3. Missing env vars in production — expect 503 `{fallback:true}` and visible mailto fallback, never a silent failure.
4. Malformed JSON body to `/api/contact` — expect 400, not a 500 crash.
5. Mobile widths (360px) with long tag lists / long email — expect wrapping, no horizontal overflow.

---

### Task 1: Scaffold project, theme, tooling

**Files:**
- Create: Next.js app at repo root (`package.json`, `src/app/*`, `tsconfig.json`, etc.), `vitest.config.ts`, `.env.example`, `public/cv.pdf` (copy of `Profile.pdf`)
- Modify: `src/app/globals.css`, `src/app/layout.tsx`

- [ ] **Step 1:** Run `npx create-next-app@latest` into a temp dir with `--ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --no-turbopack`, move contents into repo root (keep existing `.gitignore` entries merged).
- [ ] **Step 2:** `npm i resend` and `npm i -D vitest`. Add script `"test": "vitest run"`. `vitest.config.ts` resolves `@` → `src`.
- [ ] **Step 3:** `globals.css`: Tailwind import, tokens from Global Constraints exposed via `@theme`, body bg/fg, background grid pattern (1px `--line` lines every 48px, radial mask fade), `::selection` lime, reduced-motion rule.
- [ ] **Step 4:** `layout.tsx`: load both fonts as CSS variables, metadata (title "Roman Puchinsky — Full-Stack Developer", description from summary, OpenGraph), `lang="en"`.
- [ ] **Step 5:** `src/app/icon.svg`: lime "RP" on black.
- [ ] **Step 6:** `.env.example` listing the three env vars. Copy `Profile.pdf` → `public/cv.pdf`.
- [ ] **Step 7:** Verify `npm run build` passes. Commit `chore: scaffold Next.js app with theme`.

### Task 2: Content data file

**Files:**
- Create: `src/data/profile.ts`, `src/data/profile.test.ts`

**Interfaces:**
- Produces: `export const profile: Profile` with
  `name, headline, location, summary: string[]`,
  `contact: { email, phone, linkedin, github }`,
  `skills: { group: string; items: string[] }[]`,
  `languages: { name: string; level: string }[]`,
  `projects: { title, description, tags: string[], github, live }[]`,
  `experience: { company, role, period, location, bullets: string[] }[]`,
  `education: { school, credential, period }[]`.

- [ ] **Step 1: Failing test** — `profile.test.ts`: `projects.length === 3`; every skill group has ≥1 item; `summary.join(" ")` does not contain `"["`; `contact.email === "romanpu@gmail.com"`; experience[0].company === "Magshimim Cyber Programme".
- [ ] **Step 2:** Run `npm test` → FAIL (module not found).
- [ ] **Step 3:** Write `profile.ts` with spec content: rewritten summary (2 paragraphs, names React/Node/TypeScript/MongoDB), skill groups from spec, grammar-cleaned Elbit bullets (4), Magshimim bullets (2–3), education ×3, phone `"+972-XX-XXX-XXXX"` / github `"https://github.com/your-username"` / 3 projects ("Project One/Two/Three") all with `// TODO:`.
- [ ] **Step 4:** `npm test` → PASS. Commit `feat: add profile content data`.

### Task 3: Contact validation + API route

**Files:**
- Create: `src/lib/contact.ts`, `src/lib/contact.test.ts`, `src/app/api/contact/route.ts`, `src/app/api/contact/route.test.ts`

**Interfaces:**
- Produces: `validateContact(input: unknown): { ok: true; data: { name: string; email: string; message: string } } | { ok: false; error: string }`; limits `name ≤ 100`, `message ≤ 5000`, `email ≤ 254`; honeypot field `company` → `{ ok: false, error: "spam" }`.
- Produces: `POST(req: Request): Promise<Response>` — JSON `{ ok: true }` 200 | `{ error }` 400 | `{ fallback: true }` 503 | `{ fallback: true }` 502. Spam → 200 `{ ok: true }` without sending.

- [ ] **Step 1: Failing tests** `contact.test.ts`: valid input trims (`"  a@b.co "` → `"a@b.co"`); whitespace-only name → not ok; `"not-an-email"` → not ok; 5001-char message → not ok; non-object input (`null`, `"x"`) → not ok; `company: "x"` → error `"spam"`.
- [ ] **Step 2:** `npm test` → FAIL. Implement `validateContact`. → PASS.
- [ ] **Step 3: Failing tests** `route.test.ts` (mock `resend` with `vi.mock`, set/unset `process.env`): malformed JSON → 400; invalid payload → 400; spam → 200 and send not called; env missing → 503 `{fallback:true}`; send returns `{ error }` → 502; success → 200 and send called with `to: CONTACT_TO_EMAIL`, `replyTo: email`.
- [ ] **Step 4:** Implement route (instantiate `Resend` inside handler so env is read per request). `npm test` → PASS. Commit `feat: add contact API with validation`.

### Task 4: Shell components — Nav, Hero, SectionHeading, Reveal, Footer

**Files:**
- Create: `src/components/{Nav,Hero,SectionHeading,Reveal,Footer}.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Produces: `SectionHeading({ index: number; title: string })` renders `// 0N — TITLE` mono label + large heading. `Reveal({ children, delay?: number })` client component, IntersectionObserver fade/translate-up once.
- Section ids used by Nav: `about, skills, projects, experience, education, contact`.

- [ ] **Step 1:** Nav (client): sticky, `backdrop-blur`, "RP" monogram, links, lime-outlined "Download CV" (`/cv.pdf`, `download`); mobile hamburger toggles panel, closes on link click.
- [ ] **Step 2:** Hero: huge name (clamp ~3–7rem, tight tracking), mono `> full-stack developer_` line with blinking cursor, headline, location, CTAs (solid lime "View Projects" → `#projects`, outlined "Contact" → `#contact`), monogram photo tile with `// TODO: replace with headshot` and scanline overlay.
- [ ] **Step 3:** Footer: `© {year} Roman Puchinsky` + mono "built with Next.js".
- [ ] **Step 4:** `npm run build` passes. Commit `feat: add nav, hero, footer`.

### Task 5: Content sections

**Files:**
- Create: `src/components/{About,Skills,Projects,Experience,Education}.tsx`, `src/components/GlowCard.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `profile` (Task 2), `SectionHeading`, `Reveal` (Task 4).
- Produces: `GlowCard({ children, className? })` client — tracks pointer, sets CSS vars `--x/--y` for radial lime glow; border turns lime on hover.

- [ ] **Step 1:** About (01): summary paragraphs + small stat row (e.g. `3 yrs` avionics, `3 yrs` teaching, `3` languages).
- [ ] **Step 2:** Skills (02): grid of GlowCards per group, tags as mono chips; languages card.
- [ ] **Step 3:** Projects (03): 3 GlowCards with index number, title, description, tags, GitHub/Live links (open in new tab).
- [ ] **Step 4:** Experience (04): vertical timeline, lime node dots, period in mono, bullets.
- [ ] **Step 5:** Education (05): compact 3-column cards.
- [ ] **Step 6:** `npm run build` passes. Commit `feat: add content sections`.

### Task 6: Contact section + form

**Files:**
- Create: `src/components/Contact.tsx`, `src/components/ContactForm.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `POST /api/contact` (Task 3), `profile.contact`.

- [ ] **Step 1:** Contact (06): heading "Let's build something.", link list (email mailto, phone tel, LinkedIn, GitHub) with `break-all` on long values.
- [ ] **Step 2:** ContactForm (client): name/email/message + visually hidden `company` honeypot (`tabIndex={-1}`, `autoComplete="off"`); states idle/sending/success/error; on non-200 or network error show "Couldn't send — email me directly at romanpu@gmail.com" with mailto; disable button while sending; `maxLength` attrs matching Task 3 limits.
- [ ] **Step 3:** `npm run build` + `npm run lint` + `npm test` pass. Commit `feat: add contact section and form`.

### Task 7: Verification in browser

- [ ] **Step 1:** Start dev server; check desktop and 375px mobile: no horizontal scroll (`document.documentElement.scrollWidth <= innerWidth`), nav menu works, all anchors scroll.
- [ ] **Step 2:** Submit form without env → fallback message shows.
- [ ] **Step 3:** Fix issues found; final commit.
