# Digital Twin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A floating "Ask my twin" chat on the portfolio, answered in first person by Gemini 2.5 Flash-Lite through a Cloudflare Worker grounded in `profile.ts`.

**Architecture:** `worker/` is a standalone Wrangler project (own package.json/tsconfig) exposing `POST /chat`; pure modules (validate, prompt, gemini) are unit-tested with the root Vitest. The static site gets a client `TwinChat` component whose endpoint comes from `NEXT_PUBLIC_TWIN_URL` at build time.

**Tech Stack:** Cloudflare Workers + Wrangler (rate-limit bindings), Gemini REST `generateContent`, Next.js static export, Vitest.

**Spec:** `docs/superpowers/specs/2026-10-07-digital-twin-design.md`

## Global Constraints

- Model default `gemini-2.5-flash-lite` via var `GEMINI_MODEL`; endpoint `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, header `x-goog-api-key`.
- Limits: ≤10 messages kept, text 1–500 chars trimmed, last message role `user`; `maxOutputTokens: 400`, `temperature: 0.4`.
- Rate limits: per-IP 10/60s (`namespace_id` 1001), global 60/60s (`namespace_id` 1002).
- `ALLOWED_ORIGINS` = `https://romanpu.github.io,http://localhost:3000`.
- Statuses: 204 preflight, 403 bad origin, 404 path, 405 method, 400 invalid, 429 limited, 503 no key, 502 upstream, 200 `{ reply }`.
- Secrets never in code, config, logs, or chat output. `compatibility_date` 2026-10-07; observability logs+traces enabled.
- Fallback copy: "I'm offline right now — email me at romanpu@gmail.com." / 429: "You're asking faster than I can think — try again in a minute."

## Review Focus

1. Prompt injection in user text ("ignore previous instructions…") — expect twin stays in role; rule present in system prompt.
2. Request with no `Origin` header (curl) — expect 403, Gemini not called.
3. Gemini returns 200 with no candidates / blocked safety finish — expect 502, not a crash or empty reply.
4. Conversation >10 turns from client — expect trimmed to last 10, not 400.
5. Widget when `NEXT_PUBLIC_TWIN_URL` unset or Worker down — button hidden / offline message, page unaffected.

---

### Task 1: Worker scaffold

**Files:** Create `worker/package.json`, `worker/wrangler.jsonc`, `worker/tsconfig.json`, `worker/src/index.ts` (stub returning 404); Modify root `tsconfig.json` (exclude `worker`), `vitest.config.ts` (include `worker/test/**/*.test.ts`), `.gitignore` (`worker/.wrangler/`, `worker/.dev.vars`).

- [ ] `worker/package.json` devDeps: `wrangler`, `typescript`; scripts `dev`, `deploy`, `types` (`wrangler types`), `typecheck` (`tsc --noEmit`).
- [ ] `wrangler.jsonc`: name `cv-twin`, main `src/index.ts`, compat date, observability, two `ratelimits` (`IP_LIMITER`, `GLOBAL_LIMITER`), vars `GEMINI_MODEL`, `ALLOWED_ORIGINS`.
- [ ] Run `npm run types` then `npm run typecheck` in `worker/` → pass. Root `npm run build` still passes. Commit.

### Task 2: `validateChat`

**Files:** `worker/src/validate.ts`, `worker/test/validate.test.ts`
**Produces:** `type ChatMessage = { role: "user" | "model"; text: string }`; `validateChat(body: unknown): { ok: true; messages: ChatMessage[] } | { ok: false; error: string }`; `MAX_MESSAGES = 10`, `MAX_TEXT = 500`.

- [ ] Tests: valid trims text; keeps last 10 of 12; rejects non-object / missing array / empty array; bad role; empty or 501-char text; last role `model`.
- [ ] RED → implement → GREEN. Commit.

### Task 3: `buildSystemPrompt`

**Files:** `worker/src/prompt.ts`, `worker/test/prompt.test.ts`
**Produces:** `buildSystemPrompt(p: Profile): string` (imports type from `../../src/data/profile`).

- [ ] Tests: contains "first person", "romanpu@gmail.com", "Elbit Systems", "ATmega2561", "Magshimim", an instruction to ignore rule-changing instructions, "coming soon" for projects; does not contain the placeholder phone `XX-XXX`.
- [ ] RED → implement (rules from spec + `PROFILE:` block serializing profile minus placeholder phone/photo/projects details) → GREEN. Commit.

### Task 4: `askGemini`

**Files:** `worker/src/gemini.ts`, `worker/test/gemini.test.ts`
**Produces:** `askGemini(o: { apiKey: string; model: string; system: string; messages: ChatMessage[]; fetchFn?: typeof fetch }): Promise<string>`; throws `GeminiError` on failure.

- [ ] Tests (fake fetchFn): request URL contains model + `:generateContent`; header `x-goog-api-key`; body has `systemInstruction.parts[0].text`, `contents` mapped roles, `generationConfig` values; returns joined candidate text trimmed; throws on non-2xx, on no candidates, on empty text.
- [ ] RED → implement → GREEN. Commit.

### Task 5: Worker handler

**Files:** `worker/src/index.ts`, `worker/test/index.test.ts`
**Produces:** `default { fetch(request, env, ctx) }`; exported `handle(request: Request, env: Env, deps?: { ask?: typeof askGemini }): Promise<Response>` for tests.

- [ ] Tests (fake limiters `{ limit: async () => ({ success }) }`, fake ask): OPTIONS allowed origin → 204 with CORS headers; disallowed / missing origin → 403 and ask not called; GET → 405; `/other` → 404; bad JSON → 400; invalid body → 400; IP limiter false → 429; global limiter false → 429; no key → 503; ask throws → 502 `{error:"upstream"}`; success → 200 `{reply}` with `Access-Control-Allow-Origin` echoing origin.
- [ ] RED → implement → GREEN; `npm run typecheck` in worker passes. Commit.

### Task 6: `TwinChat` widget

**Files:** `src/components/TwinChat.tsx`; Modify `src/app/page.tsx`, `.github/workflows/deploy.yml` (env `NEXT_PUBLIC_TWIN_URL: ${{ vars.TWIN_URL }}`), `README.md`.

- [ ] Widget per spec (button, dialog, chips, typing dots, fallback/429 copy, Escape, focus, full-screen <640px). Renders nothing when env unset.
- [ ] Verify: `npm run build` with and without `NEXT_PUBLIC_TWIN_URL`; lint; browser check against `wrangler dev` locally (with `.dev.vars` from `.env`). Commit.

### Task 7: Deploy & verify live

- [ ] `npx wrangler login` (user approves in browser); `wrangler secret put GEMINI_API_KEY` piping value from `.env` without echo; `wrangler deploy` → note `*.workers.dev` URL.
- [ ] `gh variable set TWIN_URL`; merge to `main`, push; watch Pages run.
- [ ] Live checks: on-topic answer, unknown → email deflection, off-topic refusal, injection attempt, curl without Origin → 403, mobile layout.
