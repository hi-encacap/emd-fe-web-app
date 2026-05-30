import { z } from "zod";
import { now } from "@/lib/clock";
import seedData from "./data/quests.seed.json";
import type { QuestSnapshot } from "./questTypes";

/**
 * The seed file only carries the editable content fields. Runtime fields
 * (isFavorite/archived/timestamps) are added when the deck is first built, so
 * the JSON stays easy to hand-edit.
 */
const seedQuestSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  prompt: z.string().min(1),
  tags: z.array(z.string()).min(1),
});

const seedQuestsSchema = z.array(seedQuestSchema).min(1);

export type SeedQuest = z.infer<typeof seedQuestSchema>;

export function getSeedQuests(): SeedQuest[] {
  return seedQuestsSchema.parse(seedData);
}

/** Builds the initial deck state used on first launch and on reset. */
export function buildSeedState(): QuestSnapshot {
  const timestamp = now();
  const quests = getSeedQuests().map((seed) => ({
    ...seed,
    isFavorite: false,
    archived: false,
    createdAt: timestamp,
    updatedAt: timestamp,
  }));

  return {
    quests,
    completions: [],
    currentQuestId: quests[0]?.id ?? null,
  };
}
