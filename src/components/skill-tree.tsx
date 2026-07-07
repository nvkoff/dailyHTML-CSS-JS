import Link from "next/link";
import { Check, Circle, PlayCircle, Sparkles } from "lucide-react";
import { LessonMeta, Track } from "@/lib/content-types";
import { cn } from "@/lib/utils";

type ProgressRow = {
  lessonId: string;
  correctCount: number;
  totalCount: number;
};

const TRACK_META: Record<Track, { title: string; blurb: string }> = {
  css: {
    title: "CSS",
    blurb: "Selectors, box model, and flexbox — one lesson at a time.",
  },
  html: {
    title: "HTML",
    blurb: "Elements, forms, semantics, and accessibility.",
  },
  js: {
    title: "JavaScript",
    blurb: "Types, functions, arrays, objects, and the DOM.",
  },
};

export function SkillTree({
  track,
  unitGroups,
  progress,
  allComplete,
}: {
  track: Track;
  unitGroups: { unit: string; lessons: LessonMeta[] }[];
  progress: ProgressRow[];
  allComplete: boolean;
}) {
  const progressById = new Map(progress.map((p) => [p.lessonId, p]));
  const meta = TRACK_META[track];

  return (
    <div className="mx-auto w-full max-w-2xl px-3 py-6 sm:px-4 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
          {meta.title}
        </h1>
        <p className="text-sm text-muted-foreground">{meta.blurb}</p>
      </div>

      {allComplete && (
        <Link
          href={`/learn/practice/${track}`}
          className="mb-6 flex items-center gap-3 rounded-lg border border-primary/40 bg-primary/5 p-4 transition-colors hover:bg-primary/10 sm:mb-8"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </span>
          <div className="flex-1">
            <h3 className="text-sm font-medium">Endless practice unlocked</h3>
            <p className="text-xs text-muted-foreground">
              Mixed questions from every {meta.title} lesson you&apos;ve finished.
            </p>
          </div>
        </Link>
      )}

      <div className="space-y-10">
        {unitGroups.map(({ unit, lessons }) => (
          <section key={unit}>
            <h2 className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {unit}
            </h2>
            <ol className="space-y-3">
              {lessons.map((lesson) => {
                const done = progressById.get(lesson.id);
                const state: "done" | "started" | "todo" = done
                  ? done.correctCount === done.totalCount
                    ? "done"
                    : "started"
                  : "todo";
                return (
                  <li key={lesson.id}>
                    <Link
                      href={`/learn/lesson/${lesson.id}`}
                      className={cn(
                        "flex items-center gap-3 rounded-lg border bg-card p-3 transition-colors hover:border-primary/50 hover:bg-accent/50 sm:gap-4 sm:p-4",
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border",
                          state === "done" && "border-success bg-success text-success-foreground",
                          state === "started" && "border-primary text-primary",
                          state === "todo" && "border-border text-muted-foreground",
                        )}
                      >
                        {state === "done" ? (
                          <Check className="h-4 w-4" />
                        ) : state === "started" ? (
                          <PlayCircle className="h-4 w-4" />
                        ) : (
                          <Circle className="h-4 w-4" />
                        )}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 sm:gap-3">
                          <h3 className="truncate text-sm font-medium">
                            {lesson.title}
                          </h3>
                          <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                            {lesson.questionCount}q · {lesson.xp}xp
                          </span>
                        </div>
                        <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                          {lesson.description}
                        </p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
      </div>
    </div>
  );
}
