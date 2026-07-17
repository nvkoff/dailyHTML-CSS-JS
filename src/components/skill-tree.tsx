import Link from "next/link";
import { Check, Circle, PlayCircle, Sparkles } from "lucide-react";
import { LessonMeta, Track } from "@/lib/content-types";
import { SectionGroup } from "@/lib/content";
import { cn } from "@/lib/utils";

type ProgressRow = {
  lessonId: string;
  correctCount: number;
  totalCount: number;
};

const TRACK_META: Record<Track, { title: string; blurb: string; accent: string }> = {
  css: {
    title: "CSS",
    blurb: "Selectors, layout, animation, and the modern toolbox.",
    accent: "from-sky-500/15 to-transparent",
  },
  html: {
    title: "HTML",
    blurb: "Elements, forms, semantics, and accessibility.",
    accent: "from-orange-500/15 to-transparent",
  },
  js: {
    title: "JavaScript",
    blurb: "From variables to DOM, events, and promises.",
    accent: "from-yellow-500/15 to-transparent",
  },
  ts: {
    title: "TypeScript",
    blurb: "Types, narrowing, generics, and the utility toolbox.",
    accent: "from-blue-500/15 to-transparent",
  },
  react: {
    title: "React",
    blurb: "Components, hooks, effects, context — build UIs that hold up.",
    accent: "from-cyan-500/15 to-transparent",
  },
  "react-native": {
    title: "React Native",
    blurb: "Cross-platform mobile — core components, styling, navigation.",
    accent: "from-fuchsia-500/15 to-transparent",
  },
  redux: {
    title: "Redux",
    blurb: "Store, actions, reducers, and the modern Toolkit way.",
    accent: "from-violet-500/15 to-transparent",
  },
};

export function SkillTree({
  track,
  sections,
  progress,
  allComplete,
}: {
  track: Track;
  sections: SectionGroup[];
  progress: ProgressRow[];
  allComplete: boolean;
}) {
  const progressById = new Map(progress.map((p) => [p.lessonId, p]));
  const meta = TRACK_META[track];

  const totalLessons = sections.reduce(
    (n, s) => n + s.units.reduce((m, u) => m + u.lessons.length, 0),
    0,
  );
  const doneCount = sections.reduce(
    (n, s) =>
      n +
      s.units.reduce(
        (m, u) =>
          m +
          u.lessons.filter((l) => {
            const p = progressById.get(l.id);
            return p && p.correctCount / p.totalCount >= 0.8;
          }).length,
        0,
      ),
    0,
  );
  const pct = totalLessons === 0 ? 0 : Math.round((doneCount / totalLessons) * 100);

  return (
    <div className="mx-auto w-full max-w-2xl px-3 py-6 sm:px-4 sm:py-8">
      <div
        className={cn(
          "mb-6 rounded-xl border bg-gradient-to-br p-5 sm:mb-8 sm:p-6",
          meta.accent,
        )}
      >
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {meta.title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{meta.blurb}</p>
        {totalLessons > 0 && (
          <div className="mt-4 flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
              {doneCount}/{totalLessons} · {pct}%
            </span>
          </div>
        )}
      </div>

      {allComplete && (
        <Link
          href={`/learn/practice/${track}`}
          className="mb-6 flex items-center gap-3 rounded-lg border border-primary/40 bg-primary/5 p-4 transition-colors hover:bg-primary/10 sm:mb-8"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <h3 className="text-sm font-medium">Endless practice unlocked</h3>
            <p className="text-xs text-muted-foreground">
              Mixed questions from every {meta.title} lesson you&apos;ve finished.
            </p>
          </div>
        </Link>
      )}

      <div className="space-y-12">
        {sections.map(({ section, units }) => (
          <div key={section ?? "default"} className="space-y-8">
            {section && (
              <div className="border-b pb-2">
                <h2 className="text-lg font-semibold tracking-tight">{section}</h2>
              </div>
            )}
            {units.map(({ unit, lessons }) => (
              <UnitBlock
                key={unit}
                unit={unit}
                lessons={lessons}
                progressById={progressById}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function UnitBlock({
  unit,
  lessons,
  progressById,
}: {
  unit: string;
  lessons: LessonMeta[];
  progressById: Map<string, ProgressRow>;
}) {
  return (
    <section>
      <h3 className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {unit}
      </h3>
      <ol className="space-y-3">
        {lessons.map((lesson) => {
          const done = progressById.get(lesson.id);
          const state: "done" | "started" | "todo" = done
            ? done.correctCount / done.totalCount >= 0.8
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
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border",
                    state === "done" && "border-success bg-success text-success-foreground",
                    state === "started" && "border-primary text-primary",
                    state === "todo" && "border-border text-muted-foreground",
                  )}
                >
                  {state === "done" ? (
                    <Check className="h-5 w-5" />
                  ) : state === "started" ? (
                    <PlayCircle className="h-5 w-5" />
                  ) : (
                    <Circle className="h-5 w-5" />
                  )}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 sm:gap-3">
                    <h4 className="truncate text-sm font-medium">
                      {lesson.title}
                    </h4>
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
  );
}
