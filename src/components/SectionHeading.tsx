import Reveal from "@/components/Reveal";

type SectionHeadingProps = {
  index: number;
  title: string;
  heading: string;
};

export default function SectionHeading({ index, title, heading }: SectionHeadingProps) {
  const label = `// ${String(index).padStart(2, "0")} — ${title.toUpperCase()}`;
  return (
    <Reveal className="mb-12 md:mb-16">
      <p className="flex items-center gap-4 font-mono text-xs tracking-[0.25em] text-accent">
        {label}
        <span aria-hidden className="h-px max-w-40 flex-1 bg-gradient-to-r from-accent/60 to-transparent" />
      </p>
      <h2 className="mt-4 text-4xl font-bold tracking-tight text-balance sm:text-5xl md:text-6xl">
        {heading}
      </h2>
    </Reveal>
  );
}
