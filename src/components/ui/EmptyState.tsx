import { Sparkles } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-card border border-white/10 bg-white/[0.06] p-8 text-center backdrop-blur-xl">
      <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-white/10 text-stone-300">
        <Sparkles size={20} />
      </div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-stone-400">{description}</p>
    </div>
  );
}
