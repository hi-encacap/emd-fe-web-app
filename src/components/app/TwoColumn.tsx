import type { ReactNode } from "react";

interface TwoColumnProps {
  left: ReactNode;
  right: ReactNode;
}

/**
 * Page container for the Library and History screens: a centered, max-width
 * column with top padding that clears the fixed floating nav. Two columns on
 * desktop (controls + list), stacked on mobile.
 */
export function TwoColumn({ left, right }: TwoColumnProps) {
  return (
    <div className="pt-screen-safe pb-screen-safe mx-auto grid w-full max-w-6xl flex-1 items-start gap-6 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8">
      <section className="min-w-0 space-y-6">{left}</section>
      <aside className="relative min-w-0">{right}</aside>
    </div>
  );
}
