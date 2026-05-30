"use client";

import { useCallback } from "react";
import { useTransitionRouter } from "next-view-transitions";
import { toSnapshot, useQuestStore } from "@/features/quests/questStore";
import { deserialize, serialize } from "@/features/quests/questStorage";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "File không hợp lệ.";
}

export interface ImportOutcome {
  ok: boolean;
  error?: string;
}

/**
 * Facade over the store actions plus the cross-cutting bits screens need:
 * navigating to Pick when choosing from the library, and JSON export/import.
 */
export function useQuestActions() {
  const router = useTransitionRouter();

  const shuffle = useQuestStore((state) => state.shuffle);
  const complete = useQuestStore((state) => state.complete);
  const toggleFavorite = useQuestStore((state) => state.toggleFavorite);
  const reset = useQuestStore((state) => state.reset);
  const pick = useQuestStore((state) => state.pick);
  const replaceSnapshot = useQuestStore((state) => state.replaceSnapshot);

  const pickFromLibrary = useCallback(
    (questId: string) => {
      pick(questId);
      router.push("/");
    },
    [pick, router],
  );

  const exportData = useCallback(() => {
    const json = serialize(toSnapshot(useQuestStore.getState()));
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `mood-deck-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }, []);

  const importData = useCallback(
    async (file: File): Promise<ImportOutcome> => {
      try {
        const text = await file.text();
        replaceSnapshot(deserialize(text));
        return { ok: true };
      } catch (error: unknown) {
        return { ok: false, error: getErrorMessage(error) };
      }
    },
    [replaceSnapshot],
  );

  return {
    shuffle,
    complete,
    toggleFavorite,
    reset,
    pickFromLibrary,
    exportData,
    importData,
  };
}
