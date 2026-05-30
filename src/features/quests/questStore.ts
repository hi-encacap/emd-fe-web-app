import { create } from "zustand";
import { now } from "@/lib/clock";
import { createId } from "@/lib/id";
import { pickRandomQuest } from "./questPicker";
import { buildSeedState } from "./questSeed";
import type { QuestCompletion, QuestSnapshot } from "./questTypes";

interface QuestStoreState extends QuestSnapshot {
  /** False until the persisted deck has loaded on the client (see Providers). */
  _hasHydrated: boolean;

  // lifecycle
  hydrate: (snapshot: QuestSnapshot) => void;
  setHydrated: (value: boolean) => void;

  // actions (all immutable updates)
  shuffle: () => void;
  complete: (questId: string, note?: string) => void;
  toggleFavorite: (questId: string) => void;
  reset: () => void;
  replaceSnapshot: (snapshot: QuestSnapshot) => void;
}

// Deterministic initial state so server and first client render match. The
// persisted deck (if any) is loaded afterwards in an effect.
const seedState = buildSeedState();

export const useQuestStore = create<QuestStoreState>((set, get) => ({
  ...seedState,
  _hasHydrated: false,

  hydrate: (snapshot) => set({ ...snapshot }),
  setHydrated: (value) => set({ _hasHydrated: value }),

  shuffle: () => {
    const { quests, currentQuestId, completions } = get();
    const next = pickRandomQuest(quests, currentQuestId, completions);
    if (next) set({ currentQuestId: next.id });
  },

  complete: (questId, note) => {
    const completion: QuestCompletion = {
      id: createId(),
      questId,
      completedAt: now(),
      ...(note ? { note } : {}),
    };
    set((state) => ({ completions: [completion, ...state.completions] }));
  },

  toggleFavorite: (questId) => {
    set((state) => ({
      quests: state.quests.map((quest) =>
        quest.id === questId
          ? { ...quest, isFavorite: !quest.isFavorite, updatedAt: now() }
          : quest,
      ),
    }));
  },

  reset: () => set({ ...buildSeedState() }),

  replaceSnapshot: (snapshot) => set({ ...snapshot }),
}));

/** Extracts the persistable snapshot from the full store state. */
export function toSnapshot(state: QuestStoreState): QuestSnapshot {
  return {
    quests: state.quests,
    completions: state.completions,
    currentQuestId: state.currentQuestId,
  };
}
