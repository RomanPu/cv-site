import { describe, expect, it, vi } from "vitest";
import { askGemini, GeminiError } from "../src/gemini";

const ok = (body: unknown) => new Response(JSON.stringify(body), { status: 200 });
const reply = (...texts: string[]) =>
  ok({ candidates: [{ content: { role: "model", parts: texts.map((text) => ({ text })) } }] });

function call(fetchFn: typeof fetch) {
  return askGemini({
    apiKey: "test-key",
    model: "gemini-2.5-flash-lite",
    system: "SYSTEM",
    messages: [
      { role: "user", text: "Hi" },
      { role: "model", text: "Hello!" },
      { role: "user", text: "Where did you work?" },
    ],
    fetchFn,
  });
}

describe("askGemini", () => {
  it("sends a well-formed generateContent request", async () => {
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValue(reply("At Elbit."));
    await call(fetchFn);

    const [url, init] = fetchFn.mock.calls[0];
    expect(String(url)).toBe(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent",
    );
    expect(new Headers(init?.headers).get("x-goog-api-key")).toBe("test-key");
    const body = JSON.parse(String(init?.body));
    expect(body.systemInstruction.parts[0].text).toBe("SYSTEM");
    expect(body.contents).toEqual([
      { role: "user", parts: [{ text: "Hi" }] },
      { role: "model", parts: [{ text: "Hello!" }] },
      { role: "user", parts: [{ text: "Where did you work?" }] },
    ]);
    expect(body.generationConfig).toEqual({ maxOutputTokens: 400, temperature: 0.4 });
  });

  it("sets a timeout signal on the request", async () => {
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValue(reply("ok"));
    await call(fetchFn);
    expect(fetchFn.mock.calls[0][1]?.signal).toBeInstanceOf(AbortSignal);
  });

  it("returns the joined, trimmed reply text", async () => {
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValue(reply("At Elbit ", "Systems. "));
    await expect(call(fetchFn)).resolves.toBe("At Elbit Systems.");
  });

  it("throws GeminiError on a non-2xx response", async () => {
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValue(new Response("quota", { status: 429 }));
    await expect(call(fetchFn)).rejects.toBeInstanceOf(GeminiError);
  });

  it("throws GeminiError when there are no candidates (e.g. blocked)", async () => {
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValue(ok({ promptFeedback: { blockReason: "SAFETY" } }));
    await expect(call(fetchFn)).rejects.toBeInstanceOf(GeminiError);
  });

  it("throws GeminiError when the reply text is empty", async () => {
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValue(reply("   "));
    await expect(call(fetchFn)).rejects.toBeInstanceOf(GeminiError);
  });
});
