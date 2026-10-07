import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import { profile } from "@/data/profile";

const { email, phone, linkedin, github } = profile.contact;

const channels = [
  { label: "Email", value: email, href: `mailto:${email}` },
  { label: "Phone", value: phone, href: `tel:${phone.replace(/[^+\d]/g, "")}` },
  { label: "LinkedIn", value: linkedin.replace(/^https?:\/\/(www\.)?/, ""), href: linkedin },
  { label: "GitHub", value: github.replace(/^https?:\/\//, ""), href: github },
];

const mailto = `mailto:${email}?subject=${encodeURIComponent("Hello Roman — from your portfolio")}`;

export default function Contact() {
  return (
    <section id="contact" className="mx-auto max-w-6xl px-4 py-24 sm:px-6 md:py-32">
      <SectionHeading index={6} title="Contact" heading="Let's build something." />

      <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr] lg:gap-20 [&>*]:min-w-0">
        <Reveal>
          <p className="max-w-xl text-lg leading-relaxed text-fg/75">
            Hiring for a full-stack role, or have a project where performance matters? My inbox is open.
          </p>
          <a
            href={mailto}
            className="group mt-10 flex items-center justify-between gap-6 border border-accent bg-accent/5 p-6 transition-colors hover:bg-accent sm:p-8"
          >
            <span>
              <span className="block font-mono text-xs tracking-widest text-accent uppercase transition-colors group-hover:text-accent-ink">
                {"// say hello"}
              </span>
              <span className="mt-2 block text-2xl font-bold tracking-tight break-all transition-colors group-hover:text-accent-ink sm:text-4xl">
                {email}
              </span>
            </span>
            <span className="text-3xl text-accent transition-all group-hover:translate-x-1 group-hover:text-accent-ink sm:text-5xl">
              →
            </span>
          </a>
        </Reveal>

        <Reveal delay={120}>
          <ul className="divide-y divide-line border-y border-line">
            {channels.map((c) => {
              const external = c.href.startsWith("http");
              return (
                <li key={c.label}>
                  <a
                    href={c.href}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noreferrer" : undefined}
                    className="group flex items-center justify-between gap-4 py-4"
                  >
                    <span className="w-20 shrink-0 font-mono text-xs tracking-widest text-muted uppercase">
                      {c.label}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-right transition-colors group-hover:text-accent">
                      {c.value}
                    </span>
                    <span className="text-muted transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent">
                      ↗
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
