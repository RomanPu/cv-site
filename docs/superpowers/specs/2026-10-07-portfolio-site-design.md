# Portfolio Site — Design Spec

**Date:** 2026-10-07
**Owner:** Roman Puchinsky
**Source content:** `Profile.pdf` (LinkedIn export)

## Goal

A personal portfolio site that helps Roman land a full-stack developer role, positioning him as a real-time embedded engineer (Elbit avionics) turned full-stack developer (Coding Academy 2024–2025), with C++ teaching/leadership experience (Magshimim). Look: sleek, professional, edgy.

## Decisions (confirmed with user)

- **Approach A:** single-page site; Next.js (App Router) + TypeScript + Tailwind CSS; all content in one data file.
- **Accent color:** electric lime on a near-black background.
- **Contact form:** Next.js API route sending mail via Resend.
- **Unknown info → placeholders**, clearly marked (`TODO` in data file): phone, GitHub URL, headshot, project details.
- **Projects:** 3 placeholder project cards on the main page.
- **Tech stack:** as proposed (see Skills below).

## Architecture

```
src/
  app/
    layout.tsx          # fonts, metadata (SEO/OpenGraph), global shell
    page.tsx            # composes sections in order
    globals.css         # Tailwind + theme tokens, grid/noise background
    api/contact/route.ts# POST → validate → Resend
  components/
    Nav.tsx, Hero.tsx, About.tsx, Skills.tsx, Projects.tsx,
    Experience.tsx, Education.tsx, Contact.tsx, ContactForm.tsx (client),
    SectionHeading.tsx, Reveal.tsx (client, scroll-in animation)
  data/
    profile.ts          # single source of truth for all content
public/
  cv.pdf                # copy of Profile.pdf
  headshot-placeholder  # (rendered as styled monogram if no photo)
```

Each section component takes no props and reads from `profile.ts` — content edits never touch components.

## Visual Direction

- Background near-black (`#0a0a0a`), text off-white, accent lime (`#c6ff00`-ish), muted grays for secondary text.
- Subtle grid/dot pattern + faint noise overlay on background.
- Fonts: bold geometric sans for headings (e.g. Space Grotesk), monospace for labels/metadata (e.g. JetBrains Mono) via `next/font`.
- Section labels in mono: `// 01 — ABOUT`, `// 02 — SKILLS`, …
- Cards: thin 1px borders, cursor-follow glow on hover, lime accent on hover/focus.
- Restrained scroll-in reveal animations; respect `prefers-reduced-motion`.
- Responsive down to 360px; no horizontal scroll.

## Sections (top → bottom)

1. **Nav** — sticky, blurred background; monogram "RP", anchor links, "Download CV" button (`/cv.pdf`). Collapses to menu on mobile.
2. **Hero** — name, headline "Full-Stack Developer — built on an embedded systems foundation", location (Israel), photo placeholder (monogram tile), CTAs: View Projects, Contact.
3. **About** — rewritten summary (removes "[mention technologies]" placeholder, names actual stack).
4. **Skills** — grouped tags:
   - Frontend: JavaScript, TypeScript, React, Redux, HTML, CSS/SASS
   - Backend: Node.js, Express, REST APIs, WebSocket / Socket.io
   - Data: MongoDB, SQL
   - Tools: Git, Docker
   - Embedded: C, C++, UART/RS-485, I2C, SPI, UDP, AVR (ATmega2561)
   - Languages: English (Full Professional), Hebrew (Native), Russian (Native)
   - Also: Project Management
5. **Projects** — 3 placeholder cards: title, short description, tech tags, GitHub + Live links (placeholder `#`).
6. **Experience** — timeline:
   - Magshimim Cyber Programme — Instructor, 2021–2024
   - Elbit Systems Ltd — Software Engineer, Apr 2016–Feb 2019, Haifa (bullets grammar-cleaned)
7. **Education** — Coding Academy Israel (Full-stack developer cert, 2024–2025); Experis Software (Computer Software Engineering cert, 2015); University of Haifa (BA Business/Managerial Economics, 2011–2013).
8. **Contact** — email (romanpu@gmail.com), phone (placeholder), LinkedIn (linkedin.com/in/roman-puchinsky), GitHub (placeholder), contact form.
9. **Footer** — © year, name.

## Contact Form Data Flow

`ContactForm` (client) → `POST /api/contact` with `{name, email, message}` (+ hidden honeypot field).

API route:
- Validates fields (non-empty, valid email, length limits) → 400 on invalid.
- Honeypot filled → return 200 silently (drop spam).
- If `RESEND_API_KEY` or `CONTACT_TO_EMAIL` missing → 503 `{ fallback: true }`.
- Sends via Resend (`from: onboarding@resend.dev` default, overridable by `CONTACT_FROM_EMAIL`), `replyTo` = sender → 200.
- Resend error → 502.

Client shows states: idle, sending, success, error. On 503/502 it shows "Couldn't send — email me directly at …" with mailto link. Never fails silently.

Env vars documented in `.env.example`: `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` (optional).

## SEO / Metadata

Title, description, OpenGraph tags from `profile.ts`; favicon (lime "RP").

## Testing / Verification

- `npm run build` and `npm run lint` pass.
- Unit tests (Vitest) for the contact payload validator.
- Manual check in browser at desktop and mobile widths; contact form fallback path exercised without API key.

## Out of Scope (YAGNI)

Project detail pages, blog, CMS, i18n/RTL, analytics, dark/light toggle (site is dark-only by design).
