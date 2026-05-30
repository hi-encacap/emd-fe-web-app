import type { LibraryFilter, Quest, QuestCompletion } from "./questTypes";

export type CompletionCounts = ReadonlyMap<string, number>;

/** How many times each quest has been completed (derived from the event log). */
export function completionCountByQuest(completions: readonly QuestCompletion[]): CompletionCounts {
  const counts = new Map<string, number>();
  for (const completion of completions) {
    counts.set(completion.questId, (counts.get(completion.questId) ?? 0) + 1);
  }
  return counts;
}

/** Unique, sorted tag list across the deck (for the library tag chips). */
export function allTags(quests: readonly Quest[]): string[] {
  return Array.from(new Set(quests.flatMap((quest) => quest.tags))).sort();
}

/** Resolves the active quest, falling back to the first quest. */
export function findCurrentQuest(quests: readonly Quest[], currentId: string | null): Quest | null {
  return quests.find((quest) => quest.id === currentId) ?? quests[0] ?? null;
}

export interface QuestFilter {
  libraryFilter: LibraryFilter;
  tagFilter: string | null;
  query: string;
}

/** Library filtering: status filter + tag chip + free-text search. */
export function filterQuests(
  quests: readonly Quest[],
  counts: CompletionCounts,
  filter: QuestFilter,
): Quest[] {
  const normalizedQuery = filter.query.trim().toLowerCase();

  return quests.filter((quest) => {
    const doneCount = counts.get(quest.id) ?? 0;

    const matchesFilter =
      filter.libraryFilter === "all" ||
      (filter.libraryFilter === "favorites" && quest.isFavorite) ||
      (filter.libraryFilter === "notYet" && doneCount === 0) ||
      (filter.libraryFilter === "done" && doneCount > 0);

    const matchesTag = !filter.tagFilter || quest.tags.includes(filter.tagFilter);

    const matchesQuery =
      !normalizedQuery ||
      quest.title.toLowerCase().includes(normalizedQuery) ||
      quest.prompt.toLowerCase().includes(normalizedQuery) ||
      quest.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery));

    return matchesFilter && matchesTag && matchesQuery;
  });
}
