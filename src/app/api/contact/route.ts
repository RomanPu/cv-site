import { Resend } from "resend";
import { validateContact } from "@/lib/contact";

const DEFAULT_FROM = "Portfolio <onboarding@resend.dev>";

const fallback = (status: 502 | 503) => Response.json({ fallback: true }, { status });

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const result = validateContact(body);
  if (!result.ok) {
    // Pretend success so bots don't learn to skip the honeypot.
    if (result.error === "spam") return Response.json({ ok: true });
    return Response.json({ error: result.error }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  if (!apiKey || !to) return fallback(503);

  const { name, email, message } = result.data;
  try {
    const { error } = await new Resend(apiKey).emails.send({
      from: process.env.CONTACT_FROM_EMAIL || DEFAULT_FROM,
      to,
      replyTo: email,
      subject: `Portfolio contact from ${name.replace(/\s+/g, " ")}`,
      text: `From: ${name} <${email}>\n\n${message}`,
    });
    if (error) {
      console.error("Resend error:", error);
      return fallback(502);
    }
  } catch (err) {
    console.error("Resend request failed:", err);
    return fallback(502);
  }

  return Response.json({ ok: true });
}
