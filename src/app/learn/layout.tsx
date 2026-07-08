import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ensureUser, getRecentActivity, getStats } from "@/db/queries";
import { AppHeader } from "@/components/app-header";

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

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader
        xp={stats?.xp ?? 0}
        streak={stats?.streak ?? 0}
        hearts={stats?.hearts ?? 5}
        freezes={stats?.freezes ?? 0}
        activeDates={activeDates}
      />
      <main className="flex-1">{children}</main>
    </div>
  );
}
