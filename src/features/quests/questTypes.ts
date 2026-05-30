import { z } from "zod";

/**
 * Domain schemas are the source of truth: Zod validates untrusted input at the
 * storage boundary, and the TypeScript types are inferred from the schemas so
 * the two never drift.
 */

export const questSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  prompt: z.string().min(1),
  tags: z.array(z.string()).default([]),
  isFavorite: z.boolean().default(false),
  archived: z.boolean().default(false),
  // ISO 8601 timestamps. We generate these ourselves via lib/clock, so we keep
  // validation light (non-empty string) rather than coupling to a Zod date API.
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
});

export type Quest = z.infer<typeof questSchema>;

/**
 * A completion is an EVENT, never a boolean. The same quest can be completed
 * many times; "done count" is always derived by counting these events.
 */
export const questCompletionSchema = z.object({
  id: z.string().min(1),
  questId: z.string().min(1),
  completedAt: z.string().min(1),
  note: z.string().optional(),
});

export type QuestCompletion = z.infer<typeof questCompletionSchema>;

/** The full in-memory domain snapshot — also the shape we persist. */
export interface QuestSnapshot {
  quests: Quest[];
  completions: QuestCompletion[];
  currentQuestId: string | null;
}

export const LIBRARY_FILTERS = ["all", "favorites", "notYet", "done"] as const;
export type LibraryFilter = (typeof LIBRARY_FILTERS)[number];

export const TABS = ["pick", "library", "history"] as const;
export type Tab = (typeof TABS)[number];
