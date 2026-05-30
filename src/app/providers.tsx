"use client";

import { useEffect, type ReactNode } from "react";
import { ServiceWorkerRegistrar } from "@/components/pwa/ServiceWorkerRegistrar";
import { toSnapshot, useQuestStore } from "@/features/quests/questStore";
import { questRepository } from "@/platform/repository";

/**
 * Client-only persistence wiring:
 *  - on mount, load the saved deck from the repository and hydrate the store;
 *  - after hydration, persist the snapshot on every domain change.
 *
 * The store starts from the deterministic seed, so the first client render
 * matches the server (no hydration mismatch); persisted data appears post-mount.
 */
export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    let active = true;

    void questRepository.load().then((snapshot) => {
      if (!active) return;
      if (snapshot) useQuestStore.getState().hydrate(snapshot);
      useQuestStore.getState().setHydrated(true);
    });

    const unsubscribe = useQuestStore.subscribe((state) => {
      if (!state._hasHydrated) return;
      void questRepository.save(toSnapshot(state));
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return (
    <>
      <ServiceWorkerRegistrar />
      {children}
    </>
  );
}
