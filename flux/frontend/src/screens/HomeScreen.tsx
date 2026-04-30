import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  CodeIcon,
  DatabaseIcon,
  FolderLibraryIcon,
  FolderOpenIcon,
  GitBranchIcon,
  GlobalIcon,
  LayersIcon,
  PlusSignIcon,
  ArrowLeft01Icon,
  WorkflowCircle01Icon,
  Layers01Icon,
  ShieldKeyIcon,
  ArrowDataTransferHorizontalIcon,
} from "@hugeicons/core-free-icons";
import { useWorkspaceStore } from "../stores/useWorkspaceStore";
import { useTabsStore } from "../stores/useTabsStore";
import { CreateWorkspaceModal } from "../components/modals/CreateWorkspaceModal";
import { PickFolder } from "../../wailsjs/go/main/App";
import { toast } from "../stores/useToastStore";
import fluxLogo from "../assets/images/fluxloo.jpeg";
import type { workspaces } from "../../wailsjs/go/models";

const FEATURES = [
  {
    icon: DatabaseIcon,
    title: "Local-first",
    desc: "All data lives on your machine as plain JSON. No cloud dependency.",
  },
  {
    icon: FolderLibraryIcon,
    title: "Workspaces",
    desc: "Organise collections and environments by project or team.",
  },
  {
    icon: ArrowDataTransferHorizontalIcon,
    title: "Cross-device sync",
    desc: "Put a workspace folder in Dropbox or Drive — it syncs automatically.",
  },
  {
    icon: CodeIcon,
    title: "Code generation",
    desc: "Copy any request as cURL, JavaScript fetch, or Python requests.",
  },
  {
    icon: LayersIcon,
    title: "Postman import",
    desc: "Drop in a Postman v2.1 JSON and all requests land instantly.",
  },
  {
    icon: ShieldKeyIcon,
    title: "Auth support",
    desc: "Bearer, Basic, and API Key auth — all resolved with env variables.",
  },
  {
    icon: GlobalIcon,
    title: "Environments",
    desc: "Named variable sets with {{VAR}} interpolation across all fields.",
  },
  {
    icon: GitBranchIcon,
    title: "Git-friendly",
    desc: "Every file is human-readable JSON. Commit your workspace to git.",
  },
];

function fmtDate(iso: string): string {
  if (!iso) return "Never opened";
  try {
    const d = new Date(iso);
    const diffDays = Math.floor((Date.now() - d.getTime()) / 86400000);
    if (diffDays === 0) return "Opened today";
    if (diffDays === 1) return "Opened yesterday";
    if (diffDays < 7) return `Opened ${diffDays} days ago`;
    return `Opened ${d.toLocaleDateString()}`;
  } catch {
    return "";
  }
}

