import type { ReactNode } from "react";
import { Nav } from "./Nav";

/**
 * Persistent app shell: warm background + soft glow orbs + the floating nav.
 * The nav is fixed and overlays the content, so a screen (e.g. Pick) can run
 * full-bleed beneath it. Rendered once in the layout so it stays put across
 * route changes; only the screen content inside transitions.
 */
export function AppChrome({ children }: { children: ReactNode }) {
  return (
    <div className="bg-surface relative flex min-h-dvh flex-col overflow-hidden text-stone-100">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-[-12rem] left-[-12rem] h-[32rem] w-[32rem] rounded-full bg-amber-500/20 blur-3xl" />
        <div className="absolute right-[-10rem] bottom-[-14rem] h-[34rem] w-[34rem] rounded-full bg-violet-500/20 blur-3xl" />
        <div className="absolute top-[28%] left-[35%] h-[20rem] w-[20rem] rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <Nav />
      <main className="relative flex min-h-dvh flex-col">{children}</main>
    </div>
  );
}
