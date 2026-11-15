"use client";

import { indentWithTab } from "@codemirror/commands";
import { python } from "@codemirror/lang-python";
import { indentUnit } from "@codemirror/language";
import { Prec } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { tags as t } from "@lezer/highlight";
import { createTheme } from "@uiw/codemirror-themes";
import CodeMirror from "@uiw/react-codemirror";
import { useEffect, useMemo, useRef, useState } from "react";

const lightTheme = createTheme({
  theme: "light",
  settings: {
    background: "transparent",
    foreground: "#18181b",
    caret: "#4f46e5",
    selection: "#6366f133",
    selectionMatch: "#6366f11f",
    lineHighlight: "#f4f4f580",
    gutterBackground: "transparent",
    gutterForeground: "#a1a1aa",
    gutterBorder: "transparent",
  },
  styles: [
    { tag: [t.keyword, t.controlKeyword, t.operatorKeyword, t.definitionKeyword, t.moduleKeyword], color: "#7c3aed" },
    { tag: [t.string, t.special(t.string)], color: "#047857" },
    { tag: [t.number, t.bool, t.null], color: "#c2410c" },
    { tag: t.comment, color: "#a1a1aa", fontStyle: "italic" },
    { tag: [t.function(t.variableName), t.function(t.propertyName), t.definition(t.function(t.variableName))], color: "#2563eb" },
    { tag: [t.className, t.definition(t.className)], color: "#b45309" },
    { tag: [t.self, t.atom], color: "#be185d" },
  ],
});

const darkTheme = createTheme({
  theme: "dark",
  settings: {
    background: "transparent",
    foreground: "#e4e4e7",
    caret: "#a5b4fc",
    selection: "#6366f140",
    selectionMatch: "#6366f126",
    lineHighlight: "#27272a66",
    gutterBackground: "transparent",
    gutterForeground: "#52525b",
    gutterBorder: "transparent",
  },
  styles: [
    { tag: [t.keyword, t.controlKeyword, t.operatorKeyword, t.definitionKeyword, t.moduleKeyword], color: "#c4b5fd" },
    { tag: [t.string, t.special(t.string)], color: "#86efac" },
    { tag: [t.number, t.bool, t.null], color: "#fdba74" },
    { tag: t.comment, color: "#71717a", fontStyle: "italic" },
    { tag: [t.function(t.variableName), t.function(t.propertyName), t.definition(t.function(t.variableName))], color: "#93c5fd" },
    { tag: [t.className, t.definition(t.className)], color: "#fcd34d" },
    { tag: [t.self, t.atom], color: "#f9a8d4" },
  ],
});

function useIsDark() {
  const [dark, setDark] = useState(true);
  useEffect(() => {
    const el = document.documentElement;
    const update = () => setDark(el.classList.contains("dark"));
    update();
    const obs = new MutationObserver(update);
    obs.observe(el, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);
  return dark;
}

export function CodeEditor({
  value,
  onChange,
  onRun,
  onSubmit,
  className,
  minHeight,
}: {
  value: string;
  onChange: (v: string) => void;
  onRun?: () => void;
  onSubmit?: () => void;
  className?: string;
  minHeight?: string;
}) {
  const dark = useIsDark();
  // Keep the latest callbacks without rebuilding the editor's extensions.
  const handlers = useRef({ onRun, onSubmit });
  handlers.current = { onRun, onSubmit };

  const extensions = useMemo(
    () => [
      python(),
      indentUnit.of("    "),
      EditorView.lineWrapping,
      keymap.of([indentWithTab]),
      Prec.highest(
        keymap.of([
          { key: "Mod-Enter", run: () => (handlers.current.onRun?.(), true) },
          { key: "Mod-Shift-Enter", run: () => (handlers.current.onSubmit?.(), true) },
        ]),
      ),
    ],
    [],
  );

  return (
    <CodeMirror
      value={value}
      onChange={onChange}
      theme={dark ? darkTheme : lightTheme}
      extensions={extensions}
      height="100%"
      minHeight={minHeight}
      className={className}
      basicSetup={{ tabSize: 4, foldGutter: false, highlightActiveLineGutter: true, autocompletion: true }}
    />
  );
}
