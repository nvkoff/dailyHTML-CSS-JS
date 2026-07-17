"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Flame,
  Zap,
  Skull,
  RotateCcw,
  Heart,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Lesson, Question, gradeQuestion } from "@/lib/content-types";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { QuestionRenderer, Answer } from "./question-renderer";
import { submitLessonResult } from "@/lib/actions";
import { cn } from "@/lib/utils";

type Phase = "answering" | "checked" | "done";
type DoneReason = "finished" | "no-hearts";

const PASS_THRESHOLD = 0.8;

export function LessonRunner({
  lesson,
  startingHearts,
}: {
  lesson: Lesson;
  startingHearts: number;
}) {
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState<Answer>(null);
  const [phase, setPhase] = useState<Phase>("answering");
  const [correctCount, setCorrectCount] = useState(0);
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);
  const [heartsLeft, setHeartsLeft] = useState(startingHearts);
  const [doneReason, setDoneReason] = useState<DoneReason>("finished");
  const [summary, setSummary] = useState<{ newStreak: number; totalXp: number } | null>(null);
  const [saving, startTransition] = useTransition();
  const router = useRouter();

  const question = lesson.questions[index];
  const total = lesson.questions.length;
  const progressPct = phase === "done" ? 100 : (index / total) * 100;

  useEffect(() => {
    if (question.type === "fix-bug") setAnswer(question.broken);
    else if (question.type === "write-to-match") setAnswer(question.startingCss);
    else setAnswer(null);
  }, [index, question]);

  function submit(reason: DoneReason, finalCorrect: number, finalHearts: number) {
    const passed = finalCorrect / total >= PASS_THRESHOLD && reason === "finished";
    const xp = passed ? Math.round((finalCorrect / total) * lesson.xp) : 0;
    const heartsSpent = Math.max(0, startingHearts - finalHearts);
    setDoneReason(reason);
    startTransition(async () => {
      try {
        const result = await submitLessonResult({
          lessonId: lesson.id,
          correctCount: finalCorrect,
          totalCount: total,
          xpEarned: xp,
          heartsSpent,
        });
        setSummary(result);
      } catch {
        setSummary({ newStreak: 0, totalXp: 0 });
      }
      setPhase("done");
    });
  }

  function handleCheck() {
    const correct = gradeQuestion(question, answer);
    setWasCorrect(correct);
    let nextCorrect = correctCount;
    let nextHearts = heartsLeft;
    if (correct) {
      nextCorrect = correctCount + 1;
      setCorrectCount(nextCorrect);
    } else {
      nextHearts = Math.max(0, heartsLeft - 1);
      setHeartsLeft(nextHearts);
    }
    setPhase("checked");
    if (nextHearts <= 0 && !correct) {
      submit("no-hearts", nextCorrect, 0);
    }
  }

  function handleNext() {
    if (index + 1 < total) {
      setIndex(index + 1);
      setAnswer(null);
      setWasCorrect(null);
      setPhase("answering");
    } else {
      submit("finished", correctCount, heartsLeft);
    }
  }

  function handleRetry() {
    setIndex(0);
    setAnswer(null);
    setWasCorrect(null);
    setCorrectCount(0);
    setHeartsLeft(startingHearts);
    setSummary(null);
    setPhase("answering");
    setDoneReason("finished");
    router.refresh();
  }

  function canSubmit(q: Question, a: Answer) {
    if (q.type === "mcq" || q.type === "predict") return typeof a === "number";
    return typeof a === "string" && a.trim().length > 0;
  }

  if (phase === "done") {
    const passed =
      doneReason === "finished" && correctCount / total >= PASS_THRESHOLD;
    if (!passed) {
      const needed = Math.ceil(total * PASS_THRESHOLD);
      const noHearts = doneReason === "no-hearts";
      return (
        <div className="mx-auto flex w-full max-w-xl flex-col items-center justify-center gap-6 px-4 py-16 text-center sm:py-20">
          <div className="rounded-full bg-destructive/10 p-4">
            {noHearts ? (
              <Heart className="h-12 w-12 text-destructive" />
            ) : (
              <Skull className="h-12 w-12 text-destructive" />
            )}
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">
              {noHearts ? "Out of hearts" : "Defeat"}
            </h1>
            <p className="text-muted-foreground">
              {noHearts
                ? `${correctCount}/${total} correct — you ran out of hearts.`
                : `${correctCount}/${total} correct — you need at least ${needed}/${total} (80%) to pass.`}
            </p>
            <p className="text-sm text-muted-foreground">
              {noHearts
                ? "One heart refills every hour."
                : "No XP earned."}
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:flex-row">
            <Button asChild variant="outline" size="lg" className="flex-1">
              <Link href="/learn">Back</Link>
            </Button>
            <Button size="lg" className="flex-1" onClick={handleRetry}>
              <RotateCcw className="mr-1 h-5 w-5" /> Try again
            </Button>
          </div>
        </div>
      );
    }
    const xpEarned = Math.round((correctCount / total) * lesson.xp);
    return (
      <div className="mx-auto flex w-full max-w-xl flex-col items-center justify-center gap-6 px-4 py-16 text-center sm:py-20">
        <div className="rounded-full bg-success/10 p-4">
          <CheckCircle2 className="h-12 w-12 text-success" />
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Lesson complete</h1>
          <p className="text-muted-foreground">
            {correctCount}/{total} correct
          </p>
        </div>
        <div className="grid w-full grid-cols-2 gap-3">
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <Zap className="h-4 w-4" /> XP earned
            </div>
            <div className="text-center text-2xl font-semibold">+{xpEarned}</div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <Flame className="h-4 w-4 text-orange-500" /> Streak
            </div>
            <div className="text-center text-2xl font-semibold">
              {summary?.newStreak ?? "-"}
            </div>
          </div>
        </div>
        <Button asChild size="lg">
          <Link href="/learn">Back to lessons</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5 px-3 py-5 sm:gap-6 sm:px-4 sm:py-8">
      <div className="flex items-center gap-2 sm:gap-3">
        <Button variant="ghost" size="icon" asChild className="shrink-0">
          <Link href="/learn">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <Progress value={progressPct} />
        </div>
        <div
          className="flex shrink-0 items-center gap-1 tabular-nums text-rose-500"
          aria-label={`${heartsLeft} hearts left`}
          title={`${heartsLeft} hearts left`}
        >
          <Heart
            className={cn(
              "h-4 w-4",
              heartsLeft > 0 ? "fill-rose-500" : "opacity-30",
            )}
          />
          <span className="text-xs font-medium">{heartsLeft}</span>
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
                <CheckCircle2 className="h-6 w-6 text-success" /> Correct
              </>
            ) : (
              <>
                <XCircle className="h-6 w-6 text-destructive" /> Not quite
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
