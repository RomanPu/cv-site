# Roman Puchinsky — Portfolio

Single-page portfolio built with Next.js (App Router), TypeScript and Tailwind CSS.

## Develop

```bash
npm install
npm run dev     # http://localhost:3000
npm test        # unit tests (Vitest)
npm run build   # production build
```

## Editing content

All text lives in [`src/data/profile.ts`](src/data/profile.ts). Placeholders are marked `// TODO:`:

- `contact.phone`
- `photo` — drop an image into `public/` (e.g. `public/headshot.jpg`) and set `photo: "/headshot.jpg"`
- `projects` — the three project cards (set `github` / `live` URLs; `"#"` renders the link disabled)

The "CV" button serves `public/cv.pdf` — replace that file to update the download.

## Contact

The contact section is a `mailto:` button plus links (email, phone, LinkedIn, GitHub) — no backend,
so it works on static hosting.

## Digital twin (AI chat)

A floating "Ask my twin" chat answers visitors' questions in first person, grounded only in
`src/data/profile.ts`. The browser calls a Cloudflare Worker in [`worker/`](worker/) that holds the
Gemini API key and calls `gemini-3.1-flash-lite` (set via `GEMINI_MODEL` in `worker/wrangler.jsonc`).

- Guardrails: only your site's origin is allowed; 10 msgs/min per IP and 60/min globally; 500-char
  messages, last 10 turns, ~400-token answers.
- Local dev: put `GEMINI_API_KEY=...` in `worker/.dev.vars`, run `npm run dev` in `worker/`, and set
  `NEXT_PUBLIC_TWIN_URL=http://localhost:8787` in `.env.local`.
- Deploy the Worker: `cd worker && npx wrangler deploy` (secret once: `npx wrangler secret put GEMINI_API_KEY`).
- The site build reads the Worker URL from the GitHub repo variable `TWIN_URL`; if unset, the chat button is hidden.
- Profile edits update the twin's knowledge on the next `wrangler deploy`.

## Deploy (GitHub Pages)

The site is a static export (`output: "export"` → `out/`). Every push to `main` runs
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), which tests, builds with
`PAGES_BASE_PATH=/<repo-name>`, and publishes to `https://<username>.github.io/<repo-name>/`.

In the repo settings, **Pages → Source** must be set to **GitHub Actions**.
