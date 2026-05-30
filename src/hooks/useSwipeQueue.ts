"use client";

import { useCallback, useState } from "react";
import { pickRandomQuest } from "@/features/quests/questPicker";
import { useQuestStore } from "@/features/quests/questStore";
import type { Quest } from "@/features/quests/questTypes";

/** Ids kept ready in the buffer so a swipe always has the next cards prepared. */
const BUFFER = 5;

function activeQuests(quests: readonly Quest[]): Quest[] {
  return quests.filter((quest) => !quest.archived);
}

/**
 * Deterministic initial buffer (SSR-safe — no randomness): the head quest, then
 * the next active quests in order. Random/weighted picks only happen on advance.
 */
function buildBuffer(quests: readonly Quest[], headId: string | null): string[] {
  const active = activeQuests(quests);
  if (active.length === 0) return [];

  const head = active.find((quest) => quest.id === headId) ?? active[0];
  const ids = head ? [head.id] : [];
  for (const quest of active) {
    if (ids.length >= BUFFER) break;
    if (!ids.includes(quest.id)) ids.push(quest.id);
  }
  return ids;
}

/**
 * Owns the upcoming-card buffer behind the swipe deck.
 *
 * Why a buffer: <QuestDeck> recycles a fixed pool of mounted cards, so it always
 * needs the next quests ready as plain data. `advance` drops the head and refills
 * the tail; the deck rotates which mounted slot is on top in the same render, so
 * no card ever mounts or unmounts on a swipe.
 *
 * Crucially, advancing does NOT touch the store, so there is no per-swipe
 * localStorage write (that synchronous serialize was the main source of jank).
 * The store's `currentQuestId` is only read as the cross-screen "library picked
 * this" signal; we reconcile to it during render when it actually changes.
 */
export function useSwipeQueue() {
  const quests = useQuestStore((state) => state.quests);
  const completions = useQuestStore((state) => state.completions);
  const currentQuestId = useQuestStore((state) => state.currentQuestId);

  const [buffer, setBuffer] = useState<string[]>(() => buildBuffer(quests, currentQuestId));
  // Track the last-seen external current id in state (not a ref) so we can detect
  // an external pick during render — React's sanctioned "adjust state on prop
  // change" pattern. https://react.dev/reference/react/useState#storing-information-from-previous-renders
  const [lastCurrent, setLastCurrent] = useState(currentQuestId);

  // Reconcile during render when the deck content is replaced externally: a
  // fresh library pick, or a reset/import that invalidates the buffered ids.
  const externalPick = currentQuestId !== lastCurrent;

  const bufferValid =
    buffer.length > 0 && buffer.every((id) => quests.some((quest) => quest.id === id));
  const needsExternalReset =
    externalPick &&
    currentQuestId != null &&
    buffer[0] !== currentQuestId &&
    activeQuests(quests).some((quest) => quest.id === currentQuestId);

  if (externalPick) setLastCurrent(currentQuestId);
  if (!bufferValid || needsExternalReset) {
    setBuffer(buildBuffer(quests, currentQuestId));
  }

  const cards = buffer
    .map((id) => quests.find((quest) => quest.id === id))
    .filter((quest): quest is Quest => Boolean(quest));

  const advance = useCallback(() => {
    setBuffer((prev) => {
      const rest = prev.slice(1);
      const next = pickRandomQuest(quests, prev[0] ?? null, completions);

      let nextId = next?.id ?? null;
      // Don't queue a card that's already waiting in the buffer.
      if (nextId && rest.includes(nextId)) {
        const alt = activeQuests(quests).find(
          (quest) => quest.id !== prev[0] && !rest.includes(quest.id),
        );
        nextId = alt?.id ?? nextId;
      }

      return (nextId ? [...rest, nextId] : rest).slice(0, BUFFER);
    });
  }, [quests, completions]);

  return { cards, advance };
}
