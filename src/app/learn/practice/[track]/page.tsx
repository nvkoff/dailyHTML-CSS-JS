import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { listLessons } from "@/lib/content";
import { getAllProgress } from "@/db/queries";
import { buildPracticeSet } from "@/lib/practice";
import { PracticeRunner } from "@/components/lesson/practice-runner";
import { Track } from "@/lib/content-types";

function coerceTrack(t: string): Track | null {
  if (t === "css" || t === "html" || t === "js") return t;
  return null;
}

export default async function PracticePage({
  params,
}: {
  params: Promise<{ track: string }>;
}) {
  const { track: raw } = await params;
  const track = coerceTrack(raw);
  if (!track) notFound();

  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const [lessons, progress] = await Promise.all([
    listLessons(track),
    getAllProgress(userId),
  ]);

  const completedIds = new Set(
    progress
      .filter((p) => p.correctCount === p.totalCount)
      .map((p) => p.lessonId),
  );
  const allDone =
    lessons.length > 0 && lessons.every((l) => completedIds.has(l.id));

  if (!allDone) {
    redirect(`/learn?track=${track}`);
  }

  const questions = await buildPracticeSet(track, completedIds, 10);

  return <PracticeRunner track={track} questions={questions} />;
}
