"use client";

import { Link } from "next-view-transitions";
import { usePathname } from "next/navigation";
import { History, Library, Sparkles } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Pick", icon: Sparkles },
  { href: "/library", label: "Library", icon: Library },
  { href: "/history", label: "History", icon: History },
] as const;

/**
 * Thin floating top bar. It sits above the content (fixed, high z) so the Pick
 * deck can run full-bleed underneath it instead of being pushed into a separate
 * boxed region. The pills carry their own blurred backplates so they stay legible
 * over both the cream card and the dark background.
 */
export function Nav() {
  const pathname = usePathname();

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
      <Link
        href="/"
        className="group pointer-events-auto flex items-center gap-2.5 rounded-full border border-white/10 bg-black/30 py-1.5 pr-4 pl-1.5 backdrop-blur-xl transition hover:bg-black/40"
      >
        <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-amber-200 to-rose-300 text-stone-950 shadow-lg shadow-amber-900/30">
          <Sparkles size={16} />
        </span>
        <span className="text-sm font-semibold tracking-wide text-white">Kairos Drift</span>
      </Link>

      <nav className="pointer-events-auto flex rounded-full border border-white/10 bg-black/30 p-1 backdrop-blur-xl">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const selected = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm transition sm:px-4 ${
                selected ? "bg-white text-stone-950" : "text-stone-300 hover:text-white"
              }`}
            >
              <Icon size={16} />
              <span className="hidden sm:inline">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
