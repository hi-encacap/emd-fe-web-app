/**
 * Centralized time source. Kept tiny and swappable so timestamps come from one
 * place (and could be made injectable for deterministic behavior later).
 */
export function now(): string {
  return new Date().toISOString();
}
