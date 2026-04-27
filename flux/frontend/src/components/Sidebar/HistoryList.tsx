import { Trash2 } from "lucide-react";
import { useHistoryStore } from "../../stores/useHistoryStore";
import { useRequestStore } from "../../stores/useRequestStore";
import { useUIStore } from "../../stores/useUIStore";
import { decodePayload } from "../../lib/loadPayload";
import { MethodBadge } from "../shared/MethodBadge";
import { statusColor } from "../../lib/format";
import { cn } from "../../lib/cn";
import type { HttpMethod } from "../../types/request";

export function HistoryList() {
  const entries = useHistoryStore((s) => s.entries);
  const clear = useHistoryStore((s) => s.clear);
  const loadState = useRequestStore((s) => s.loadState);
  const setLoadedRequestID = useUIStore((s) => s.setLoadedRequestID);

  const handleLoad = (entryID: string, payload: { url: string; method: string }) => {
    loadState(decodePayload(payload));
    setLoadedRequestID(null);
    void entryID;
  };

  return (
    <div className="flex flex-col">
      <div className="px-3 pb-1 flex items-center justify-between">
        <button
          type="button"
          onClick={() => {
            if (entries.length && confirm("Clear all history?")) clear();
          }}
          disabled={!entries.length}
          className="text-subtext hover:text-danger disabled:opacity-30 transition-colors p-1 rounded-sm"
          aria-label="Clear history"
          title="Clear history"
        >
          <Trash2 size={12} />
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="px-3 py-2 text-11 text-subtext italic">No history yet.</div>
      ) : (
        entries.map((e) => {
          const code = e.response.statusCode || 0;
          return (
            <button
              key={e.id}
              type="button"
              onClick={() => handleLoad(e.id, e.payload)}
              className="text-left px-3 py-1.5 flex items-center gap-2 hover:bg-cardHover transition-colors"
            >
              <MethodBadge method={(e.payload.method as HttpMethod) || "GET"} />
              <span className="flex-1 text-12 text-text truncate font-mono">
                {shortUrl(e.payload.url)}
              </span>
              <span className={cn("text-11 font-mono font-bold", statusColor(code))}>
                {code || "—"}
              </span>
            </button>
          );
        })
      )}
    </div>
  );
}

function shortUrl(url: string): string {
  if (!url) return "(empty)";
  try {
    const u = new URL(url.includes("://") ? url : `https://${url}`);
    return u.pathname === "/" ? u.host : u.host + u.pathname;
  } catch {
    return url;
  }
}
