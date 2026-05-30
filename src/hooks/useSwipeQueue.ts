"use client";

import { useCallback, useState } from "react";
import { pickRandomQuest } from "@/features/quests/questPicker";
import { useQuestStore } from "@/features/quests/questStore";
import type { Quest } from "@/features/quests/questTypes";

/** How many real cards are kept live in the stack (top + the one behind it). */
const WINDOW = 2;

function activeQuests(quests: readonly Quest[]): Quest[] {
  return quests.filter((quest) => !quest.archived);
}

/**
 * Deterministic initial queue (SSR-safe — no randomness): the current quest on
 * top, then the next active quests in order. Random/weighted picks only happen
 * later on user-driven advances.
 */
function buildInitialQueue(quests: readonly Quest[], headId: string | null): string[] {
  const active = activeQuests(quests);
  if (active.length === 0) return [];

  const head = active.find((quest) => quest.id === headId) ?? active[0];
  const ids = head ? [head.id] : [];
  for (const quest of active) {
    if (ids.length >= WINDOW) break;
    if (!ids.includes(quest.id)) ids.push(quest.id);
  }
  return ids;
}

/**
 * Manages the upcoming-card queue behind the Tinder-style deck. Keeping a stable
 * list of ids (not freshly-picked-per-render) gives every card a stable React
 * key, so flinging the top card reveals the real next card, which then promotes.
 */
export function useSwipeQueue() {
  const quests = useQuestStore((state) => state.quests);
  const completions = useQuestStore((state) => state.completions);
  const currentQuestId = useQuestStore((state) => state.currentQuestId);
  const pick = useQuestStore((state) => state.pick);

  const [queue, setQueue] = useState<string[]>(() => buildInitialQueue(quests, currentQuestId));

  // Rebuild when the deck is replaced (reset/import) or the current quest is set
  // from outside the deck (e.g. "pick from library"). Done during render via
  // React's "adjust state on prop change" pattern rather than an effect, so it
  // doesn't trigger a cascading-render setState-in-effect. It converges because
  // buildInitialQueue always puts the current quest at the head.
  const headMissing = queue[0] == null || !quests.some((q) => q.id === queue[0]);
  const headDesynced =
    currentQuestId != null &&
    queue[0] !== currentQuestId &&
    quests.some((q) => q.id === currentQuestId && !q.archived);
  if (headMissing || headDesynced) {
    setQueue(buildInitialQueue(quests, currentQuestId));
  }

  const cards = queue
    .map((id) => quests.find((quest) => quest.id === id))
    .filter((quest): quest is Quest => Boolean(quest));

  const advance = useCallback(() => {
    const rest = queue.slice(1);
    const next = pickRandomQuest(quests, queue[0] ?? null, completions);

    let nextId = next?.id ?? null;
    // Avoid showing a card that's already visible behind the top one.
    if (nextId && rest.includes(nextId)) {
      const alt = activeQuests(quests).find((q) => q.id !== queue[0] && !rest.includes(q.id));
      nextId = alt?.id ?? nextId;
    }

    const newQueue = (nextId ? [...rest, nextId] : rest).slice(0, WINDOW);
    setQueue(newQueue);
    // Sync the store's current quest to the new top in the same batch so the
    // reconcile effect above doesn't treat this as an external change.
    if (newQueue[0]) pick(newQueue[0]);
  }, [queue, quests, completions, pick]);

  return { cards, advance };
}
