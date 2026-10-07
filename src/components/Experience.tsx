import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import { profile } from "@/data/profile";

export default function Experience() {
  return (
    <section id="experience" className="mx-auto max-w-6xl px-4 py-24 sm:px-6 md:py-32">
      <SectionHeading index={4} title="Experience" heading="Where I've shipped." />

      <ol className="relative border-l border-line">
        {profile.experience.map((job, i) => (
          <li key={job.company} className="relative pb-16 pl-8 last:pb-0 sm:pl-12">
            <span
              aria-hidden
              className="absolute top-2 -left-[5px] size-[9px] rotate-45 border border-accent bg-bg"
            />
            <Reveal delay={i * 100}>
              <div className="grid gap-4 md:grid-cols-[14rem_1fr] md:gap-10">
                <div className="font-mono text-xs tracking-widest text-muted uppercase">
                  <p className="text-accent">{job.period}</p>
                  <p className="mt-2">{job.location}</p>
                </div>
                <div>
                  <h3 className="text-2xl font-bold tracking-tight sm:text-3xl">{job.role}</h3>
                  <p className="mt-1 text-lg text-fg/60">@ {job.company}</p>
                  <ul className="mt-6 space-y-3">
                    {job.bullets.map((bullet) => (
                      <li key={bullet} className="flex gap-3 leading-relaxed text-fg/75">
                        <span aria-hidden className="mt-[0.7em] h-px w-3 shrink-0 bg-accent" />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>
          </li>
        ))}
      </ol>
    </section>
  );
}
