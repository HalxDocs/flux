import { useEffect } from "react";
import { Sidebar } from "./components/Sidebar/Sidebar";
import { RequestPanel } from "./components/RequestPanel/RequestPanel";
import { ResponsePane } from "./components/ResponsePane/ResponsePane";
import { SaveRequestModal } from "./components/modals/SaveRequestModal";
import { useSendRequest } from "./hooks/useSendRequest";
import { useCollectionStore } from "./stores/useCollectionStore";
import { useHistoryStore } from "./stores/useHistoryStore";
import "./App.css";

export default function App() {
  const send = useSendRequest();
  const loadCollections = useCollectionStore((s) => s.load);
  const loadHistory = useHistoryStore((s) => s.load);

  useEffect(() => {
    void loadCollections();
    void loadHistory();
  }, [loadCollections, loadHistory]);

  return (
    <div className="h-screen w-screen flex bg-bg text-text">
      <Sidebar />
      <RequestPanel onSend={send} />
      <ResponsePane />
      <SaveRequestModal />
    </div>
  );
}
