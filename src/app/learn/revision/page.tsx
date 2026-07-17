import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { buildRevisionSet } from "@/lib/practice";
import { RevisionRunner } from "@/components/lesson/revision-runner";

export const dynamic = "force-dynamic";

export default async function RevisionPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const questions = await buildRevisionSet(10);
  return <RevisionRunner questions={questions} />;
}
