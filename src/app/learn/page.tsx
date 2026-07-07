import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { listLessonsByUnit } from "@/lib/content";
import { getAllProgress } from "@/db/queries";
import { SkillTree } from "@/components/skill-tree";
import { cn } from "@/lib/utils";

type SearchParams = Promise<{ track?: string }>;

const TRACKS = [
  { id: "css", label: "CSS", available: true },
  { id: "html", label: "HTML", available: false },
  { id: "js", label: "JavaScript", available: false },
] as const;

export default async function LearnPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { track = "css" } = await searchParams;
  const { userId } = await auth();

  const unitGroups = await listLessonsByUnit(
    track === "html" ? "html" : track === "js" ? "js" : "css",
  );
  const progress = userId ? await getAllProgress(userId) : [];

  return (
    <div>
      <nav className="border-b">
        <div className="mx-auto flex w-full max-w-2xl items-center gap-1 px-4">
          {TRACKS.map((t) => {
            const isActive = track === t.id;
            const className = cn(
              "relative px-3 py-3 text-sm font-medium transition-colors",
              isActive
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground",
              !t.available && "cursor-not-allowed opacity-50 hover:text-muted-foreground",
            );
            const inner = (
              <>
                {t.label}
                {isActive && (
                  <span className="absolute inset-x-3 -bottom-px h-0.5 bg-foreground" />
                )}
                {!t.available && (
                  <span className="ml-1.5 rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                    soon
                  </span>
                )}
              </>
            );
            return t.available ? (
              <Link key={t.id} href={`/learn?track=${t.id}`} className={className}>
                {inner}
              </Link>
            ) : (
              <span key={t.id} className={className} aria-disabled>
                {inner}
              </span>
            );
          })}
        </div>
      </nav>

      {unitGroups.length === 0 ? (
        <div className="mx-auto max-w-md py-20 text-center text-muted-foreground">
          Lessons for this track are coming soon.
        </div>
      ) : (
        <SkillTree unitGroups={unitGroups} progress={progress} />
      )}
    </div>
  );
}
