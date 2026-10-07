import { profile } from "@/data/profile";

// Static export: the year is fixed at build time (every deploy rebuilds).
export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 font-mono text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          © {year} {profile.name}
        </p>
        <p>
          built with Next.js <span className="text-accent">{"//"}</span> no frameworks were harmed
        </p>
      </div>
    </footer>
  );
}
