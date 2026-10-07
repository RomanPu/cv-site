import { cacheLife } from "next/cache";
import { profile } from "@/data/profile";

// Cache Components forbids a bare `new Date()` during prerender; cache it instead.
async function currentYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

export default async function Footer() {
  const year = await currentYear();
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
