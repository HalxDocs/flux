import { Folder, Globe, History as HistoryIcon, Settings } from "lucide-react";
import { CollectionsTree } from "./CollectionsTree";
import { HistoryList } from "./HistoryList";

export function Sidebar() {
  return (
    <aside className="w-[240px] shrink-0 h-full bg-surface border-r border-border flex flex-col">
      <div className="h-[48px] px-4 flex items-center border-b border-border">
        <span className="font-extrabold text-20 text-violet tracking-tight">FLUX</span>
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        <Section icon={<Folder size={12} />} label="Collections">
          <CollectionsTree />
        </Section>

        <Section icon={<Globe size={12} />} label="Environments">
          <div className="px-3 py-2 text-11 text-subtext italic">
            Environments arrive in Phase 1F.
          </div>
        </Section>

        <Section icon={<HistoryIcon size={12} />} label="History">
          <HistoryList />
        </Section>
      </nav>

      <div className="border-t border-border h-[40px] px-3 flex items-center">
        <button
          type="button"
          className="flex items-center gap-2 text-subtext hover:text-text transition-colors"
        >
          <Settings size={14} />
          <span className="text-12">Settings</span>
        </button>
      </div>
    </aside>
  );
}

function Section({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="pb-3">
      <div className="px-3 py-2 flex items-center gap-2 text-subtext text-11 font-semibold uppercase tracking-wider">
        {icon}
        <span>{label}</span>
      </div>
      {children}
    </div>
  );
}
