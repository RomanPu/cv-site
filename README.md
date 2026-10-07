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

## Contact form

The form posts to `/api/contact`, which sends mail through [Resend](https://resend.com).
Copy `.env.example` to `.env.local` and set:

| Variable | Purpose |
|---|---|
| `RESEND_API_KEY` | Resend API key |
| `CONTACT_TO_EMAIL` | Where messages are delivered |
| `CONTACT_FROM_EMAIL` | Optional sender on a Resend-verified domain (defaults to `onboarding@resend.dev`, which only delivers to your Resend account email) |

Without these, the form shows a "email me directly" fallback instead of failing silently.

## Deploy

Push to GitHub and import the repo on [Vercel](https://vercel.com); add the env vars above in the project settings.
