"use server";

import { auth } from "@clerk/nextjs/server";
import { recordLessonComplete, recordPracticeResult } from "@/db/queries";

export async function submitLessonResult(args: {
  lessonId: string;
  correctCount: number;
  totalCount: number;
  xpEarned: number;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not signed in");
  return recordLessonComplete({
    userId,
    lessonId: args.lessonId,
    correctCount: args.correctCount,
    totalCount: args.totalCount,
    xpEarned: args.xpEarned,
  });
}

export async function submitPracticeResult(args: { xpEarned: number }) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not signed in");
  return recordPracticeResult({ userId, xpEarned: args.xpEarned });
}
