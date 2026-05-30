/**
 * Centralized id generator. `crypto.randomUUID` is available in modern browsers
 * and Node 20+. Wrapped so the source can change without touching call sites.
 */
export function createId(): string {
  return crypto.randomUUID();
}
