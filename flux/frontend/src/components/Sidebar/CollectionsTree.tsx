import { useState } from "react";
import { ChevronDown, ChevronRight, MoreVertical, Plus, Trash2 } from "lucide-react";
import { useCollectionStore } from "../../stores/useCollectionStore";
import { useRequestStore } from "../../stores/useRequestStore";
import { useUIStore } from "../../stores/useUIStore";
import { decodePayload } from "../../lib/loadPayload";
import { MethodBadge } from "../shared/MethodBadge";
import { cn } from "../../lib/cn";
import type { models } from "../../../wailsjs/go/models";
import type { HttpMethod } from "../../types/request";

export function CollectionsTree() {
  const collections = useCollectionStore((s) => s.collections);
  const expanded = useCollectionStore((s) => s.expanded);
  const toggleExpanded = useCollectionStore((s) => s.toggleExpanded);
  const createCollection = useCollectionStore((s) => s.createCollection);
  const renameCollection = useCollectionStore((s) => s.renameCollection);
  const deleteCollection = useCollectionStore((s) => s.deleteCollection);
  const deleteRequest = useCollectionStore((s) => s.deleteRequest);
  const loadState = useRequestStore((s) => s.loadState);
  const setLoadedRequestID = useUIStore((s) => s.setLoadedRequestID);
  const loadedRequestID = useUIStore((s) => s.loadedRequestID);

  const [renamingID, setRenamingID] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");

  const handleCreate = async () => {
    const trimmed = newName.trim();
    if (!trimmed) {
      setCreating(false);
      return;
    }
    await createCollection(trimmed);
    setNewName("");
    setCreating(false);
  };

  const handleRename = async (id: string) => {
    const trimmed = renameValue.trim();
    if (trimmed) await renameCollection(id, trimmed);
    setRenamingID(null);
  };

  const loadRequest = (req: models.SavedRequest) => {
    loadState(decodePayload(req.payload));
    setLoadedRequestID(req.id);
  };

  return (
    <div className="flex flex-col">
      <div className="px-3 pb-1 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="text-subtext hover:text-violet transition-colors p-1 rounded-sm"
          aria-label="New collection"
          title="New collection"
        >
          <Plus size={12} />
        </button>
      </div>

      {creating && (
        <div className="px-3 py-1">
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={handleCreate}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreate();
              if (e.key === "Escape") {
                setCreating(false);
                setNewName("");
              }
            }}
            placeholder="Collection name"
            className="w-full h-[24px] px-2 bg-surface border border-violet rounded-sm text-12 text-text outline-none"
          />
        </div>
      )}

      {collections.length === 0 && !creating && (
        <div className="px-3 py-2 text-11 text-subtext italic">
          No collections yet.
        </div>
      )}

      {collections.map((c) => {
        const isOpen = expanded[c.id] !== false;
        return (
          <div key={c.id} className="flex flex-col">
            <div className="group px-3 py-1.5 flex items-center gap-1 hover:bg-cardHover transition-colors">
              <button
                type="button"
                onClick={() => toggleExpanded(c.id)}
                className="text-subtext hover:text-text transition-colors"
                aria-label={isOpen ? "Collapse" : "Expand"}
              >
                {isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              </button>
              {renamingID === c.id ? (
                <input
                  autoFocus
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onBlur={() => handleRename(c.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRename(c.id);
                    if (e.key === "Escape") setRenamingID(null);
                  }}
                  className="flex-1 h-[20px] px-1 bg-surface border border-violet rounded-sm text-12 text-text outline-none"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => toggleExpanded(c.id)}
                  className="flex-1 text-left text-12 font-semibold text-text truncate"
                >
                  {c.name}
                </button>
              )}
              <CollectionMenu
                onRename={() => {
                  setRenameValue(c.name);
                  setRenamingID(c.id);
                }}
                onDelete={() => {
                  if (confirm(`Delete collection "${c.name}" and all its requests?`)) {
                    deleteCollection(c.id);
                  }
                }}
              />
            </div>

            {isOpen && c.requests.length === 0 && (
              <div className="pl-7 pr-3 py-1 text-11 text-subtext italic">Empty</div>
            )}

            {isOpen &&
              c.requests.map((req) => (
                <div
                  key={req.id}
                  className={cn(
                    "group pl-6 pr-3 py-1.5 flex items-center gap-2 cursor-pointer transition-colors relative",
                    "hover:bg-cardHover",
                    loadedRequestID === req.id && "bg-card",
                  )}
                  onClick={() => loadRequest(req)}
                >
                  {loadedRequestID === req.id && (
                    <span className="absolute left-0 top-0 bottom-0 w-[2px] bg-violet" />
                  )}
                  <MethodBadge method={(req.payload.method as HttpMethod) || "GET"} />
                  <span className="flex-1 text-12 text-text truncate">{req.name}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete request "${req.name}"?`)) {
                        deleteRequest(req.id);
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 text-subtext hover:text-danger transition-all"
                    aria-label="Delete request"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
          </div>
        );
      })}
    </div>
  );
}

function CollectionMenu({
  onRename,
  onDelete,
}: {
  onRename: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="opacity-0 group-hover:opacity-100 text-subtext hover:text-text transition-all p-1 rounded-sm"
        aria-label="Collection actions"
      >
        <MoreVertical size={12} />
      </button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full mt-1 z-20 bg-card border border-border rounded-md shadow-lg py-1 min-w-[120px]">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onRename();
              }}
              className="w-full px-3 py-1.5 text-left text-12 text-text hover:bg-cardHover"
            >
              Rename
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onDelete();
              }}
              className="w-full px-3 py-1.5 text-left text-12 text-danger hover:bg-cardHover"
            >
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}