function WorkspaceCard({
  ws,
  onOpen,
  busy,
}: {
  ws: workspaces.Info;
  onOpen: (id: string) => void;
  busy: boolean;
}) {
  const initials = ws.name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <button
      type="button"
      onClick={() => !busy && onOpen(ws.id)}
      disabled={busy}
      className="group text-left bg-card border border-border rounded-2xl overflow-hidden hover:border-blue/50 hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue disabled:opacity-60"
    >
      <div className="h-1.5 w-full" style={{ backgroundColor: ws.color || "#3B82F6" }} />
      <div className="p-5 flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <div
            className="w-[44px] h-[44px] rounded-xl flex items-center justify-center text-white text-14 font-bold shrink-0"
            style={{ backgroundColor: ws.color || "#3B82F6" }}
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <div className="text-14 font-semibold text-text truncate leading-tight">{ws.name}</div>
            {ws.description && (
              <div className="text-12 text-subtext truncate mt-0.5">{ws.description}</div>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-11 text-subtext">{fmtDate(ws.lastOpenedAt)}</span>
          <span
            className="flex items-center gap-1 text-11 font-semibold px-2 py-0.5 rounded-full transition-all group-hover:scale-105"
            style={{
              color: ws.color || "#3B82F6",
              backgroundColor: (ws.color || "#3B82F6") + "22",
            }}
          >
            Open
            <HugeiconsIcon icon={ArrowRight01Icon} size={10} color="currentColor" />
          </span>
        </div>
      </div>
    </button>
  );
}

type View = "landing" | "workspaces";

export function HomeScreen({ onEnter }: { onEnter: () => Promise<void> }) {
  const workspaceList = useWorkspaceStore((s) => s.workspaces);
  const switchWs = useWorkspaceStore((s) => s.switch);
  const openFromFolder = useWorkspaceStore((s) => s.openFromFolder);
  const resetTabs = useTabsStore((s) => s.resetTabs);

  const [view, setView] = useState<View>("landing");
  const [createOpen, setCreateOpen] = useState(false);
  const [switching, setSwitching] = useState<string | null>(null);

  const handleOpen = async (id: string) => {
    setSwitching(id);
    try {
      await switchWs(id);
      resetTabs();
      await onEnter();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not open workspace");
      setSwitching(null);
    }
  };

  const handleOpenFolder = async () => {
    try {
      const dir = await PickFolder("Select workspace folder");
      if (!dir) return;
      const info = await openFromFolder(dir);
      await handleOpen(info.id);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not open folder");
    }
  };

  const handleCreated = async () => {
    setCreateOpen(false);
    // The create modal already called onEnter via its own flow
  };

  return (
    <div className="h-screen w-screen bg-bg flex flex-col overflow-hidden">
      {/* Top bar */}
      <header className="h-[56px] px-6 flex items-center justify-between border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          {view === "workspaces" && (
            <button
              type="button"
              onClick={() => setView("landing")}
              className="flex items-center gap-1.5 text-12 text-subtext hover:text-text transition-colors mr-2"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} size={14} color="currentColor" />
              <span>Back</span>
            </button>
          )}
          <img src={fluxLogo} alt="Flux" className="h-[32px] w-auto object-contain" />
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleOpenFolder}
            className="flex items-center gap-2 h-[32px] px-3 text-12 text-subtext bg-card border border-border rounded-lg hover:border-blue/40 hover:text-text transition-all"
          >
            <HugeiconsIcon icon={FolderOpenIcon} size={13} color="currentColor" />
            <span>Open folder</span>
          </button>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 h-[32px] px-4 text-12 font-bold text-white bg-blue hover:bg-blue-hover rounded-lg transition-colors"
          >
            <HugeiconsIcon icon={PlusSignIcon} size={13} color="currentColor" />
            <span>New workspace</span>
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        {view === "landing" ? (
          <LandingView onGoToWorkspaces={() => setView("workspaces")} />
        ) : (
          <WorkspacesView
            workspaces={workspaceList}
            switching={switching}
            onOpen={handleOpen}
            onCreate={() => setCreateOpen(true)}
          />
        )}
      </main>

      <CreateWorkspaceModal
        open={createOpen}
        onClose={handleCreated}
        onEnter={onEnter}
      />
    </div>
  );
}

