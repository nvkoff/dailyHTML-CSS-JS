"use client";

import { useState } from "react";
import { WriteToMatchQuestion } from "@/lib/content-types";
import { CodeEditor } from "./code-editor";
import { PreviewFrame } from "./preview-frame";

export function WriteToMatch({
  question,
  value,
  onChange,
  locked,
}: {
  question: WriteToMatchQuestion;
  value: string;
  onChange: (v: string) => void;
  locked: boolean;
}) {
  const [showTarget, setShowTarget] = useState(true);

  return (
    <div className="space-y-4">
      <p className="text-base font-medium leading-relaxed">{question.prompt}</p>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Target
            </span>
            <button
              type="button"
              onClick={() => setShowTarget((v) => !v)}
              className="text-xs text-muted-foreground underline-offset-4 hover:underline"
            >
              {showTarget ? "hide" : "show"}
            </button>
          </div>
          {showTarget ? (
            <PreviewFrame
              html={question.html}
              css={question.targetCss}
              title="target"
            />
          ) : (
            <div className="flex h-[180px] items-center justify-center rounded-md border bg-muted/30 text-xs text-muted-foreground">
              hidden
            </div>
          )}
        </div>
        <div>
          <div className="mb-1.5 flex items-center">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Yours
            </span>
          </div>
          <PreviewFrame html={question.html} css={value} title="yours" />
        </div>
      </div>

      <CodeEditor
        language="css"
        value={value}
        onChange={locked ? undefined : onChange}
        readOnly={locked}
        height="220px"
      />

      {question.hint && !locked && (
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Hint:</span> {question.hint}
        </p>
      )}
    </div>
  );
}
