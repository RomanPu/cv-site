import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import { profile } from "@/data/profile";

export default function About() {
  return (
    <section id="about" className="mx-auto max-w-6xl px-4 py-24 sm:px-6 md:py-32">
      <SectionHeading index={1} title="About" heading="From the cockpit to the browser." />

      <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-20">
        <div className="space-y-6 text-lg leading-relaxed text-fg/80">
          {profile.summary.map((paragraph, i) => (
            <Reveal key={i} delay={i * 100}>
              <p>{paragraph}</p>
            </Reveal>
          ))}
        </div>

        <dl className="grid grid-cols-3 gap-px self-start border border-line bg-line lg:grid-cols-1">
          {profile.stats.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 100} className="bg-bg p-5 sm:p-6">
              <dt className="sr-only">{stat.label}</dt>
              <dd>
                <span className="block text-5xl font-bold tracking-tighter text-accent sm:text-6xl">
                  {stat.value}
                </span>
                <span className="mt-2 block font-mono text-[11px] tracking-widest text-muted uppercase">
                  {stat.label}
                </span>
              </dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
