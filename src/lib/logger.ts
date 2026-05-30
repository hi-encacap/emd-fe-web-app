/**
 * Minimal logger. Centralized so call sites never use `console.log` directly and
 * the transport can be swapped for a real logging library later.
 */
export const logger = {
  warn(message: string, context?: unknown): void {
    console.warn(message, context ?? "");
  },
  error(message: string, error?: unknown): void {
    console.error(message, error ?? "");
  },
};
