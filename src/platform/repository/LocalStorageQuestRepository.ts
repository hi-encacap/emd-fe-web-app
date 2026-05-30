import { deserialize, serialize, STORAGE_KEY } from "@/features/quests/questStorage";
import type { QuestSnapshot } from "@/features/quests/questTypes";
import { logger } from "@/lib/logger";
import type { QuestRepository } from "./QuestRepository";

/**
 * localStorage-backed repository. Guards against SSR (no `window`) and private
 * mode / quota errors, and never throws into render — on failure it logs and
 * returns a safe fallback so the app degrades to the seed deck instead of
 * white-screening.
 */
export class LocalStorageQuestRepository implements QuestRepository {
  async load(): Promise<QuestSnapshot | null> {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return deserialize(raw);
    } catch (error) {
      logger.warn("Could not read saved deck; falling back to seed.", error);
      return null;
    }
  }

  async save(snapshot: QuestSnapshot): Promise<void> {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, serialize(snapshot));
    } catch (error) {
      logger.error("Could not save deck.", error);
    }
  }

  async clear(): Promise<void> {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      logger.error("Could not clear saved deck.", error);
    }
  }
}
