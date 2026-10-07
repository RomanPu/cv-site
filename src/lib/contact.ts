export const CONTACT_LIMITS = { name: 100, email: 254, message: 5000 } as const;

/** Hidden spam-trap input. Opaque name so browser autofill never fills it. */
export const HONEYPOT_FIELD = "hp_x7";

export type ContactData = { name: string; email: string; message: string };

export type ContactValidation =
  | { ok: true; data: ContactData }
  | { ok: false; error: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function field(input: Record<string, unknown>, key: keyof ContactData): string | null {
  const value = input[key];
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > CONTACT_LIMITS[key]) return null;
  return trimmed;
}

export function validateContact(input: unknown): ContactValidation {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return { ok: false, error: "Invalid request." };
  }
  const body = input as Record<string, unknown>;

  // Honeypot: hidden from humans, bots tend to fill it.
  const trap = body[HONEYPOT_FIELD];
  if (typeof trap === "string" && trap.trim() !== "") {
    return { ok: false, error: "spam" };
  }

  const name = field(body, "name");
  if (!name) return { ok: false, error: "Please enter your name." };

  const email = field(body, "email");
  if (!email || !EMAIL_RE.test(email)) {
    return { ok: false, error: "Please enter a valid email address." };
  }

  const message = field(body, "message");
  if (!message) return { ok: false, error: "Please enter a message." };

  return { ok: true, data: { name, email, message } };
}
