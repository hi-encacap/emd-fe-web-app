/** Formats an ISO timestamp for the History timeline (e.g. "29 thg 5"). */
export function formatDate(value: string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "short",
  }).format(new Date(value));
}
