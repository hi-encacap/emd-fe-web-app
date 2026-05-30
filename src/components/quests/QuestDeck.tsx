"use client";

import { useLayoutEffect, useState } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { QuestCard } from "./QuestCard";
import { SWIPE, springs } from "@/lib/motion";
import type { CompletionCounts } from "@/features/quests/questSelectors";
import type { Quest } from "@/features/quests/questTypes";

/** Fixed number of mounted card slots. These DOM nodes are created once and
 *  recycled forever — a swipe never mounts or unmounts a card. */
const STACK = 3;

interface QuestDeckProps {
  /** Buffered cards, top first. Should hold at least STACK entries. */
  cards: Quest[];
  counts: CompletionCounts;
  donePulse: boolean;
  onDone: (questId: string) => void;
  onFavorite: (questId: string) => void;
  /** Draw the next card into the buffer (head drops, tail refills). */
  onAdvance: () => void;
}

/**
 * A real, recycling card stack.
 *
 * STACK slots are mounted once (keyed by slot index, never by quest id) and the
 * `drag` prop is constant on every slot, so swiping never creates or destroys a
 * DOM/projection node — the jank source. A swipe only rotates `front` and shifts
 * the data buffer; the thrown card's node is reused as the new bottom card, its
 * content swapped while it sits hidden behind the stack.
 *
 * Slot s shows `cards[depth(s)]` where depth = (s - front) mod STACK. Only the
 * depth-0 slot is interactive; the rest are inert via pointer-events-none.
 */
export function QuestDeck({
  cards,
  counts,
  donePulse,
  onDone,
  onFavorite,
  onAdvance,
}: QuestDeckProps) {
  const [front, setFront] = useState(0);
  if (cards.length === 0) return null;

  const handleThrown = () => {
    // Buffer shift and front rotation batch into one render, keeping every
    // slot's depth→quest mapping consistent as the stack advances.
    onAdvance();
    setFront((value) => (value + 1) % STACK);
  };

  return (
    <div className="relative h-full w-full">
      {Array.from({ length: STACK }, (_, slot) => {
        const depth = (slot - front + STACK) % STACK;
        const quest = cards[depth];
        if (!quest) return null;
        return (
          <DeckSlot
            key={slot}
            quest={quest}
            depth={depth}
            doneCount={counts.get(quest.id) ?? 0}
            donePulse={donePulse && depth === 0}
            onDone={() => onDone(quest.id)}
            onFavorite={() => onFavorite(quest.id)}
            onThrown={handleThrown}
          />
        );
      })}
    </div>
  );
}

interface DeckSlotProps {
  quest: Quest;
  depth: number;
  doneCount: number;
  donePulse: boolean;
  onDone: () => void;
  onFavorite: () => void;
  onThrown: () => void;
}

function DeckSlot({
  quest,
  depth,
  doneCount,
  donePulse,
  onDone,
  onFavorite,
  onThrown,
}: DeckSlotProps) {
  const isFront = depth === 0;
  const reduceMotion = useReducedMotion();
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-240, 240], [-SWIPE.rotate, SWIPE.rotate]);
  const opacity = useTransform(x, [-340, -180, 0, 180, 340], [0, 1, 1, 1, 0]);

  // When this slot rotates off the front, snap x back to 0 while it's hidden
  // behind the stack so it's centered when it later returns to the top. Runs
  // before paint → no flash.
  useLayoutEffect(() => {
    if (!isFront) x.set(0);
  }, [isFront, x]);

  const flyAway = (direction: 1 | -1) => {
    if (reduceMotion) {
      onThrown();
      return;
    }
    const offscreen = direction * (typeof window === "undefined" ? 900 : window.innerWidth * 1.25);
    animate(x, offscreen, { ...springs.release, onComplete: onThrown });
  };

  return (
    <motion.div
      // `drag` stays "x" on every slot (toggling it recreates the projection
      // node); interaction is gated purely by pointer-events.
      className={`absolute inset-0 will-change-transform ${
        isFront ? "cursor-grab active:cursor-grabbing" : "pointer-events-none"
      }`}
      style={{ x, rotate, opacity, zIndex: STACK - depth }}
      animate={{ scale: 1 - depth * 0.04, y: depth * 14 }}
      transition={springs.gentle}
      drag="x"
      dragElastic={0.7}
      onDragEnd={(_event, info) => {
        if (!isFront) return;
        const thrown =
          Math.abs(info.offset.x) > SWIPE.offset || Math.abs(info.velocity.x) > SWIPE.velocity;
        // Throw it off, or spring back to center. (No dragSnapToOrigin: it would
        // fight the flyAway animation and cancel the throw.)
        if (thrown) flyAway(info.offset.x > 0 ? 1 : -1);
        else animate(x, 0, springs.snappy);
      }}
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
