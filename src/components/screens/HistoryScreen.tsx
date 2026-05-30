"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { Download, RotateCcw, Upload } from "lucide-react";
import { TwoColumn } from "@/components/app/TwoColumn";
import { CompletionRow } from "@/components/quests/CompletionRow";
import { EmptyState } from "@/components/ui/EmptyState";
import { useDeck } from "@/hooks/useDeck";
import { useQuestActions } from "@/hooks/useQuestActions";

export function HistoryScreen() {
  const { quests, completions } = useDeck();
  const { reset, exportData, importData } = useQuestActions();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const handleImportFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const outcome = await importData(file);
    setImportError(outcome.ok ? null : (outcome.error ?? "Import thất bại."));
  };

  return (
    <TwoColumn
      left={
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">
            Những lần đã sống thử
          </h2>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={exportData}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-stone-300 transition hover:bg-white/10 hover:text-white"
            >
              <Download size={15} />
              Export data
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-stone-300 transition hover:bg-white/10 hover:text-white"
            >
              <Upload size={15} />
              Import data
            </button>
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-stone-300 transition hover:bg-white/10 hover:text-white"
            >
              <RotateCcw size={15} />
              Reset data
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              onChange={handleImportFile}
              className="hidden"
            />
          </div>

          {importError && (
            <p className="text-sm text-rose-300" role="alert">
              {importError}
            </p>
          )}
        </div>
      }
      right={
        <div className="max-h-[68vh] space-y-3 overflow-auto pr-1">
          {completions.length === 0 ? (
            <EmptyState
              title="Chưa có history"
              description="Pick một quest, làm ngoài đời, rồi quay lại bấm Done."
            />
          ) : (
            completions.map((completion) => {
              const quest = quests.find((item) => item.id === completion.questId);
              if (!quest) return null;
              return (
                <CompletionRow
                  key={completion.id}
                  quest={quest}
                  completedAt={completion.completedAt}
                />
              );
            })
          )}
        </div>
      }
    />
  );
}
