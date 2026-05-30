/**
 * Shared motion tokens so animation values live in one place (no inline magic
 * numbers scattered across components).
 */

export const springs = {
  /** Quick settle, e.g. snapping a dragged card back to center. */
  snappy: { type: "spring", stiffness: 500, damping: 34 },
  /** Soft promote/reposition, e.g. a card rising up the stack. */
  gentle: { type: "spring", stiffness: 260, damping: 28 },
  /** Throw release, e.g. a card flung off the deck. */
  release: { type: "spring", stiffness: 200, damping: 28 },
} as const;

/** Swipe thresholds for the Tinder-style deck. */
export const SWIPE = {
  /** Min horizontal drag distance (px) to count as a deliberate throw. */
  offset: 100,
  /** Min horizontal velocity (px/s) to count as a flick. */
  velocity: 500,
  /** Max card tilt (deg) at full drag. */
  rotate: 14,
} as const;
