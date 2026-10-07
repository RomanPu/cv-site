import GlowCard from "@/components/GlowCard";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import { profile } from "@/data/profile";

export default function Education() {
  return (
    <section id="education" className="mx-auto max-w-6xl px-4 py-24 sm:px-6 md:py-32">
      <SectionHeading index={5} title="Education" heading="Always compiling." />
      <div className="grid gap-4 md:grid-cols-3">
        {profile.education.map((edu, i) => (
          <Reveal key={edu.school} delay={i * 100} className="h-full">
            <GlowCard className="flex h-full flex-col p-6">
              <p className="font-mono text-xs tracking-widest text-accent">{edu.period}</p>
              <h3 className="mt-4 text-xl font-bold tracking-tight">{edu.school}</h3>
              <p className="mt-2 text-fg/65">{edu.credential}</p>
            </GlowCard>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
