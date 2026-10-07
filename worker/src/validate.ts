export type ChatMessage = { role: "user" | "model"; text: string };

export type ChatValidation =
  | { ok: true; messages: ChatMessage[] }
  | { ok: false; error: string };

export const MAX_MESSAGES = 10;
export const MAX_TEXT = 500;

export function validateChat(body: unknown): ChatValidation {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return { ok: false, error: "Invalid request." };
  }
  const raw = (body as { messages?: unknown }).messages;
  if (!Array.isArray(raw) || raw.length === 0) {
    return { ok: false, error: "No messages." };
  }

  const messages: ChatMessage[] = [];
  for (const item of raw.slice(-MAX_MESSAGES)) {
    const { role, text } = (item ?? {}) as { role?: unknown; text?: unknown };
    if (role !== "user" && role !== "model") return { ok: false, error: "Invalid role." };
    if (typeof text !== "string") return { ok: false, error: "Invalid text." };
    const trimmed = text.trim();
    if (!trimmed || trimmed.length > MAX_TEXT) {
      return { ok: false, error: `Messages must be 1–${MAX_TEXT} characters.` };
    }
    messages.push({ role, text: trimmed });
  }

  // Gemini expects the conversation to open with a user turn.
  while (messages[0]?.role === "model") messages.shift();

  if (messages.at(-1)?.role !== "user") {
    return { ok: false, error: "Last message must be from the user." };
  }
  return { ok: true, messages };
}
