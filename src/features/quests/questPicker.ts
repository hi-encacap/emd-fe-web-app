import type { Quest, QuestCompletion } from "./questTypes";

/** Injectable random source so the picker stays pure and deterministic-testable. */
export type Rng = () => number;

/**
 * Weight rule preserved verbatim from the approved prototype:
 *   current quest  -> 1  (avoid handing back the same card)
 *   never done     -> 5  (favor fresh quests)
 *   favorite       -> 4
 *   otherwise      -> 2
 */
export function questWeight(quest: Quest, doneCount: number, isCurrent: boolean): number {
  if (isCurrent) return 1;
  if (doneCount === 0) return 5;
  if (quest.isFavorite) return 4;
  return 2;
}

/**
 * Picks a random non-archived quest using a weighted pool. Pure: pass the RNG
 * in to control randomness. Returns null when there are no active quests.
 */
export function pickRandomQuest(
  quests: readonly Quest[],
  currentId: string | null,
  completions: readonly QuestCompletion[],
  rng: Rng = Math.random,
): Quest | null {
  const activeQuests = quests.filter((quest) => !quest.archived);
  if (activeQuests.length === 0) return null;

  const completionCount = new Map<string, number>();
  for (const completion of completions) {
    completionCount.set(completion.questId, (completionCount.get(completion.questId) ?? 0) + 1);
  }

  const weightedPool: Quest[] = [];
  for (const quest of activeQuests) {
    const doneCount = completionCount.get(quest.id) ?? 0;
    const weight = questWeight(quest, doneCount, quest.id === currentId);
    for (let i = 0; i < weight; i += 1) {
      weightedPool.push(quest);
    }
  }

  const index = Math.floor(rng() * weightedPool.length);
  return weightedPool[index] ?? activeQuests[0] ?? null;
}
