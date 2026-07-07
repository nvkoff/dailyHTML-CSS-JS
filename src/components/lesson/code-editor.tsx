"use client";

import CodeMirror from "@uiw/react-codemirror";
import { css } from "@codemirror/lang-css";
import { html } from "@codemirror/lang-html";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorView } from "@codemirror/view";
import { useMemo } from "react";

type Lang = "css" | "html" | "js";

export function CodeEditor({
  value,
  onChange,
  language,
  readOnly,
  height = "220px",
}: {
  value: string;
  onChange?: (v: string) => void;
  language: Lang;
  readOnly?: boolean;
  height?: string;
}) {
  const extensions = useMemo(() => {
    const lang = language === "css" ? css() : language === "html" ? html() : javascript();
    return [lang, EditorView.lineWrapping];
  }, [language]);

  return (
    <div className="overflow-hidden rounded-md border">
      <CodeMirror
        value={value}
        theme={oneDark}
        extensions={extensions}
        readOnly={readOnly}
        onChange={onChange}
        height={height}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLine: !readOnly,
          highlightActiveLineGutter: !readOnly,
          foldGutter: false,
        }}
      />
    </div>
  );
}
