import { formatDate } from "@/features/quests/questFormat";
import type { Quest } from "@/features/quests/questTypes";

interface CompletionRowProps {
  quest: Quest;
  completedAt: string;
}

export function CompletionRow({ quest, completedAt }: CompletionRowProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-xl">
      <div className="mb-2 flex items-center justify-between gap-3 text-xs text-stone-500">
        <span>{formatDate(completedAt)}</span>
        <span>done</span>
      </div>
      <h3 className="text-base font-semibold text-white">{quest.title}</h3>
      <p className="mt-2 line-clamp-2 text-sm leading-6 text-stone-400">{quest.prompt}</p>
    </div>
  );
}
