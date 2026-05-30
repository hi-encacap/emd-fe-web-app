"use client";

import { Check, Heart } from "lucide-react";
import type { Quest } from "@/features/quests/questTypes";

interface MiniQuestRowProps {
  quest: Quest;
  doneCount: number;
  onPick: () => void;
  onDone: () => void;
  onFavorite: () => void;
}

export function MiniQuestRow({ quest, doneCount, onPick, onDone, onFavorite }: MiniQuestRowProps) {
  return (
    <div className="group rounded-3xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-xl transition hover:bg-white/[0.09]">
      <div className="flex items-start justify-between gap-3">
        <button onClick={onPick} className="min-w-0 text-left">
          <h3 className="text-base font-semibold text-white transition group-hover:text-amber-100">
            {quest.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-stone-400">{quest.prompt}</p>
        </button>
        <button
          onClick={onFavorite}
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-full transition ${
            quest.isFavorite
              ? "bg-rose-400/20 text-rose-200"
              : "bg-white/5 text-stone-500 hover:text-white"
          }`}
          aria-label="Favorite"
        >
          <Heart size={16} fill={quest.isFavorite ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {quest.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-white/5 px-2.5 py-1 text-[11px] text-stone-400"
            >
              #{tag}
            </span>
          ))}
        </div>
        <button
          onClick={onDone}
          className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-stone-950 transition hover:scale-[1.02] active:scale-[0.98]"
        >
          <Check size={13} />
          {doneCount > 0 ? `${doneCount}x` : "Done"}
        </button>
      </div>
    </div>
  );
}
