"use client";

import { QuestDeck } from "@/components/quests/QuestDeck";
import { EmptyState } from "@/components/ui/EmptyState";
import { useDeck } from "@/hooks/useDeck";
import { useDonePulse } from "@/hooks/useDonePulse";
import { useQuestActions } from "@/hooks/useQuestActions";
import { useSwipeQueue } from "@/hooks/useSwipeQueue";

export function PickScreen() {
  const { completionCounts } = useDeck();
  const { cards, advance } = useSwipeQueue();
  const { complete, toggleFavorite } = useQuestActions();
  const donePulse = useDonePulse();

  const handleDone = (questId: string) => {
    complete(questId);
    donePulse.trigger();
  };

  // A definite viewport-height stage (not min-height) so the deck and card can
  // resolve `h-full` and never collapse/clip. pt clears the floating nav.
  return (
    <section className="relative flex h-dvh items-center justify-center px-4 pt-20 pb-5">
      {/* Warm pool so the space around the deck reads as a lit scene, not a void. */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-136 w-136 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-300/15 blur-[110px]"
      />

      {cards.length > 0 ? (
        <div className="relative h-full max-h-168 w-full max-w-md">
          <QuestDeck
            cards={cards}
            counts={completionCounts}
            donePulse={donePulse.active}
            onDone={handleDone}
            onFavorite={toggleFavorite}
            onAdvance={advance}
          />
        </div>
      ) : (
        <div className="w-full max-w-md">
          <EmptyState
            title="Deck đang trống"
            description="Import lại data hoặc reset ở History để bắt đầu lại."
          />
        </div>
      )}
    </section>
  );
}
