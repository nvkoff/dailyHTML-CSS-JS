"use client";

import { Question } from "@/lib/content-types";
import { CodeBlock } from "./code-block";
import { ChoiceList } from "./choice-list";
import { CodeEditor } from "./code-editor";

export type Answer = number | string | null;

export function QuestionRenderer({
  question,
  answer,
  onAnswer,
  locked,
}: {
  question: Question;
  answer: Answer;
  onAnswer: (a: Answer) => void;
  locked: boolean;
}) {
  if (question.type === "mcq") {
    return (
      <div className="space-y-4">
        <p className="text-base font-medium leading-relaxed">{question.prompt}</p>
        {question.code && (
          <CodeBlock code={question.code} language={question.language} />
        )}
        <ChoiceList
          options={question.options}
          value={typeof answer === "number" ? answer : null}
          onChange={onAnswer}
          disabled={locked}
          correctIndex={locked ? question.answer : undefined}
        />
      </div>
    );
  }

  if (question.type === "predict") {
    return (
      <div className="space-y-4">
        <p className="text-base font-medium leading-relaxed">{question.prompt}</p>
        <CodeBlock code={question.code} language={question.language} />
        <ChoiceList
          options={question.options}
          value={typeof answer === "number" ? answer : null}
          onChange={onAnswer}
          disabled={locked}
          correctIndex={locked ? question.answer : undefined}
        />
      </div>
    );
  }

  // fix-bug
  return (
    <div className="space-y-4">
      <p className="text-base font-medium leading-relaxed">{question.prompt}</p>
      <CodeEditor
        language={question.language}
        value={typeof answer === "string" ? answer : question.broken}
        onChange={(v) => onAnswer(v)}
        readOnly={locked}
        height="260px"
      />
      {question.hint && !locked && (
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Hint:</span> {question.hint}
        </p>
      )}
    </div>
  );
}
