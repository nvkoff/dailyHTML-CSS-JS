import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ensureUser, getRecentActivity, getStats } from "@/db/queries";
import { AppHeader } from "@/components/app-header";
import { computeCurrentHearts, msUntilNextHeart } from "@/lib/hearts";

export default async function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  await ensureUser(userId);
  const [stats, activeDates] = await Promise.all([
    getStats(userId),
    getRecentActivity(userId, 45),
  ]);

  const heartsState = stats
    ? computeCurrentHearts({
        hearts: stats.hearts,
        heartsUpdatedAt: stats.heartsUpdatedAt,
      })
    : { hearts: 5, anchoredAt: new Date() };
  const nextRefillMs = msUntilNextHeart(heartsState);

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader
        xp={stats?.xp ?? 0}
        streak={stats?.streak ?? 0}
        hearts={heartsState.hearts}
        nextHeartMs={nextRefillMs}
        freezes={stats?.freezes ?? 0}
        activeDates={activeDates}
      />
      <main className="flex-1">{children}</main>
    </div>
  );
}
