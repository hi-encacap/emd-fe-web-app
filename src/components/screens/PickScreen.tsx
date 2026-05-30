"use client";

import { AnimatePresence } from "motion/react";
import { Link } from "next-view-transitions";
import { Library, Shuffle } from "lucide-react";
import { TwoColumn } from "@/components/app/TwoColumn";
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

  return (
    <TwoColumn
      left={
        <div className="space-y-6">
          <div className="max-w-2xl space-y-3">
            <p className="text-sm tracking-[0.28em] text-amber-200/80 uppercase">
              Pick a tiny side quest
            </p>
            <h2 className="text-4xl leading-tight font-semibold tracking-[-0.04em] text-white sm:text-6xl">
              Mở lên, bốc một ý tưởng, rồi đi sống một chút.
            </h2>
            <p className="max-w-xl text-base leading-7 text-stone-400">
              Không deadline. Không streak. Không hỏi mất bao lâu. Chỉ cần một gợi ý đủ hay để mày
              muốn làm.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={shuffle}
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-stone-950 shadow-xl shadow-black/20 transition hover:scale-[1.02] active:scale-[0.98]"
            >
              <Shuffle size={17} />
              Shuffle
            </button>
            <Link
              href="/library"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white backdrop-blur-xl transition hover:bg-white/10"
            >
              <Library size={17} />
              Browse deck
            </Link>
          </div>
        </div>
      }
      right={
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
      }
    />
  );
}
