import { z } from "zod";
import { CURRENT_SCHEMA_VERSION, migrate } from "./questMigrations";
import { questCompletionSchema, questSchema, type QuestSnapshot } from "./questTypes";

/** localStorage key for the persisted deck. */
export const STORAGE_KEY = "mood-deck-v1";

/** The on-disk shape: a versioned envelope around the domain snapshot. */
export const persistedBlobSchema = z.object({
  schemaVersion: z.number().int().positive(),
  quests: z.array(questSchema),
  completions: z.array(questCompletionSchema),
  currentQuestId: z.string().nullable(),
});

export type PersistedBlob = z.infer<typeof persistedBlobSchema>;

/** Serializes a snapshot into the current versioned envelope. */
export function serialize(snapshot: QuestSnapshot): string {
  const blob: PersistedBlob = {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    quests: snapshot.quests,
    completions: snapshot.completions,
    currentQuestId: snapshot.currentQuestId,
  };
  return JSON.stringify(blob);
}

/**
 * Parses raw stored text into a validated snapshot. localStorage is an
 * untrusted boundary, so we migrate then validate with Zod. Throws on
 * malformed input — callers decide whether to fall back to seed.
 */
export function deserialize(raw: string): QuestSnapshot {
  const parsed: unknown = JSON.parse(raw);
  const migrated = migrate(parsed);
  const blob = persistedBlobSchema.parse(migrated);

  return {
    quests: blob.quests,
    completions: blob.completions,
    currentQuestId: blob.currentQuestId,
  };
}
