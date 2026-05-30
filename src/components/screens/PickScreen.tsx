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

  // The deck is the whole screen: draw a quest by swiping the top card away, or
  // act on it in place. Everything lives on the card.
  return (
    <div className="relative flex flex-1 items-center justify-center py-4">
      {/* Stage lighting: a warm pool behind the deck turns the surrounding dark
          into intentional negative space rather than empty void. */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-136 w-136 -translate-x-1/2 translate-y-[-55%] rounded-full bg-amber-300/20 blur-[100px]"
      />

      {cards.length > 0 ? (
        <QuestDeck
          cards={cards}
          counts={completionCounts}
          donePulse={donePulse.active}
          onDone={handleDone}
          onFavorite={toggleFavorite}
          onAdvance={advance}
        />
      ) : (
        <div className="w-full max-w-xl">
          <EmptyState
            title="Deck đang trống"
            description="Import lại data hoặc reset ở History để bắt đầu lại."
          />
        </div>
      )}
    </div>
  );
}
