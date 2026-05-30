import type { ReactNode } from "react";
import { Nav } from "./Nav";

/**
 * Persistent app shell: the warm background + soft glow orbs + centered column +
 * header/nav. Rendered once in the layout so it stays put across route changes
 * (only the screen content inside transitions).
 */
export function AppChrome({ children }: { children: ReactNode }) {
  return (
    <main className="bg-surface min-h-screen overflow-hidden text-stone-100">
      <div className="pointer-events-none fixed inset-0 opacity-80">
        <div className="absolute top-[-12rem] left-[-12rem] h-[32rem] w-[32rem] rounded-full bg-amber-500/20 blur-3xl" />
        <div className="absolute right-[-10rem] bottom-[-14rem] h-[34rem] w-[34rem] rounded-full bg-violet-500/20 blur-3xl" />
        <div className="absolute top-[28%] left-[35%] h-[20rem] w-[20rem] rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <section className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <Nav />
        {children}
      </section>
    </main>
  );
}
