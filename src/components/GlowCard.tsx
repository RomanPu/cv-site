"use client";

import type { PointerEvent, ReactNode } from "react";

type GlowCardProps = {
  children: ReactNode;
  className?: string;
};

/** Bordered card with a lime glow that follows the pointer. */
export default function GlowCard({ children, className = "" }: GlowCardProps) {
  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--x", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--y", `${e.clientY - rect.top}px`);
  }

  return (
    <div
      onPointerMove={onPointerMove}
      className={`glow-card border border-line bg-bg-elev/70 transition-colors duration-300 hover:border-accent/60 ${className}`}
    >
      {children}
    </div>
  );
}
