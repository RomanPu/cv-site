"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { profile } from "@/data/profile";

const TWIN_URL = process.env.NEXT_PUBLIC_TWIN_URL;
const MAX_TEXT = 500;
const MAX_HISTORY = 10;

type Message = {
  role: "user" | "model";
  text: string;
  /** Local-only: shown in the chat but never sent back to the twin. */
  local?: boolean;
};

const suggestions = [
  "What did you build at Elbit?",
  "What's your tech stack?",
  "Why move from embedded to full-stack?",
];

const OFFLINE = `I'm offline right now — email me at ${profile.contact.email}.`;
const SLOW_DOWN = "You're asking faster than I can think — try again in a minute.";

export default function TwinChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, pending]);

  if (!TWIN_URL) return null;

  async function send(text: string) {
    const trimmed = text.trim().slice(0, MAX_TEXT);
    if (!trimmed || pending) return;

    const userMsg: Message = { role: "user", text: trimmed };
    const history = [...messages.filter((m) => !m.local), userMsg].slice(-MAX_HISTORY);
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setPending(true);

    try {
      const res = await fetch(`${TWIN_URL}/chat`, {
        method: "POST",
        signal: AbortSignal.timeout(25_000),
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.map(({ role, text }) => ({ role, text })) }),
      });
      const data = (await res.json().catch(() => ({}))) as { reply?: string };
      if (res.ok && data.reply) {
        setMessages((prev) => [...prev, { role: "model", text: data.reply! }]);
      } else {
        fail(res.status === 429 ? SLOW_DOWN : OFFLINE);
      }
    } catch {
      fail(OFFLINE);
    } finally {
      setPending(false);
    }

    // Keep the failed question out of future context so turns stay user/model alternating.
    function fail(text: string) {
      setMessages((prev) => [
        ...prev.map((m) => (m === userMsg ? { ...m, local: true } : m)),
        { role: "model", text, local: true },
      ]);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void send(input);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="twin-chat"
        className={`fixed right-4 bottom-4 z-[70] flex items-center gap-2.5 border border-accent bg-bg/90 px-4 py-3 font-mono text-xs tracking-widest text-accent uppercase shadow-[0_0_40px_-10px_var(--accent)] backdrop-blur-md transition-all hover:bg-accent hover:text-accent-ink sm:right-6 sm:bottom-6 ${
          open ? "max-sm:hidden" : ""
        }`}
      >
        <span className="relative flex size-2">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60" />
          <span className="relative inline-flex size-2 rounded-full bg-accent" />
        </span>
        {open ? "Close twin" : "Ask my twin"}
      </button>

      {open && (
        <div
          id="twin-chat"
          role="dialog"
          aria-label={`Chat with ${profile.firstName}'s digital twin`}
          className="fixed inset-0 z-[80] flex flex-col border-line bg-bg sm:inset-auto sm:right-6 sm:bottom-20 sm:h-[560px] sm:max-h-[calc(100dvh-7rem)] sm:w-[380px] sm:border sm:shadow-2xl sm:shadow-black/60"
        >
          <header className="flex items-center justify-between border-b border-line px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center border border-accent font-mono text-xs font-bold text-accent">
                {profile.initials}
              </span>
              <div>
                <p className="text-sm font-bold">{profile.firstName}&apos;s digital twin</p>
                <p className="font-mono text-[10px] tracking-widest text-muted uppercase">
                  AI · answers from my CV
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="grid size-8 place-items-center border border-line text-muted transition-colors hover:border-accent hover:text-accent"
            >
              ✕
            </button>
          </header>

          <div ref={listRef} aria-live="polite" className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            <Bubble role="model">
              Hi! I&apos;m {profile.firstName}&apos;s digital twin — an AI trained on my CV. Ask me about my
              experience, skills, or what I&apos;m looking for.
            </Bubble>

            {messages.map((m, i) => (
              <Bubble key={i} role={m.role} muted={m.local && m.role === "model"}>
                {m.text}
              </Bubble>
            ))}

            {pending && (
              <div className="flex gap-1 px-1 py-2" aria-label="Twin is typing">
                {[0, 150, 300].map((d) => (
                  <span
                    key={d}
                    className="size-1.5 animate-bounce rounded-full bg-accent"
                    style={{ animationDelay: `${d}ms` }}
                  />
                ))}
              </div>
            )}

            {messages.length === 0 && !pending && (
              <div className="flex flex-wrap gap-2 pt-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => void send(s)}
                    className="border border-line px-3 py-1.5 text-left text-xs text-fg/80 transition-colors hover:border-accent hover:text-accent"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={onSubmit} className="flex gap-2 border-t border-line p-3">
            <label htmlFor="twin-input" className="sr-only">
              Your question
            </label>
            <input
              id="twin-input"
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={MAX_TEXT}
              placeholder="Ask about my experience…"
              autoComplete="off"
              className="min-w-0 flex-1 border border-line bg-bg-elev px-3 py-2.5 text-sm placeholder:text-muted/70 focus:border-accent focus:outline-none"
            />
            <button
              type="submit"
              disabled={pending || !input.trim()}
              aria-label="Send"
              className="bg-accent px-4 font-mono text-sm font-bold text-accent-ink transition-opacity disabled:opacity-40"
            >
              →
            </button>
          </form>
        </div>
      )}
    </>
  );
}

function Bubble({ role, muted, children }: { role: "user" | "model"; muted?: boolean; children: React.ReactNode }) {
  const mine = role === "user";
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <p
        className={`max-w-[85%] px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
          mine
            ? "bg-accent text-accent-ink"
            : muted
              ? "border border-line text-muted"
              : "border border-line bg-bg-elev text-fg/90"
        }`}
      >
        {children}
      </p>
    </div>
  );
}
