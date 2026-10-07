import { profile } from "../../src/data/profile";
import { askGemini } from "./gemini";
import { buildSystemPrompt } from "./prompt";
import { validateChat } from "./validate";

const SYSTEM_PROMPT = buildSystemPrompt(profile);

export type Deps = { ask?: typeof askGemini };

function corsHeaders(origin: string): HeadersInit {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function json(body: unknown, status: number, origin?: string): Response {
  return Response.json(body, { status, headers: origin ? corsHeaders(origin) : undefined });
}

function log(level: "info" | "error", event: string, data: Record<string, unknown> = {}) {
  console[level === "error" ? "error" : "log"](JSON.stringify({ level, event, ...data }));
}

export async function handle(request: Request, env: Env, deps: Deps = {}): Promise<Response> {
  const ask = deps.ask ?? askGemini;
  const url = new URL(request.url);
  if (url.pathname !== "/chat") return json({ error: "not_found" }, 404);

  const origin = request.headers.get("Origin") ?? "";
  const allowed = env.ALLOWED_ORIGINS.split(",").map((o) => o.trim());
  if (!allowed.includes(origin)) return json({ error: "forbidden" }, 403);

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }
  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405, origin);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "invalid_json" }, 400, origin);
  }
  const result = validateChat(body);
  if (!result.ok) return json({ error: result.error }, 400, origin);

  const ip = request.headers.get("cf-connecting-ip") ?? "unknown";
  const [perIp, global] = await Promise.all([
    env.IP_LIMITER.limit({ key: ip }),
    env.GLOBAL_LIMITER.limit({ key: "global" }),
  ]);
  if (!perIp.success || !global.success) {
    log("info", "rate_limited", { scope: perIp.success ? "global" : "ip" });
    return json({ error: "rate_limited" }, 429, origin);
  }

  if (!env.GEMINI_API_KEY) {
    log("error", "missing_api_key");
    return json({ error: "unavailable" }, 503, origin);
  }

  try {
    const reply = await ask({
      apiKey: env.GEMINI_API_KEY,
      model: env.GEMINI_MODEL,
      system: SYSTEM_PROMPT,
      messages: result.messages,
    });
    return json({ reply }, 200, origin);
  } catch (err) {
    log("error", "gemini_failed", { message: err instanceof Error ? err.message : String(err) });
    return json({ error: "upstream" }, 502, origin);
  }
}

export default {
  fetch: (request, env) => handle(request, env),
} satisfies ExportedHandler<Env>;
