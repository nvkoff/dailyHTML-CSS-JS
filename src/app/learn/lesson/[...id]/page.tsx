import { notFound } from "next/navigation";
import { getLesson } from "@/lib/content";
import { LessonRunner } from "@/components/lesson/lesson-runner";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string[] }>;
}) {
  const { id } = await params;
  const lessonId = id.join("/");
  const lesson = await getLesson(lessonId);

  if (!lesson) {
    notFound();
  }

  return <LessonRunner lesson={lesson} />;
}
