"use client";

import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { QuestCard } from "./QuestCard";
import { SWIPE, springs } from "@/lib/motion";
import type { CompletionCounts } from "@/features/quests/questSelectors";
import type { Quest } from "@/features/quests/questTypes";

interface QuestDeckProps {
  /** Visible cards, top first. cards[0] is interactive; the rest sit behind. */
  cards: Quest[];
  counts: CompletionCounts;
  donePulse: boolean;
  onDone: (questId: string) => void;
  onFavorite: (questId: string) => void;
  /** Draw the next card (called after the top card is thrown off). */
  onAdvance: () => void;
}

const noop = () => {};

export function QuestDeck({
  cards,
  counts,
  donePulse,
  onDone,
  onFavorite,
  onAdvance,
}: QuestDeckProps) {
  const top = cards[0];
  if (!top) return null;

  return (
    <div className="relative mx-auto w-full max-w-xl">
      {/* contact shadow — grounds the deck on a surface instead of floating */}
      <div
        aria-hidden
        className="absolute -bottom-6 left-1/2 h-12 w-4/5 -translate-x-1/2 rounded-[50%] bg-black/55 blur-2xl"
      />

      {/* deepest decorative edge so the stack always reads as a thick deck */}
      <div
        aria-hidden
        className="rounded-card absolute inset-0 translate-y-9 scale-90 border border-black/5 bg-stone-400/80"
      />

      {/* invisible sizer: gives the wrapper the height of the current card so the
          absolutely-positioned stack cards have something to fill */}
      <div aria-hidden className="pointer-events-none invisible">
        <QuestCard
          quest={top}
          doneCount={0}
          donePulse={false}
          onDone={noop}
          onShuffle={noop}
          onFavorite={noop}
        />
      </div>

      {/* live cards: top (draggable) + the next one behind it */}
      {cards.slice(0, 2).map((quest, index) => (
        <StackCard
          key={quest.id}
          quest={quest}
          depth={index}
          isTop={index === 0}
          doneCount={counts.get(quest.id) ?? 0}
          donePulse={index === 0 && donePulse}
          onDone={() => onDone(quest.id)}
          onFavorite={() => onFavorite(quest.id)}
          onAdvance={onAdvance}
        />
      ))}
    </div>
  );
}

interface StackCardProps {
  quest: Quest;
  depth: number;
  isTop: boolean;
  doneCount: number;
  donePulse: boolean;
  onDone: () => void;
  onFavorite: () => void;
  onAdvance: () => void;
}

function StackCard({
  quest,
  depth,
  isTop,
  doneCount,
  donePulse,
  onDone,
  onFavorite,
  onAdvance,
}: StackCardProps) {
  const reduceMotion = useReducedMotion();
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-220, 220], [-SWIPE.rotate, SWIPE.rotate]);
  const opacity = useTransform(x, [-320, -150, 0, 150, 320], [0, 1, 1, 1, 0]);

  const flyAway = (direction: 1 | -1) => {
    if (reduceMotion) {
      onAdvance();
      return;
    }
    const offscreen = direction * (typeof window === "undefined" ? 800 : window.innerWidth);
    animate(x, offscreen, { ...springs.release, onComplete: onAdvance });
  };

  return (
    <motion.div
      className={`absolute inset-0 ${isTop ? "cursor-grab active:cursor-grabbing" : "pointer-events-none"}`}
      style={isTop ? { x, rotate, opacity, zIndex: 20 } : { zIndex: 20 - depth }}
      animate={{ scale: 1 - depth * 0.05, y: depth * 18 }}
      transition={springs.gentle}
      drag={isTop ? "x" : false}
      dragMomentum={false}
      whileDrag={{ scale: 1.02 }}
      onDragEnd={
        isTop
          ? (_event, info) => {
              const thrown =
                Math.abs(info.offset.x) > SWIPE.offset ||
                Math.abs(info.velocity.x) > SWIPE.velocity;
              if (thrown) flyAway(info.offset.x > 0 ? 1 : -1);
              else animate(x, 0, springs.snappy);
            }
          : undefined
      }
    >
      <QuestCard
        quest={quest}
        doneCount={doneCount}
        donePulse={donePulse}
        onDone={onDone}
        onShuffle={() => flyAway(-1)}
        onFavorite={onFavorite}
      />
    </motion.div>
  );
}