function LandingView({ onGoToWorkspaces }: { onGoToWorkspaces: () => void }) {
  return (
    <div className="max-w-[900px] mx-auto px-6 py-16 flex flex-col gap-20">
      {/* Hero */}
      <div className="flex flex-col items-center text-center gap-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue/10 border border-blue/20 rounded-full text-11 text-blue font-semibold tracking-wide uppercase">
          <HugeiconsIcon icon={WorkflowCircle01Icon} size={12} color="currentColor" />
          Local-first · No account · No telemetry
        </div>

        <h1 className="text-[42px] font-black text-text leading-tight tracking-tight max-w-[640px]">
          The API client built for{" "}
          <span className="text-blue">developers</span>{" "}
          who hate bloat.
        </h1>

        <p className="text-16 text-subtext max-w-[500px] leading-relaxed">
          Flux is a fast, local-first API client. Your collections, environments,
          and history live on your machine as plain JSON — commit them, sync them,
          or back them up however you like.
        </p>

        <button
          type="button"
          onClick={onGoToWorkspaces}
          className="flex items-center gap-3 h-[48px] px-8 text-15 font-bold text-white bg-blue hover:bg-blue-hover rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue/20"
        >
          <span>Go to workspaces</span>
          <HugeiconsIcon icon={ArrowRight01Icon} size={18} color="currentColor" />
        </button>
      </div>

      {/* Features grid */}
      <div className="flex flex-col gap-6">
        <h2 className="text-11 text-subtext font-semibold uppercase tracking-widest text-center">
          Everything you need, nothing you don't
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3 hover:border-blue/30 transition-colors"
            >
              <div className="w-[36px] h-[36px] rounded-lg bg-blue/10 flex items-center justify-center">
                <HugeiconsIcon icon={f.icon} size={18} color="#3B82F6" strokeWidth={1.5} />
              </div>
              <div>
                <div className="text-12 font-semibold text-text">{f.title}</div>
                <div className="text-11 text-subtext mt-1 leading-relaxed">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sync callout */}
      <div className="bg-card border border-border rounded-2xl p-6 flex items-start gap-4">
        <div className="w-[44px] h-[44px] rounded-xl bg-teal/10 flex items-center justify-center shrink-0">
          <HugeiconsIcon icon={Layers01Icon} size={22} color="#14B8A6" strokeWidth={1.5} />
        </div>
        <div>
          <div className="text-14 font-semibold text-text mb-1">
            Sync to any device — no account needed
          </div>
          <div className="text-12 text-subtext leading-relaxed max-w-[560px]">
            Each workspace is just a folder. Drop it into Dropbox, OneDrive, or Google Drive
            and it syncs automatically. On your second device, open Flux → "Open folder" →
            pick the synced folder. Done. No login, no subscription, no data sent anywhere.
          </div>
        </div>
      </div>
    </div>
  );
}

function WorkspacesView({
  workspaces: wsList,
  switching,
  onOpen,
  onCreate,
}: {
  workspaces: workspaces.Info[];
  switching: string | null;
  onOpen: (id: string) => void;
  onCreate: () => void;
}) {
  return (
    <div className="max-w-[900px] mx-auto px-6 py-10">
      {wsList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-5 text-center">
          <div className="w-[64px] h-[64px] rounded-2xl bg-blue/10 flex items-center justify-center">
            <HugeiconsIcon icon={FolderLibraryIcon} size={32} color="#3B82F6" strokeWidth={1.5} />
          </div>
          <div>
            <div className="text-18 font-bold text-text">No workspaces yet</div>
            <div className="text-13 text-subtext mt-1 max-w-[340px]">
              Create your first workspace to start organising your API collections.
            </div>
          </div>
          <button
            type="button"
            onClick={onCreate}
            className="flex items-center gap-2 h-[40px] px-6 text-13 font-bold text-white bg-blue hover:bg-blue-hover rounded-xl transition-colors"
          >
            <HugeiconsIcon icon={PlusSignIcon} size={15} color="currentColor" />
            Create workspace
          </button>
        </div>
      ) : (
        <>
          <h1 className="text-22 font-bold text-text mb-6">Your workspaces</h1>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
            {wsList.map((ws) => (
              <div key={ws.id} className="relative">
                {switching === ws.id && (
                  <div className="absolute inset-0 z-10 bg-bg/70 rounded-2xl flex items-center justify-center">
                    <div className="w-5 h-5 rounded-full border-2 border-blue border-t-transparent animate-spin" />
                  </div>
                )}
                <WorkspaceCard
                  ws={ws}
                  onOpen={onOpen}
                  busy={switching !== null}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
