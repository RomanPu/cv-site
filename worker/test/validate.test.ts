import { describe, expect, it } from "vitest";
import { MAX_MESSAGES, validateChat } from "../src/validate";

const user = (text: string) => ({ role: "user", text });
const model = (text: string) => ({ role: "model", text });

describe("validateChat", () => {
  it("accepts a valid conversation and trims text", () => {
    expect(validateChat({ messages: [user("  Hi there  ")] })).toEqual({
      ok: true,
      messages: [{ role: "user", text: "Hi there" }],
    });
  });

  it("keeps only the last 10 messages", () => {
    const long = Array.from({ length: 12 }, (_, i) => (i % 2 ? model(`m${i}`) : user(`u${i}`)));
    long.push(user("final"));
    const result = validateChat({ messages: long });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.messages.length).toBeLessThanOrEqual(MAX_MESSAGES);
      expect(result.messages[0].role).toBe("user");
      expect(result.messages.at(-1)?.text).toBe("final");
    }
  });

  it("drops leading model messages so the conversation starts with the user", () => {
    const result = validateChat({ messages: [model("hello"), user("hi")] });
    expect(result).toEqual({ ok: true, messages: [{ role: "user", text: "hi" }] });
  });

  it.each([null, "x", 3, [], {}, { messages: "nope" }, { messages: [] }])(
    "rejects malformed body %j",
    (body) => {
      expect(validateChat(body).ok).toBe(false);
    },
  );

  it("rejects an unknown role", () => {
    expect(validateChat({ messages: [{ role: "system", text: "hi" }] }).ok).toBe(false);
  });

  it("rejects empty text", () => {
    expect(validateChat({ messages: [user("   ")] }).ok).toBe(false);
  });

  it("rejects text over 500 characters", () => {
    expect(validateChat({ messages: [user("x".repeat(501))] }).ok).toBe(false);
  });

  it("accepts text of exactly 500 characters", () => {
    expect(validateChat({ messages: [user("x".repeat(500))] }).ok).toBe(true);
  });

  it("requires the last message to come from the user", () => {
    expect(validateChat({ messages: [user("hi"), model("hello")] }).ok).toBe(false);
  });
});
