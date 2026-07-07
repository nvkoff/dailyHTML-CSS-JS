import { eq } from "drizzle-orm";
import { db } from "./client";
import { users, userStats, lessonProgress } from "./schema";

export async function ensureUser(userId: string) {
  await db.insert(users).values({ id: userId }).onConflictDoNothing();
  await db.insert(userStats).values({ userId }).onConflictDoNothing();
}

export async function getStats(userId: string) {
  const rows = await db
    .select()
    .from(userStats)
    .where(eq(userStats.userId, userId))
    .limit(1);
  return rows[0] ?? null;
}

export async function getAllProgress(userId: string) {
  return db
    .select()
    .from(lessonProgress)
    .where(eq(lessonProgress.userId, userId));
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string) {
  const da = new Date(a + "T00:00:00Z").getTime();
  const db = new Date(b + "T00:00:00Z").getTime();
  return Math.round((db - da) / 86_400_000);
}

export async function recordLessonComplete(args: {
  userId: string;
  lessonId: string;
  correctCount: number;
  totalCount: number;
  xpEarned: number;
}) {
  const { userId, lessonId, correctCount, totalCount, xpEarned } = args;

  await ensureUser(userId);

  await db
    .insert(lessonProgress)
    .values({ userId, lessonId, correctCount, totalCount, xpEarned })
    .onConflictDoUpdate({
      target: [lessonProgress.userId, lessonProgress.lessonId],
      set: { correctCount, totalCount, xpEarned, completedAt: new Date() },
    });

  const today = todayISO();
  const current = await getStats(userId);
  const last = current?.lastActiveDate ?? null;
  let newStreak = current?.streak ?? 0;
  if (last === today) {
    // already active today, streak unchanged
  } else if (last && daysBetween(last, today) === 1) {
    newStreak = newStreak + 1;
  } else {
    newStreak = 1;
  }

  await db
    .update(userStats)
    .set({
      xp: (current?.xp ?? 0) + xpEarned,
      streak: newStreak,
      lastActiveDate: today,
      updatedAt: new Date(),
    })
    .where(eq(userStats.userId, userId));

  return { newStreak, totalXp: (current?.xp ?? 0) + xpEarned };
}
