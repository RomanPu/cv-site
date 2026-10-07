"use client";

import { useState, type FormEvent } from "react";
import { CONTACT_LIMITS } from "@/lib/contact";
import { profile } from "@/data/profile";

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent" }
  | { kind: "invalid"; message: string }
  | { kind: "failed" };

const inputClass =
  "w-full border border-line bg-bg px-4 py-3 text-fg placeholder:text-muted/60 transition-colors focus:border-accent focus:outline-none";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      if (res.ok) {
        form.reset();
        setStatus({ kind: "sent" });
      } else if (res.status === 400) {
        const { error } = await res.json().catch(() => ({ error: null }));
        setStatus({ kind: "invalid", message: error ?? "Please check the form and try again." });
      } else {
        setStatus({ kind: "failed" });
      }
    } catch {
      setStatus({ kind: "failed" });
    }
  }

  if (status.kind === "sent") {
    return (
      <div role="status" className="border border-accent/60 bg-accent/5 p-8">
        <p className="font-mono text-xs tracking-widest text-accent uppercase">{"// message sent"}</p>
        <p className="mt-3 text-2xl font-bold tracking-tight">Thanks — I&apos;ll get back to you soon.</p>
        <button
          type="button"
          onClick={() => setStatus({ kind: "idle" })}
          className="mt-6 font-mono text-xs tracking-widest text-muted uppercase underline-offset-4 hover:text-accent hover:underline"
        >
          Send another
        </button>
      </div>
    );
  }

  const sending = status.kind === "sending";

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block font-mono text-xs tracking-widest text-muted uppercase">Name</span>
          <input
            name="name"
            required
            maxLength={CONTACT_LIMITS.name}
            autoComplete="name"
            placeholder="Jane Recruiter"
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="mb-2 block font-mono text-xs tracking-widest text-muted uppercase">Email</span>
          <input
            name="email"
            type="email"
            required
            maxLength={CONTACT_LIMITS.email}
            autoComplete="email"
            placeholder="jane@company.com"
            className={inputClass}
          />
        </label>
      </div>

      <label className="block">
        <span className="mb-2 block font-mono text-xs tracking-widest text-muted uppercase">Message</span>
        <textarea
          name="message"
          required
          rows={5}
          maxLength={CONTACT_LIMITS.message}
          placeholder="We're hiring and I think you'd be a great fit…"
          className={`${inputClass} resize-y`}
        />
      </label>

      {/* Honeypot — hidden from people, tempting to bots */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Company
          <input name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <button
          type="submit"
          disabled={sending}
          className="group inline-flex items-center gap-3 bg-accent px-6 py-3 font-mono text-sm font-bold tracking-wider text-accent-ink uppercase transition-transform hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60"
        >
          {sending ? "Sending…" : "Send message"}
          {!sending && <span className="transition-transform group-hover:translate-x-1">→</span>}
        </button>

        <div aria-live="polite" className="text-sm">
          {status.kind === "invalid" && <p className="text-red-400">{status.message}</p>}
          {status.kind === "failed" && (
            <p className="text-fg/80">
              Couldn&apos;t send right now — email me directly at{" "}
              <a href={`mailto:${profile.contact.email}`} className="text-accent underline underline-offset-4">
                {profile.contact.email}
              </a>
              .
            </p>
          )}
        </div>
      </div>
    </form>
  );
}
