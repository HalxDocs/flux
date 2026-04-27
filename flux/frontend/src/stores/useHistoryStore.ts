import { create } from "zustand";
import { ClearHistory, GetHistory } from "../../wailsjs/go/main/App";
import type { models } from "../../wailsjs/go/models";

type HistoryStore = {
  entries: models.HistoryEntry[];
  loaded: boolean;

  load: () => Promise<void>;
  clear: () => Promise<void>;
};

export const useHistoryStore = create<HistoryStore>((set) => ({
  entries: [],
  loaded: false,

  load: async () => {
    const entries = await GetHistory();
    set({ entries, loaded: true });
  },

  clear: async () => {
    await ClearHistory();
    set({ entries: [] });
  },
}));
