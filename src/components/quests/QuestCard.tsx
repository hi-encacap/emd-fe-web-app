"use client";

import { AnimatePresence, motion } from "motion/react";
import { Check, Heart, Shuffle } from "lucide-react";
import type { Quest } from "@/features/quests/questTypes";

interface QuestCardProps {
  quest: Quest;
  doneCount: number;
  onDone: () => void;
  onShuffle: () => void;
  onFavorite: () => void;
  donePulse: boolean;
}

export function QuestCard({
  quest,
  doneCount,
  onDone,
  onShuffle,
  onFavorite,
  donePulse,
}: QuestCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, rotate: -1.5, y: 24 }}
      animate={{ opacity: 1, rotate: 0, y: 0 }}
      exit={{ opacity: 0, rotate: 1.5, y: -18 }}
      transition={{ type: "spring", stiffness: 150, damping: 18 }}
      className="relative mx-auto w-full max-w-xl"
    >
      {/* Deck layers: two cards peeking behind the front face so a single quest
          reads as one card drawn off a stack (the brief's "bốc một lá bài"). */}
      <div
        aria-hidden
        className="rounded-card absolute inset-x-7 -top-6 h-full border border-white/10 bg-stone-100/30 shadow-xl shadow-black/20"
      />
      <div
        aria-hidden
        className="rounded-card absolute inset-x-3.5 -top-3 h-full border border-white/10 bg-stone-100/60 shadow-xl shadow-black/20"
      />

      <div className="rounded-card absolute inset-0 translate-y-4 bg-black/30 blur-xl" />
      <div className="rounded-card relative overflow-hidden border border-white/15 bg-stone-100 p-5 text-stone-950 shadow-2xl shadow-black/30 sm:p-7">
        <div className="absolute top-[-5rem] right-[-5rem] h-44 w-44 rounded-full bg-amber-300/60 blur-3xl" />
        <div className="absolute bottom-[-6rem] left-[-5rem] h-48 w-48 rounded-full bg-violet-300/50 blur-3xl" />

        <div className="relative flex min-h-[30rem] flex-col justify-between gap-8">
          <div className="space-y-8">
            <div className="flex items-start justify-between gap-4">
              <div className="rounded-full bg-stone-950 px-3 py-1.5 text-xs font-semibold tracking-[0.2em] text-stone-100 uppercase">
                Side Quest
              </div>
              <button
                onClick={onFavorite}
                className={`grid h-10 w-10 place-items-center rounded-full border transition ${
                  quest.isFavorite
                    ? "border-rose-300 bg-rose-100 text-rose-600"
                    : "border-stone-300/70 bg-white/40 text-stone-500 hover:text-stone-950"
                }`}
                aria-label="Favorite"
              >
                <Heart size={18} fill={quest.isFavorite ? "currentColor" : "none"} />
              </button>
            </div>

            <div>
              <h2 className="text-4xl leading-[0.95] font-semibold tracking-[-0.055em] sm:text-6xl">
                {quest.title}
              </h2>
              <p className="mt-6 text-lg leading-8 text-stone-700 sm:text-xl">{quest.prompt}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {quest.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-stone-950/5 px-3 py-1.5 text-xs font-medium text-stone-600"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          <div className="relative space-y-4">
            {doneCount > 0 && (
              <p className="text-sm text-stone-500">
                Đã làm <span className="font-semibold text-stone-950">{doneCount}</span> lần. Vẫn
                đáng làm lại.
              </p>
            )}

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-[1fr_auto]">
              <button
                onClick={onDone}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-stone-950 px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-stone-950/20 transition hover:scale-[1.01] active:scale-[0.98]"
              >
                <Check size={18} />
                {doneCount > 0 ? "Did again" : "Done"}
              </button>
              <button
                onClick={onShuffle}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-stone-300 bg-white/45 px-5 py-4 text-sm font-semibold text-stone-700 transition hover:bg-white/70 hover:text-stone-950"
              >
                <Shuffle size={18} />
                Shuffle
              </button>
            </div>

            <AnimatePresence>
              {donePulse && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  className="absolute -top-12 left-0 rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-800 shadow-lg"
                >
                  Ghi nhận rồi ✨
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
