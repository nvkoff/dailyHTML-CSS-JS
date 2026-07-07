"use server";

import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { userStats } from "@/db/schema";
import { ensureUser, getStats, recordLessonComplete } from "@/db/queries";

export async function submitLessonResult(args: {
  lessonId: string;
  correctCount: number;
  totalCount: number;
  xpEarned: number;
}) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Not signed in");
  }
  return recordLessonComplete({
    userId,
    lessonId: args.lessonId,
    correctCount: args.correctCount,
    totalCount: args.totalCount,
    xpEarned: args.xpEarned,
  });
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string) {
  const da = new Date(a + "T00:00:00Z").getTime();
  const db_ = new Date(b + "T00:00:00Z").getTime();
  return Math.round((db_ - da) / 86_400_000);
}

export async function submitPracticeResult(args: { xpEarned: number }) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Not signed in");
  }
  await ensureUser(userId);

  const today = todayISO();
  const current = await getStats(userId);
  const last = current?.lastActiveDate ?? null;
  let newStreak = current?.streak ?? 0;
  if (last === today) {
    // already active today
  } else if (last && daysBetween(last, today) === 1) {
    newStreak = newStreak + 1;
  } else {
    newStreak = 1;
  }

  await db
    .update(userStats)
    .set({
      xp: (current?.xp ?? 0) + args.xpEarned,
      streak: newStreak,
      lastActiveDate: today,
      updatedAt: new Date(),
    })
    .where(eq(userStats.userId, userId));

  return { newStreak, totalXp: (current?.xp ?? 0) + args.xpEarned };
}
