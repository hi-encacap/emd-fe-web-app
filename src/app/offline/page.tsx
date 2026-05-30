import { EmptyState } from "@/components/ui/EmptyState";

// Shown by the service worker when a navigation is requested with no network
// and no cached copy of that route. Kept inside the normal app chrome.
export default function OfflinePage() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 pt-20 pb-5">
      <div className="w-full max-w-md">
        <EmptyState
          title="Mày đang offline"
          description="Chưa có mạng. Kết nối lại rồi mở lên bốc tiếp một quest nhé."
        />
      </div>
    </div>
  );
}
