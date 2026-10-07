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

- `contact.phone`, `contact.github`
- `photo` — drop an image into `public/` (e.g. `public/headshot.jpg`) and set `photo: "/headshot.jpg"`
- `projects` — the three project cards (set `github` / `live` URLs; `"#"` renders the link disabled)

The "CV" button serves `public/cv.pdf` — replace that file to update the download.

## Contact

The contact section is a `mailto:` button plus links (email, phone, LinkedIn, GitHub) — no backend,
so it works on static hosting.

## Deploy (GitHub Pages)

The site is a static export (`output: "export"` → `out/`). Every push to `main` runs
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), which tests, builds with
`PAGES_BASE_PATH=/<repo-name>`, and publishes to `https://<username>.github.io/<repo-name>/`.

In the repo settings, **Pages → Source** must be set to **GitHub Actions**.
