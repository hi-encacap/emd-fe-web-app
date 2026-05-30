import type { QuestSnapshot } from "@/features/quests/questTypes";

/**
 * Persistence abstraction for the whole deck snapshot. The MVP ships only a
 * localStorage implementation, but anything implementing this interface
 * (IndexedDB, a remote API, Supabase) can be dropped in without touching the
 * store or UI. Async-first so a network-backed impl needs no signature change.
 */
export interface QuestRepository {
  /** Returns the saved snapshot, or null when nothing is stored yet. */
  load(): Promise<QuestSnapshot | null>;
  /** Persists the full snapshot. */
  save(snapshot: QuestSnapshot): Promise<void>;
  /** Removes all persisted data (used by Reset). */
  clear(): Promise<void>;
}
