import { create } from "zustand";

export type RequestTab = "params" | "headers" | "body" | "auth";
export type ResponseTab = "body" | "headers";

type UIStore = {
  requestTab: RequestTab;
  responseTab: ResponseTab;
  setRequestTab: (t: RequestTab) => void;
  setResponseTab: (t: ResponseTab) => void;

  saveModalOpen: boolean;
  openSaveModal: () => void;
  closeSaveModal: () => void;

  // Tracks which saved request is currently loaded (so the Save modal can
  // offer "Update existing" vs. "Save as new").
  loadedRequestID: string | null;
  setLoadedRequestID: (id: string | null) => void;
};

export const useUIStore = create<UIStore>((set) => ({
  requestTab: "params",
  responseTab: "body",
  setRequestTab: (requestTab) => set({ requestTab }),
  setResponseTab: (responseTab) => set({ responseTab }),

  saveModalOpen: false,
  openSaveModal: () => set({ saveModalOpen: true }),
  closeSaveModal: () => set({ saveModalOpen: false }),

  loadedRequestID: null,
  setLoadedRequestID: (loadedRequestID) => set({ loadedRequestID }),
}));
