import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const send = vi.fn();
vi.mock("resend", () => ({
  Resend: class {
    emails = { send };
  },
}));

import { POST } from "@/app/api/contact/route";
import { HONEYPOT_FIELD } from "@/lib/contact";

const valid = { name: "Dana", email: "dana@example.com", message: "Hi Roman!" };

function post(body: unknown) {
  return POST(
    new Request("http://localhost/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );
}

beforeEach(() => {
  send.mockReset();
  send.mockResolvedValue({ data: { id: "1" }, error: null });
  vi.stubEnv("RESEND_API_KEY", "re_test");
  vi.stubEnv("CONTACT_TO_EMAIL", "romanpu@gmail.com");
  vi.stubEnv("CONTACT_FROM_EMAIL", "");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("POST /api/contact", () => {
  it("returns 400 for malformed JSON", async () => {
    const res = await post("{not json");
    expect(res.status).toBe(400);
    expect(send).not.toHaveBeenCalled();
  });

  it("returns 400 with a message for an invalid payload", async () => {
    const res = await post({ ...valid, email: "nope" });
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/email/i);
  });

  it("silently accepts spam without sending", async () => {
    const res = await post({ ...valid, [HONEYPOT_FIELD]: "x" });
    expect(res.status).toBe(200);
    expect(send).not.toHaveBeenCalled();
  });

  it("returns 503 with fallback when the API key is missing", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    const res = await post(valid);
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ fallback: true });
  });

  it("returns 503 with fallback when the recipient is missing", async () => {
    vi.stubEnv("CONTACT_TO_EMAIL", "");
    const res = await post(valid);
    expect(res.status).toBe(503);
  });

  it("returns 502 with fallback when Resend reports an error", async () => {
    send.mockResolvedValue({ data: null, error: { message: "boom" } });
    const res = await post(valid);
    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ fallback: true });
  });

  it("returns 502 with fallback when Resend throws", async () => {
    send.mockRejectedValue(new Error("network"));
    const res = await post(valid);
    expect(res.status).toBe(502);
  });

  it("sends the message to the owner with reply-to set to the sender", async () => {
    const res = await post(valid);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        from: "Portfolio <onboarding@resend.dev>",
        to: "romanpu@gmail.com",
        replyTo: "dana@example.com",
        text: expect.stringContaining("Hi Roman!"),
      }),
    );
  });

  it("collapses line breaks in the name for the subject line", async () => {
    await post({ ...valid, name: "Dana\r\nBcc: x@y.z" });
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({ subject: "Portfolio contact from Dana Bcc: x@y.z" }),
    );
  });

  it("uses CONTACT_FROM_EMAIL when set", async () => {
    vi.stubEnv("CONTACT_FROM_EMAIL", "Roman <hi@roman.dev>");
    await post(valid);
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({ from: "Roman <hi@roman.dev>" }),
    );
  });
});
