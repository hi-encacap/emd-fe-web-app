"use client";

import { useMemo } from "react";
import { useQuestStore } from "@/features/quests/questStore";
import {
  allTags,
  completionCountByQuest,
  findCurrentQuest,
} from "@/features/quests/questSelectors";

/** Derived, memoized deck data read from the store. Shared by every screen. */
export function useDeck() {
  const quests = useQuestStore((state) => state.quests);
  const completions = useQuestStore((state) => state.completions);
  const currentQuestId = useQuestStore((state) => state.currentQuestId);

  const completionCounts = useMemo(() => completionCountByQuest(completions), [completions]);

  const currentQuest = useMemo(
    () => findCurrentQuest(quests, currentQuestId),
    [quests, currentQuestId],
  );

  const tags = useMemo(() => allTags(quests), [quests]);

  const currentDoneCount = currentQuest ? (completionCounts.get(currentQuest.id) ?? 0) : 0;

  return {
    quests,
    completions,
    completionCounts,
    currentQuest,
    currentDoneCount,
    tags,
  };
}
