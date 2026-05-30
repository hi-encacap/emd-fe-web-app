import { LocalStorageQuestRepository } from "./LocalStorageQuestRepository";
import type { QuestRepository } from "./QuestRepository";

export type { QuestRepository } from "./QuestRepository";

/**
 * The single repository instance the app talks to. Swap this for a remote /
 * IndexedDB implementation to change the persistence backend everywhere.
 */
export const questRepository: QuestRepository = new LocalStorageQuestRepository();
