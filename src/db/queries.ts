import { and, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "./client";
import { users, userStats, lessonProgress, dailyActivity } from "./schema";

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

export async function getRecentActivity(userId: string, sinceDaysAgo = 45) {
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - sinceDaysAgo);
  const sinceStr = since.toISOString().slice(0, 10);
  const rows = await db
    .select()
    .from(dailyActivity)
    .where(
      and(eq(dailyActivity.userId, userId), gte(dailyActivity.day, sinceStr)),
    )
    .orderBy(desc(dailyActivity.day));
  return rows.map((r) => r.day);
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string) {
  const da = new Date(a + "T00:00:00Z").getTime();
  const db_ = new Date(b + "T00:00:00Z").getTime();
  return Math.round((db_ - da) / 86_400_000);
}

type StreakUpdate = {
  streak: number;
  freezes: number;
  freezesGained: number;
  freezesUsed: number;
};

function nextStreak(
  currentStreak: number,
  currentFreezes: number,
  lastActive: string | null,
  today: string,
): StreakUpdate {
  if (lastActive === today) {
    return {
      streak: currentStreak,
      freezes: currentFreezes,
      freezesGained: 0,
      freezesUsed: 0,
    };
  }

  const gap = lastActive ? daysBetween(lastActive, today) : Infinity;
  let streak = currentStreak;
  let freezes = currentFreezes;
  let freezesUsed = 0;

  if (gap === 1 || !lastActive) {
    streak = (lastActive ? currentStreak : 0) + 1;
  } else if (gap > 1) {
    const missed = gap - 1;
    if (freezes >= missed) {
      freezes -= missed;
      freezesUsed = missed;
      streak = currentStreak + 1;
    } else {
      streak = 1;
      freezes = 0;
    }
  }

  const prevMilestones = Math.floor(currentStreak / 5);
  const nextMilestones = Math.floor(streak / 5);
  const freezesGained = Math.max(0, nextMilestones - prevMilestones);
  freezes += freezesGained;

  return { streak, freezes, freezesGained, freezesUsed };
}

async function applyDayCompletion(
  userId: string,
  xpDelta: number,
): Promise<{ newStreak: number; totalXp: number; freezesGained: number }> {
  const today = todayISO();
  const current = await getStats(userId);

  const update = nextStreak(
    current?.streak ?? 0,
    current?.freezes ?? 0,
    current?.lastActiveDate ?? null,
    today,
  );

  await db
    .insert(dailyActivity)
    .values({ userId, day: today })
    .onConflictDoNothing();

  await db
    .update(userStats)
    .set({
      xp: (current?.xp ?? 0) + xpDelta,
      streak: update.streak,
      freezes: update.freezes,
      lastActiveDate: today,
      updatedAt: new Date(),
    })
    .where(eq(userStats.userId, userId));

  return {
    newStreak: update.streak,
    totalXp: (current?.xp ?? 0) + xpDelta,
    freezesGained: update.freezesGained,
  };
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

  // Preserve the user's best attempt on each field.
  await db
    .insert(lessonProgress)
    .values({ userId, lessonId, correctCount, totalCount, xpEarned })
    .onConflictDoUpdate({
      target: [lessonProgress.userId, lessonProgress.lessonId],
      set: {
        correctCount: sql`GREATEST(${lessonProgress.correctCount}, ${correctCount})`,
        totalCount,
        xpEarned: sql`GREATEST(${lessonProgress.xpEarned}, ${xpEarned})`,
        completedAt: new Date(),
      },
    });

  return applyDayCompletion(userId, xpEarned);
}

export async function recordPracticeResult(args: {
  userId: string;
  xpEarned: number;
}) {
  await ensureUser(args.userId);
  return applyDayCompletion(args.userId, args.xpEarned);
}
