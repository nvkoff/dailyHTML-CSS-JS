"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { CheckCircle2, XCircle, ArrowLeft, Sparkles, Zap, Flame } from "lucide-react";
import { gradeQuestion, Question } from "@/lib/content-types";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { QuestionRenderer, Answer } from "./question-renderer";
import { submitPracticeResult } from "@/lib/actions";
import { cn } from "@/lib/utils";

type Phase = "answering" | "checked" | "done";

const XP_PER_CORRECT = 5;

export function PracticeRunner({
  track,
  questions,
}: {
  track: string;
  questions: Question[];
}) {
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState<Answer>(null);
  const [phase, setPhase] = useState<Phase>("answering");
  const [correctCount, setCorrectCount] = useState(0);
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);
  const [summary, setSummary] = useState<{ newStreak: number; totalXp: number } | null>(null);
  const [saving, startTransition] = useTransition();

  const question = questions[index];
  const total = questions.length;
  const progressPct = phase === "done" ? 100 : (index / total) * 100;

  useEffect(() => {
    if (!question) return;
    if (question.type === "fix-bug") setAnswer(question.broken);
    else if (question.type === "write-to-match") setAnswer(question.startingCss);
    else setAnswer(null);
  }, [index, question]);

  if (!question && phase !== "done") {
    return (
      <div className="mx-auto max-w-md py-20 text-center text-muted-foreground">
        No practice questions available yet. Complete a lesson first.
      </div>
    );
  }

  function handleCheck() {
    const correct = gradeQuestion(question, answer);
    setWasCorrect(correct);
    if (correct) setCorrectCount((n) => n + 1);
    setPhase("checked");
  }

  function handleNext() {
    if (index + 1 < total) {
      setIndex(index + 1);
      setWasCorrect(null);
      setPhase("answering");
    } else {
      const xp = correctCount * XP_PER_CORRECT;
      startTransition(async () => {
        try {
          const result = await submitPracticeResult({ xpEarned: xp });
          setSummary(result);
        } catch {
          setSummary({ newStreak: 0, totalXp: 0 });
        }
        setPhase("done");
      });
    }
  }

  function canSubmit(q: Question, a: Answer) {
    if (q.type === "mcq" || q.type === "predict") return typeof a === "number";
    return typeof a === "string" && a.trim().length > 0;
  }

  if (phase === "done") {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-col items-center justify-center gap-6 px-4 py-16 text-center sm:py-20">
        <div className="rounded-full bg-primary/10 p-4">
          <Sparkles className="h-10 w-10 text-primary" />
        </div>
        <div className="space-y-1">
          <h1 className="text-xl font-semibold sm:text-2xl">Practice complete</h1>
          <p className="text-muted-foreground">
            {correctCount}/{total} correct
          </p>
        </div>
        <div className="grid w-full grid-cols-2 gap-3">
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <Zap className="h-3.5 w-3.5" /> XP earned
            </div>
            <div className="text-center text-2xl font-semibold">
              +{correctCount * XP_PER_CORRECT}
            </div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <Flame className="h-3.5 w-3.5" /> Streak
            </div>
            <div className="text-center text-2xl font-semibold">
              {summary?.newStreak ?? "-"}
            </div>
          </div>
        </div>
        <div className="flex w-full flex-col gap-2 sm:flex-row">
          <Button asChild variant="outline" className="flex-1">
            <Link href={`/learn?track=${track}`}>Back</Link>
          </Button>
          <Button asChild className="flex-1">
            <Link href={`/learn/practice/${track}`}>Another round</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5 px-3 py-5 sm:gap-6 sm:px-4 sm:py-8">
      <div className="flex items-center gap-2 sm:gap-3">
        <Button variant="ghost" size="icon" asChild className="shrink-0">
          <Link href={`/learn?track=${track}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <Progress value={progressPct} />
        </div>
        <span className="text-xs text-muted-foreground tabular-nums">
          {index + 1} / {total}
        </span>
      </div>

      <div className="rounded-lg border bg-card p-4 sm:p-6">
        <QuestionRenderer
          question={question}
          answer={answer}
          onAnswer={setAnswer}
          locked={phase === "checked"}
        />
      </div>

      {phase === "checked" && (
        <div
          className={cn(
            "rounded-lg border p-4",
            wasCorrect ? "border-success/40 bg-success/5" : "border-destructive/40 bg-destructive/5",
          )}
        >
          <div className="flex items-center gap-2 font-medium">
            {wasCorrect ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-success" /> Correct
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 text-destructive" /> Not quite
              </>
            )}
          </div>
          {question.explanation && (
            <p className="mt-2 text-sm text-muted-foreground">
              {question.explanation}
            </p>
          )}
        </div>
      )}

      <div className="flex justify-end">
        {phase === "answering" ? (
          <Button
            size="lg"
            onClick={handleCheck}
            disabled={!canSubmit(question, answer)}
            className="w-full sm:w-auto"
          >
            Check
          </Button>
        ) : (
          <Button
            size="lg"
            onClick={handleNext}
            disabled={saving}
            className="w-full sm:w-auto"
          >
            {index + 1 < total ? "Next" : saving ? "Saving…" : "Finish"}
          </Button>
        )}
      </div>
    </div>
  );
}
