"use client";

import { useState } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type Variants,
} from "motion/react";
import { QuestCard } from "./QuestCard";
import { SWIPE, springs } from "@/lib/motion";
import type { CompletionCounts } from "@/features/quests/questSelectors";
import type { Quest } from "@/features/quests/questTypes";

/** How many cards are visible in the stack at once (front + 2 behind). */
const WINDOW = 3;

interface QuestDeckProps {
  /** Buffered cards, top first. Should hold more than WINDOW so the next card
   *  is always already prepared as data. */
  cards: Quest[];
  counts: CompletionCounts;
  donePulse: boolean;
  onDone: (questId: string) => void;
  onFavorite: (questId: string) => void;
  /** Drop the head and refill the tail. Called the instant a card is released
   *  past threshold — NOT after the throw finishes — so the next card promotes
   *  immediately while the thrown card flies off in parallel. */
  onAdvance: () => void;
}

/**
 * Tinder-style swipe deck.
 *
 * The next card is always already mounted behind the front one (from the
 * buffer), so promotion is instant: on release we advance the buffer right away,
 * which removes the front card's key — AnimatePresence flies it off via its exit
 * variant while the card behind springs from its depth-1 transform to depth-0.
 * The only node that mounts per swipe is the new *back* card, which fades in
 * behind the stack where it isn't watched.
 */
export function QuestDeck({
  cards,
  counts,
  donePulse,
  onDone,
  onFavorite,
  onAdvance,
}: QuestDeckProps) {
  const visible = cards.slice(0, WINDOW);
  // Signed exit distance fed to the leaving card's exit variant via `custom`.
  const [exitX, setExitX] = useState(0);
  if (visible.length === 0) return null;

  const throwCard = (direction: 1 | -1) => {
    const distance = typeof window === "undefined" ? 900 : window.innerWidth * 1.2;
    setExitX(direction * distance);
    onAdvance(); // promote immediately; the leaving card animates out in parallel
  };

  return (
    <div className="relative h-full w-full">
      <AnimatePresence initial={false} custom={exitX}>
        {visible.map((quest, index) => (
          <SwipeCard
            key={quest.id}
            quest={quest}
            depth={index}
            isTop={index === 0}
            doneCount={counts.get(quest.id) ?? 0}
            donePulse={donePulse && index === 0}
            onDone={() => onDone(quest.id)}
            onFavorite={() => onFavorite(quest.id)}
            onThrow={throwCard}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

interface SwipeCardProps {
  quest: Quest;
  depth: number;
  isTop: boolean;
  doneCount: number;
  donePulse: boolean;
  onDone: () => void;
  onFavorite: () => void;
  onThrow: (direction: 1 | -1) => void;
}

function SwipeCard({
  quest,
  depth,
  isTop,
  doneCount,
  donePulse,
  onDone,
  onFavorite,
  onThrow,
}: SwipeCardProps) {
  const reduceMotion = useReducedMotion();
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-240, 240], [-SWIPE.rotate, SWIPE.rotate]);

  const restingScale = 1 - depth * 0.05;
  const restingY = depth * 16;

  const variants: Variants = {
    rest: { scale: restingScale, y: restingY, opacity: 1 },
    enter: { scale: restingScale, y: restingY, opacity: 0 },
    // `distance` comes from AnimatePresence `custom` — the signed throw offset.
    exit: (distance: number) => ({
      x: distance,
      opacity: 0,
      transition: reduceMotion ? { duration: 0 } : springs.release,
    }),
  };

  return (
    <motion.div
      className={`absolute inset-0 will-change-transform ${
        isTop ? "cursor-grab active:cursor-grabbing" : "pointer-events-none"
      }`}
      style={{ x, rotate, zIndex: WINDOW - depth }}
      variants={variants}
      initial="enter"
      animate="rest"
      exit="exit"
      transition={springs.gentle}
      drag={isTop ? "x" : false}
      dragElastic={0.7}
      onDragEnd={(_event, info) => {
        if (!isTop) return;
        const thrown =
          Math.abs(info.offset.x) > SWIPE.offset || Math.abs(info.velocity.x) > SWIPE.velocity;
        if (thrown) onThrow(info.offset.x >= 0 ? 1 : -1);
        else animate(x, 0, springs.snappy);
      }}
    >
      <QuestCard
        quest={quest}
        doneCount={doneCount}
        donePulse={donePulse}
        onDone={onDone}
        onShuffle={() => onThrow(-1)}
        onFavorite={onFavorite}
      />
    </motion.div>
  );
}
