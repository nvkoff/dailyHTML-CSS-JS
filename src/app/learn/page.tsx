import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { listLessonsBySection, listLessons } from "@/lib/content";
import { getAllProgress } from "@/db/queries";
import { SkillTree } from "@/components/skill-tree";
import { Track } from "@/lib/content-types";
import { cn } from "@/lib/utils";

type SearchParams = Promise<{ track?: string }>;

const TRACKS: { id: Track; label: string }[] = [
  { id: "css", label: "CSS" },
  { id: "html", label: "HTML" },
  { id: "js", label: "JavaScript" },
];

function coerceTrack(t?: string): Track {
  if (t === "html" || t === "js") return t;
  return "css";
}

export default async function LearnPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const track = coerceTrack(params.track);
  const { userId } = await auth();

  const [sections, lessons, progress] = await Promise.all([
    listLessonsBySection(track),
    listLessons(track),
    userId ? getAllProgress(userId) : Promise.resolve([]),
  ]);

  const doneIds = new Set(
    progress
      .filter((p) => p.correctCount === p.totalCount)
      .map((p) => p.lessonId),
  );
  const allComplete =
    lessons.length > 0 && lessons.every((l) => doneIds.has(l.id));

  return (
    <div>
      <nav className="border-b">
        <div className="mx-auto flex w-full max-w-2xl items-center gap-0.5 overflow-x-auto px-3 sm:gap-1 sm:px-4">
          {TRACKS.map((t) => {
            const isActive = track === t.id;
            return (
              <Link
                key={t.id}
                href={`/learn?track=${t.id}`}
                className={cn(
                  "relative shrink-0 px-3 py-3 text-sm font-medium transition-colors",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t.label}
                {isActive && (
                  <span className="absolute inset-x-3 -bottom-px h-0.5 bg-foreground" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {sections.length === 0 ? (
        <div className="mx-auto max-w-md px-4 py-20 text-center text-muted-foreground">
          Lessons for this track are coming soon.
        </div>
      ) : (
        <SkillTree
          track={track}
          sections={sections}
          progress={progress}
          allComplete={allComplete}
        />
      )}
    </div>
  );
}
