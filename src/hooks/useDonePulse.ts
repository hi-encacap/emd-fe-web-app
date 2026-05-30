"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const PULSE_DURATION_MS = 900;

/** Drives the brief "Ghi nhận rồi ✨" confirmation pulse after a completion. */
export function useDonePulse(duration: number = PULSE_DURATION_MS) {
  const [active, setActive] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const trigger = useCallback(() => {
    setActive(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setActive(false), duration);
  }, [duration]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return { active, trigger };
}
