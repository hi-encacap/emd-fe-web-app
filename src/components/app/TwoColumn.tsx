import type { ReactNode } from "react";

interface TwoColumnProps {
  left: ReactNode;
  right: ReactNode;
}

/** The shared two-column layout used by every screen (text/controls + card/list). */
export function TwoColumn({ left, right }: TwoColumnProps) {
  return (
    <div className="grid flex-1 items-start gap-6 py-4 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-10">
      <section className="min-w-0 space-y-6">{left}</section>
      <aside className="relative min-w-0">{right}</aside>
    </div>
  );
}
