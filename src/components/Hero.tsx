import Image from "next/image";
import { profile } from "@/data/profile";

const ticker = profile.skills.flatMap((group) => group.items);

function Portrait() {
  return (
    <div className="relative mx-auto aspect-[4/5] w-56 sm:w-64 lg:w-72">
      {/* Corner brackets */}
      <span aria-hidden className="absolute -top-2 -left-2 size-5 border-t-2 border-l-2 border-accent" />
      <span aria-hidden className="absolute -right-2 -bottom-2 size-5 border-r-2 border-b-2 border-accent" />

      <div className="relative size-full overflow-hidden border border-line bg-bg-elev">
        {profile.photo ? (
          <Image
            src={profile.photo}
            alt={`Portrait of ${profile.name}`}
            fill
            priority
            sizes="(min-width: 1024px) 18rem, 16rem"
            className="object-cover grayscale contrast-125"
          />
        ) : (
          <div className="grid size-full place-items-center bg-[radial-gradient(circle_at_30%_20%,rgb(198_255_0/0.12),transparent_60%)]">
            <span className="text-8xl font-bold tracking-tighter text-accent">{profile.initials}</span>
          </div>
        )}
        <div aria-hidden className="scanlines pointer-events-none absolute inset-0" />
        <div className="absolute inset-x-0 bottom-0 flex justify-between border-t border-line bg-bg/80 px-3 py-2 font-mono text-[10px] tracking-widest text-muted uppercase backdrop-blur-sm">
          <span>{profile.location}</span>
          <span className="flex items-center gap-1.5">
            <span className="size-1.5 animate-pulse rounded-full bg-accent" />
            online
          </span>
        </div>
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <section id="top" className="relative flex min-h-dvh flex-col justify-center pt-16">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_auto] lg:gap-16">
        <div>
          <p className="inline-flex items-center gap-2 border border-accent/30 bg-accent/5 px-3 py-1 font-mono text-xs tracking-wider text-accent">
            <span className="size-1.5 rounded-full bg-accent" />
            Open to full-stack roles
          </p>

          <h1 className="mt-8 leading-[0.85] font-bold tracking-tighter uppercase">
            <span className="block text-[clamp(3.25rem,12vw,8.5rem)]">{profile.firstName}</span>
            <span className="block text-[clamp(3.25rem,12vw,8.5rem)] text-transparent [-webkit-text-stroke:1.5px_var(--fg)]">
              {profile.lastName}
            </span>
          </h1>

          <p className="mt-8 font-mono text-sm text-muted sm:text-base">
            <span className="text-accent">&gt;</span> {profile.role}
            <span className="caret ml-0.5 inline-block h-[1.1em] w-[0.55em] translate-y-[0.15em] bg-accent" />
          </p>
          <p className="mt-4 max-w-xl text-xl text-balance text-fg/90 sm:text-2xl">{profile.headline}</p>

          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href="#projects"
              className="group inline-flex items-center gap-3 bg-accent px-6 py-3 font-mono text-sm font-bold tracking-wider text-accent-ink uppercase transition-transform hover:-translate-y-0.5"
            >
              View projects
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </a>
            <a
              href="#contact"
              className="inline-flex items-center gap-3 border border-line px-6 py-3 font-mono text-sm tracking-wider uppercase transition-colors hover:border-accent hover:text-accent"
            >
              Get in touch
            </a>
          </div>
        </div>

        <Portrait />
      </div>

      {/* Tech ticker */}
      <div className="relative mt-auto overflow-hidden border-y border-line bg-bg-elev/60 py-3" aria-hidden>
        <div className="flex w-max animate-[marquee_40s_linear_infinite] gap-10 font-mono text-xs tracking-widest text-muted uppercase">
          {[...ticker, ...ticker].map((item, i) => (
            <span key={i} className="flex items-center gap-10">
              {item}
              <span className="text-accent">✦</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
