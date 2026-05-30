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

// Decorative warm/cool wash. A static gradient (not a blur filter) so the card
// rasterizes once and stays cheap to repaint when a recycled slot swaps content.
const GLOW =
  "radial-gradient(120% 75% at 100% 0%, rgba(252,211,77,0.42), transparent 55%)," +
  "radial-gradient(110% 75% at 0% 100%, rgba(196,181,253,0.40), transparent 55%)";

/**
 * The face of a quest card. Purely presentational — drag/stacking live in
 * <QuestDeck>. Fills its slot (`h-full`) and lays out as header / scrollable
 * middle / pinned footer, so the action buttons can never be clipped no matter
 * how long the title, prompt, or "done count" line gets.
 */
export function QuestCard({
  quest,
  doneCount,
  onDone,
  onShuffle,
  onFavorite,
  donePulse,
}: QuestCardProps) {
  return (
    <article className="rounded-card relative flex h-full flex-col overflow-hidden border border-white/15 bg-stone-100 text-stone-950 shadow-2xl shadow-black/50">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: GLOW }}
      />

      <div className="relative flex h-full flex-col gap-5 p-6 sm:p-8">
        {/* header — pinned */}
        <div className="flex shrink-0 items-start justify-between gap-4">
          <span className="rounded-full bg-stone-950 px-3 py-1.5 text-xs font-semibold tracking-[0.2em] text-stone-100 uppercase">
            Side Quest
          </span>
          <button
            onClick={onFavorite}
            className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border transition ${
              quest.isFavorite
                ? "border-rose-300 bg-rose-100 text-rose-600"
                : "border-stone-300/70 bg-white/40 text-stone-500 hover:text-stone-950"
            }`}
            aria-label="Favorite"
          >
            <Heart size={18} fill={quest.isFavorite ? "currentColor" : "none"} />
          </button>
        </div>

        {/* middle — flexes and scrolls internally if a card is unusually tall */}
        <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto">
          <h2 className="text-3xl leading-[0.98] font-semibold tracking-[-0.04em] text-balance sm:text-5xl">
            {quest.title}
          </h2>
          <p className="mt-4 text-base leading-7 text-stone-700 sm:mt-5 sm:text-lg sm:leading-8">
            {quest.prompt}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
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

        {/* footer — pinned, always visible */}
        <div className="relative shrink-0 space-y-3">
          {doneCount > 0 && (
            <p className="text-sm text-stone-500">
              Đã làm <span className="font-semibold text-stone-950">{doneCount}</span> lần. Vẫn đáng
              làm lại.
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
    </article>
  );
}
