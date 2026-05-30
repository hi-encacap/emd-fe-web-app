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

  // Full-bleed stage: the deck owns the whole viewport (under the floating nav),
  // so it reads as "the screen is the deck" rather than a card boxed in the dark.
  return (
    <div className="relative flex flex-1 justify-center px-3 pt-20 pb-4 sm:items-center sm:p-6 sm:pt-20">
      {/* Warm pool behind the deck so any space around it is a lit scene, not void. */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-136 w-136 -translate-x-1/2 translate-y-[-50%] rounded-full bg-amber-300/15 blur-[110px]"
      />

      {cards.length > 0 ? (
        <div className="h-full w-full max-w-xl sm:h-[min(82dvh,46rem)]">
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
        <div className="flex w-full max-w-xl items-center">
          <EmptyState
            title="Deck đang trống"
            description="Import lại data hoặc reset ở History để bắt đầu lại."
          />
        </div>
      )}
    </div>
  );
}
