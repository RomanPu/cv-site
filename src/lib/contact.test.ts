import { describe, expect, it } from "vitest";
import { validateContact } from "@/lib/contact";

const valid = { name: "Dana", email: "dana@example.com", message: "Hi Roman!" };

describe("validateContact", () => {
  it("accepts a valid payload and trims every field", () => {
    const result = validateContact({
      name: "  Dana ",
      email: "  a@b.co ",
      message: " Hello \n",
    });
    expect(result).toEqual({
      ok: true,
      data: { name: "Dana", email: "a@b.co", message: "Hello" },
    });
  });

  it("rejects a whitespace-only name", () => {
    expect(validateContact({ ...valid, name: "   " }).ok).toBe(false);
  });

  it("rejects an empty message", () => {
    expect(validateContact({ ...valid, message: "" }).ok).toBe(false);
  });

  it("rejects a malformed email", () => {
    expect(validateContact({ ...valid, email: "not-an-email" }).ok).toBe(false);
  });

  it("rejects a message over 5000 characters", () => {
    expect(validateContact({ ...valid, message: "x".repeat(5001) }).ok).toBe(false);
  });

  it("accepts a message of exactly 5000 characters", () => {
    expect(validateContact({ ...valid, message: "x".repeat(5000) }).ok).toBe(true);
  });

  it("rejects a name over 100 characters", () => {
    expect(validateContact({ ...valid, name: "x".repeat(101) }).ok).toBe(false);
  });

  it("rejects non-string fields", () => {
    expect(validateContact({ ...valid, email: 42 }).ok).toBe(false);
  });

  it.each([null, undefined, "x", 3, []])("rejects non-object input %j", (input) => {
    expect(validateContact(input).ok).toBe(false);
  });

  it("flags a filled honeypot as spam", () => {
    expect(validateContact({ ...valid, company: "Acme" })).toEqual({
      ok: false,
      error: "spam",
    });
  });
});
