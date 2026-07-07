import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ensureUser, getStats } from "@/db/queries";
import { AppHeader } from "@/components/app-header";

export default async function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  await ensureUser(userId);
  const stats = await getStats(userId);

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader
        xp={stats?.xp ?? 0}
        streak={stats?.streak ?? 0}
        hearts={stats?.hearts ?? 5}
      />
      <main className="flex-1">{children}</main>
    </div>
  );
}
