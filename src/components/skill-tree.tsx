import Link from "next/link";
import { Check, Circle, PlayCircle } from "lucide-react";
import { LessonMeta } from "@/lib/content-types";
import { cn } from "@/lib/utils";

type ProgressRow = {
  lessonId: string;
  correctCount: number;
  totalCount: number;
};

export function SkillTree({
  unitGroups,
  progress,
}: {
  unitGroups: { unit: string; lessons: LessonMeta[] }[];
  progress: ProgressRow[];
}) {
  const progressById = new Map(progress.map((p) => [p.lessonId, p]));

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">CSS</h1>
        <p className="text-sm text-muted-foreground">
          Selectors, box model, and flexbox — one lesson at a time.
        </p>
      </div>

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
                        "flex items-center gap-4 rounded-lg border bg-card p-4 transition-colors hover:border-primary/50 hover:bg-accent/50",
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
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="truncate text-sm font-medium">
                            {lesson.title}
                          </h3>
                          <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                            {lesson.questionCount} q · {lesson.xp} XP
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
