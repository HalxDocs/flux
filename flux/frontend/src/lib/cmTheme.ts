import { EditorView } from "@codemirror/view";

export const fluxCmTheme = EditorView.theme({
  "&": {
    backgroundColor: "#0D0D0D",
    fontSize: "12px",
    fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace",
    height: "100%",
  },
  ".cm-gutters": {
    backgroundColor: "#0D0D0D",
    color: "#888888",
    border: "none",
  },
  ".cm-content": {
    caretColor: "#3B82F6",
  },
  ".cm-activeLine": { backgroundColor: "#141414" },
  ".cm-activeLineGutter": { backgroundColor: "#141414" },
  ".cm-scroller": { overflow: "auto" },
  ".cm-selectionBackground, ::selection": {
    backgroundColor: "rgba(59, 130, 246, 0.25)",
  },
});
