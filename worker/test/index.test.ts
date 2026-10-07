import { beforeEach, describe, expect, it, vi } from "vitest";
import { GeminiError } from "../src/gemini";
import { handle, type Deps } from "../src/index";

const ORIGIN = "https://romanpu.github.io";

const limiter = (success: boolean) => ({ limit: vi.fn(async () => ({ success })) });

function makeEnv(overrides: Partial<Env> = {}): Env {
  return {
    GEMINI_API_KEY: "test-key",
    GEMINI_MODEL: "gemini-2.5-flash-lite",
    ALLOWED_ORIGINS: `${ORIGIN},http://localhost:3000`,
    IP_LIMITER: limiter(true),
    GLOBAL_LIMITER: limiter(true),
    ...overrides,
  } as unknown as Env;
}

let ask: ReturnType<typeof vi.fn<NonNullable<Deps["ask"]>>>;
beforeEach(() => {
  ask = vi.fn<NonNullable<Deps["ask"]>>().mockResolvedValue("I worked at Elbit Systems.");
});

function req(
  { method = "POST", path = "/chat", origin = ORIGIN as string | null, body = undefined as unknown } = {},
) {
  const headers = new Headers({ "Content-Type": "application/json", "cf-connecting-ip": "1.2.3.4" });
  if (origin) headers.set("Origin", origin);
  return new Request(`https://cv-twin.example.workers.dev${path}`, {
    method,
    headers,
    body: method === "POST" ? (typeof body === "string" ? body : JSON.stringify(body)) : undefined,
  });
}

const valid = { messages: [{ role: "user", text: "Where did you work?" }] };

describe("worker handler", () => {
  it("answers CORS preflight from an allowed origin", async () => {
    const res = await handle(req({ method: "OPTIONS" }), makeEnv(), { ask });
    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe(ORIGIN);
    expect(res.headers.get("Access-Control-Allow-Methods")).toContain("POST");
  });

  it("rejects a disallowed origin without calling Gemini", async () => {
    const res = await handle(req({ origin: "https://evil.example", body: valid }), makeEnv(), { ask });
    expect(res.status).toBe(403);
    expect(ask).not.toHaveBeenCalled();
  });

  it("rejects a request with no Origin header", async () => {
    const res = await handle(req({ origin: null, body: valid }), makeEnv(), { ask });
    expect(res.status).toBe(403);
    expect(ask).not.toHaveBeenCalled();
  });

  it("returns 404 for unknown paths", async () => {
    expect((await handle(req({ path: "/nope", body: valid }), makeEnv(), { ask })).status).toBe(404);
  });

  it("returns 405 for non-POST methods on /chat", async () => {
    expect((await handle(req({ method: "GET" }), makeEnv(), { ask })).status).toBe(405);
  });

  it("returns 400 for malformed JSON", async () => {
    expect((await handle(req({ body: "{bad" }), makeEnv(), { ask })).status).toBe(400);
  });

  it("returns 400 for an invalid payload", async () => {
    const res = await handle(req({ body: { messages: [] } }), makeEnv(), { ask });
    expect(res.status).toBe(400);
  });

  it("returns 429 when the per-IP limit is hit, keyed by client IP", async () => {
    const env = makeEnv({ IP_LIMITER: limiter(false) } as Partial<Env>);
    const res = await handle(req({ body: valid }), env, { ask });
    expect(res.status).toBe(429);
    expect(env.IP_LIMITER.limit).toHaveBeenCalledWith({ key: "1.2.3.4" });
    expect(ask).not.toHaveBeenCalled();
  });

  it("returns 429 when the global limit is hit", async () => {
    const env = makeEnv({ GLOBAL_LIMITER: limiter(false) } as Partial<Env>);
    expect((await handle(req({ body: valid }), env, { ask })).status).toBe(429);
  });

  it("returns 503 when the API key is not configured", async () => {
    const res = await handle(req({ body: valid }), makeEnv({ GEMINI_API_KEY: "" }), { ask });
    expect(res.status).toBe(503);
  });

  it("returns 502 without leaking details when Gemini fails", async () => {
    ask.mockRejectedValue(new GeminiError("Gemini HTTP 500: secret details"));
    const res = await handle(req({ body: valid }), makeEnv(), { ask });
    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ error: "upstream" });
  });

  it("returns the reply with CORS headers on success", async () => {
    const res = await handle(req({ body: valid }), makeEnv(), { ask });
    expect(res.status).toBe(200);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe(ORIGIN);
    expect(await res.json()).toEqual({ reply: "I worked at Elbit Systems." });
    expect(ask).toHaveBeenCalledWith(
      expect.objectContaining({
        apiKey: "test-key",
        model: "gemini-2.5-flash-lite",
        messages: [{ role: "user", text: "Where did you work?" }],
        system: expect.stringContaining("digital twin"),
      }),
    );
  });
});
