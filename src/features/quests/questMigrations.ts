import { now } from "@/lib/clock";

/**
 * Schema versioning for the persisted blob. Bump CURRENT_SCHEMA_VERSION and add
 * a migration whenever the stored shape changes, so existing users' data is
 * upgraded in place instead of being discarded.
 */
export const CURRENT_SCHEMA_VERSION = 1;

type Blob = Record<string, unknown>;

/** A migration upgrades a blob from version N to N+1. Must be pure-ish. */
export type Migration = (blob: Blob) => Blob;

const migrations: Record<number, Migration> = {
  // v0 -> v1: the legacy prototype blob had no schemaVersion and its quests
  // lacked createdAt/updatedAt. Stamp the version and backfill missing fields.
  0: (blob) => {
    const timestamp = now();
    const rawQuests = Array.isArray(blob.quests) ? blob.quests : [];
    const quests = rawQuests.map((quest) => ({
      isFavorite: false,
      archived: false,
      tags: [],
      createdAt: timestamp,
      updatedAt: timestamp,
      ...(quest as Blob),
    }));

    return {
      schemaVersion: 1,
      quests,
      completions: Array.isArray(blob.completions) ? blob.completions : [],
      currentQuestId: typeof blob.currentQuestId === "string" ? blob.currentQuestId : null,
    };
  },
};

/**
 * Runs migrations in sequence from the blob's version up to the current one.
 * Throws if the input isn't an object or a required migration is missing.
 */
export function migrate(raw: unknown): Blob {
  if (typeof raw !== "object" || raw === null) {
    throw new Error("Invalid persisted data: expected an object");
  }

  let blob = raw as Blob;
  let version = typeof blob.schemaVersion === "number" ? blob.schemaVersion : 0;

  while (version < CURRENT_SCHEMA_VERSION) {
    const migration = migrations[version];
    if (!migration) {
      throw new Error(`No migration registered for schema version ${version}`);
    }
    blob = migration(blob);
    version = typeof blob.schemaVersion === "number" ? blob.schemaVersion : version + 1;
  }

  return blob;
}
