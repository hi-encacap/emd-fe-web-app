"use client";

import { Link } from "next-view-transitions";
import { usePathname } from "next/navigation";
import { History, Library, Sparkles } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Pick", icon: Sparkles },
  { href: "/library", label: "Library", icon: Library },
  { href: "/history", label: "History", icon: History },
] as const;

export function Nav() {
  const pathname = usePathname();

  return (
    <header className="flex items-center justify-between gap-4 py-2">
      <Link
        href="/"
        className="group flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 py-2 backdrop-blur-xl transition hover:bg-white/10"
      >
        <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-amber-200 to-rose-300 text-stone-950 shadow-lg shadow-amber-900/30">
          <Sparkles size={18} />
        </div>
        <div className="text-left">
          <h1 className="text-sm font-semibold tracking-wide text-white sm:text-base">Mood Deck</h1>
          <p className="hidden text-xs text-stone-400 sm:block">Tiny quests. No pressure.</p>
        </div>
      </Link>

      <nav className="flex rounded-full border border-white/10 bg-black/20 p-1 backdrop-blur-xl">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const selected = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm transition sm:px-4 ${
                selected ? "bg-white text-stone-950" : "text-stone-400 hover:text-white"
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
