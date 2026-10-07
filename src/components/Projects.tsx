import GlowCard from "@/components/GlowCard";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import { profile, type Project } from "@/data/profile";

function ProjectLink({ href, label }: { href: string; label: string }) {
  const placeholder = href === "#";
  return (
    <a
      href={href}
      target={placeholder ? undefined : "_blank"}
      rel={placeholder ? undefined : "noreferrer"}
      aria-disabled={placeholder || undefined}
      className="font-mono text-xs tracking-widest text-muted uppercase transition-colors hover:text-accent aria-disabled:pointer-events-none aria-disabled:opacity-40"
    >
      {label} ↗
    </a>
  );
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <GlowCard className="group flex h-full flex-col">
      {/* Screen placeholder — swap for a screenshot when available */}
      <div className="relative aspect-[16/10] overflow-hidden border-b border-line bg-bg">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--line)_1px,transparent_1px),linear-gradient(to_bottom,var(--line)_1px,transparent_1px)] bg-[size:24px_24px] opacity-60" />
        <div className="absolute inset-0 grid place-items-center">
          <span className="text-7xl font-bold tracking-tighter text-transparent transition-colors duration-300 [-webkit-text-stroke:1px_var(--muted)] group-hover:[-webkit-text-stroke:1px_var(--accent)]">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>
        <div className="absolute top-3 left-3 flex gap-1.5">
          <span className="size-2 rounded-full bg-line" />
          <span className="size-2 rounded-full bg-line" />
          <span className="size-2 rounded-full bg-accent/70" />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-2xl font-bold tracking-tight transition-colors group-hover:text-accent">
          {project.title}
        </h3>
        <p className="mt-3 flex-1 leading-relaxed text-fg/70">{project.description}</p>
        <ul className="mt-5 flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <li key={tag} className="font-mono text-[11px] text-accent">
              #{tag.toLowerCase().replace(/[^a-z0-9]+/g, "")}
            </li>
          ))}
        </ul>
        <div className="mt-6 flex gap-6 border-t border-line pt-4">
          <ProjectLink href={project.github} label="Code" />
          <ProjectLink href={project.live} label="Live" />
        </div>
      </div>
    </GlowCard>
  );
}

export default function Projects() {
  return (
    <section id="projects" className="mx-auto max-w-6xl px-4 py-24 sm:px-6 md:py-32">
      <SectionHeading index={3} title="Projects" heading="Selected work." />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {profile.projects.map((project, i) => (
          <Reveal key={project.title} delay={i * 120} className="h-full">
            <ProjectCard project={project} index={i} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
