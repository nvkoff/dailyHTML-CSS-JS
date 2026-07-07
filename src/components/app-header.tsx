import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { Flame, Zap, Heart } from "lucide-react";

export function AppHeader({
  xp,
  streak,
  hearts,
}: {
  xp: number;
  streak: number;
  hearts: number;
}) {
  return (
    <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-4xl items-center gap-3 px-3 sm:gap-4 sm:px-4">
        <Link href="/learn" className="text-sm font-semibold tracking-tight">
          <span className="hidden sm:inline">Daily Frontend</span>
          <span className="sm:hidden">DF</span>
        </Link>
        <div className="ml-auto flex items-center gap-2 text-sm sm:gap-4">
          <Stat icon={<Zap className="h-4 w-4" />} value={xp} label={`${xp} XP`} />
          <Stat
            icon={<Flame className="h-4 w-4 text-orange-500" />}
            value={streak}
            label={`${streak} day streak`}
          />
          <Stat
            icon={<Heart className="h-4 w-4 text-rose-500" />}
            value={hearts}
            label={`${hearts} hearts`}
          />
          <UserButton />
        </div>
      </div>
    </header>
  );
}

function Stat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <div
      className="flex items-center gap-1 tabular-nums text-muted-foreground sm:gap-1.5"
      title={label}
      aria-label={label}
    >
      {icon}
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
