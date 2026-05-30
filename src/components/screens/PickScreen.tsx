"use client";

import { AnimatePresence } from "motion/react";
import { QuestCard } from "@/components/quests/QuestCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { useDeck } from "@/hooks/useDeck";
import { useDonePulse } from "@/hooks/useDonePulse";
import { useQuestActions } from "@/hooks/useQuestActions";

export function PickScreen() {
  const { currentQuest, currentDoneCount } = useDeck();
  const { shuffle, complete, toggleFavorite } = useQuestActions();
  const donePulse = useDonePulse();

  const handleDone = () => {
    if (!currentQuest) return;
    complete(currentQuest.id);
    donePulse.trigger();
  };

  // The card is the whole screen: open the app, see one quest, act on it.
  // Everything the user needs (shuffle, done, favorite) lives on the card.
  return (
    <div className="flex flex-1 items-center justify-center py-4">
      <div className="w-full max-w-xl">
        <AnimatePresence mode="wait">
          {currentQuest ? (
            <QuestCard
              key={currentQuest.id}
              quest={currentQuest}
              doneCount={currentDoneCount}
              onDone={handleDone}
              onShuffle={shuffle}
              onFavorite={() => toggleFavorite(currentQuest.id)}
              donePulse={donePulse.active}
            />
          ) : (
            <EmptyState
              title="Deck đang trống"
              description="Import lại data hoặc reset ở History để bắt đầu lại."
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
