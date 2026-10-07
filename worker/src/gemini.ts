import type { ChatMessage } from "./validate";

export class GeminiError extends Error {}

type AskOptions = {
  apiKey: string;
  model: string;
  system: string;
  messages: ChatMessage[];
  fetchFn?: typeof fetch;
};

type GenerateContentResponse = {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
};

export async function askGemini({ apiKey, model, system, messages, fetchFn = fetch }: AskOptions): Promise<string> {
  const res = await fetchFn(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      signal: AbortSignal.timeout(20_000),
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: messages.map((m) => ({ role: m.role, parts: [{ text: m.text }] })),
        generationConfig: { maxOutputTokens: 400, temperature: 0.4 },
      }),
    },
  );

  if (!res.ok) {
    throw new GeminiError(`Gemini HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }

  const data = (await res.json()) as GenerateContentResponse;
  const text = (data.candidates?.[0]?.content?.parts ?? [])
    .map((part) => part.text ?? "")
    .join("")
    .trim();
  if (!text) {
    throw new GeminiError(`Gemini returned no text: ${JSON.stringify(data).slice(0, 300)}`);
  }
  return text;
}
