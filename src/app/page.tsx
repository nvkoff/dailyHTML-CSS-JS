import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sparkles, Flame, Zap } from "lucide-react";

export default async function Home() {
  const { userId } = await auth();
  if (userId) {
    redirect("/learn");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="mx-auto flex h-14 w-full max-w-4xl items-center px-4">
          <div className="text-sm font-semibold tracking-tight">Daily Frontend</div>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/sign-in">Sign in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/sign-up">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-5 py-16 text-center sm:px-6 sm:py-24">
          <div className="mb-6 inline-flex items-center gap-1.5 rounded-full border bg-muted/50 px-3 py-1 text-xs">
            <Sparkles className="h-3.5 w-3.5" /> Bite-sized frontend practice
          </div>
          <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
            Get sharper at HTML, CSS &amp; JavaScript
            <span className="block text-muted-foreground">one lesson at a time.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-lg text-balance text-muted-foreground">
            Short lessons, small tests, quick tech checks. Build a streak. Track
            your XP. Focus on the fundamentals.
          </p>
          <div className="mt-8 flex flex-col items-stretch justify-center gap-2 sm:flex-row sm:items-center">
            <Button size="lg" asChild>
              <Link href="/sign-up">Start free</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/sign-in">Sign in</Link>
            </Button>
          </div>
        </section>

        <section className="mx-auto grid max-w-3xl gap-4 px-5 pb-16 sm:grid-cols-3 sm:px-6 sm:pb-24">
          <FeatureCard
            icon={<Zap className="h-4 w-4" />}
            title="Earn XP"
            body="Every correct answer counts. Watch your total climb."
          />
          <FeatureCard
            icon={<Flame className="h-4 w-4 text-orange-500" />}
            title="Keep a streak"
            body="Show up daily. Miss a day, streak resets."
          />
          <FeatureCard
            icon={<Sparkles className="h-4 w-4" />}
            title="Mixed practice"
            body="Multiple choice, predict-the-output, and fix-the-bug."
          />
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex h-14 w-full max-w-4xl items-center px-4 text-xs text-muted-foreground">
          Built with Next.js, Clerk, and Neon.
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-5">
      <div className="mb-2 flex items-center gap-2 text-sm font-medium">
        {icon}
        {title}
      </div>
      <p className="text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
