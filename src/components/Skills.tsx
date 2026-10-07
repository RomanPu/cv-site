import GlowCard from "@/components/GlowCard";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import { profile } from "@/data/profile";

export default function Skills() {
  return (
    <section id="skills" className="mx-auto max-w-6xl px-4 py-24 sm:px-6 md:py-32">
      <SectionHeading index={2} title="Skills" heading="Full stack, all the way down to the metal." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {profile.skills.map((group, i) => (
          <Reveal key={group.group} delay={(i % 3) * 100}>
            <GlowCard className="h-full p-6">
              <h3 className="flex items-center justify-between font-mono text-xs tracking-widest text-muted uppercase">
                {group.group}
                <span className="text-accent">{String(group.items.length).padStart(2, "0")}</span>
              </h3>
              <ul className="mt-5 flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="border border-line bg-bg px-2.5 py-1 font-mono text-xs text-fg/90"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </GlowCard>
          </Reveal>
        ))}

        <Reveal delay={200}>
          <GlowCard className="h-full p-6">
            <h3 className="flex items-center justify-between font-mono text-xs tracking-widest text-muted uppercase">
              Languages
              <span className="text-accent">{String(profile.languages.length).padStart(2, "0")}</span>
            </h3>
            <ul className="mt-5 space-y-3">
              {profile.languages.map((lang) => (
                <li key={lang.name} className="flex items-baseline justify-between gap-4">
                  <span className="font-bold">{lang.name}</span>
                  <span className="font-mono text-xs text-muted">{lang.level}</span>
                </li>
              ))}
            </ul>
          </GlowCard>
        </Reveal>
      </div>
    </section>
  );
}
