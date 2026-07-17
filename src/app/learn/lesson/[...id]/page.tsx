import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getLesson } from "@/lib/content";
import { LessonRunner } from "@/components/lesson/lesson-runner";
import { getStats } from "@/db/queries";
import { computeCurrentHearts } from "@/lib/hearts";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string[] }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id } = await params;
  const lessonId = id.join("/");
  const [lesson, stats] = await Promise.all([getLesson(lessonId), getStats(userId)]);

  if (!lesson) {
    notFound();
  }

  const startingHearts = stats
    ? computeCurrentHearts({
        hearts: stats.hearts,
        heartsUpdatedAt: stats.heartsUpdatedAt,
      }).hearts
    : 5;

  return <LessonRunner lesson={lesson} startingHearts={startingHearts} />;
}
