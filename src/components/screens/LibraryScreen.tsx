"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { TwoColumn } from "@/components/app/TwoColumn";
import { MiniQuestRow } from "@/components/quests/MiniQuestRow";
import { EmptyState } from "@/components/ui/EmptyState";
import { filterQuests } from "@/features/quests/questSelectors";
import { LIBRARY_FILTERS, type LibraryFilter } from "@/features/quests/questTypes";
import { useDeck } from "@/hooks/useDeck";
import { useQuestActions } from "@/hooks/useQuestActions";

const FILTER_LABELS: Record<LibraryFilter, string> = {
  all: "All",
  favorites: "Favorites",
  notYet: "Not yet",
  done: "Done before",
};

export function LibraryScreen() {
  const { quests, completionCounts, tags } = useDeck();
  const { pickFromLibrary, complete, toggleFavorite } = useQuestActions();

  const [libraryFilter, setLibraryFilter] = useState<LibraryFilter>("all");
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const filteredQuests = useMemo(
    () => filterQuests(quests, completionCounts, { libraryFilter, tagFilter, query }),
    [quests, completionCounts, libraryFilter, tagFilter, query],
  );

  return (
    <TwoColumn
      left={
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">
            Toàn bộ deck
          </h2>

          <div className="flex max-w-xl items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-xl">
            <Search size={18} className="text-stone-500" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm theo tên, prompt hoặc tag..."
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-stone-500"
            />
            {query && (
              <button onClick={() => setQuery("")} className="text-stone-500 hover:text-white">
                <X size={16} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {LIBRARY_FILTERS.map((filter) => (
              <button
                key={filter}
                onClick={() => setLibraryFilter(filter)}
                className={`rounded-full px-4 py-2 text-sm transition ${
                  libraryFilter === filter
                    ? "bg-white text-stone-950"
                    : "border border-white/10 bg-white/5 text-stone-400 hover:text-white"
                }`}
              >
                {FILTER_LABELS[filter]}
              </button>
            ))}
          </div>

          <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => setTagFilter(tagFilter === tag ? null : tag)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs transition ${
                  tagFilter === tag
                    ? "bg-amber-200 text-stone-950"
                    : "border border-white/10 bg-black/20 text-stone-400 hover:text-white"
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      }
      right={
        <div className="max-h-[68vh] space-y-3 overflow-auto pr-1">
          {filteredQuests.length === 0 ? (
            <EmptyState
              title="Không có quest nào khớp"
              description="Thử bỏ filter hoặc đổi từ khóa tìm kiếm."
            />
          ) : (
            filteredQuests.map((quest) => (
              <MiniQuestRow
                key={quest.id}
                quest={quest}
                doneCount={completionCounts.get(quest.id) ?? 0}
                onPick={() => pickFromLibrary(quest.id)}
                onDone={() => complete(quest.id)}
                onFavorite={() => toggleFavorite(quest.id)}
              />
            ))
          )}
        </div>
      }
    />
  );
}
