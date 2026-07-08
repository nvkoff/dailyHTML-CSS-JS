import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { Zap, Heart } from "lucide-react";
import { StreakPopover } from "./streak-popover";

export function AppHeader({
  xp,
  streak,
  hearts,
  freezes,
  activeDates,
}: {
  xp: number;
  streak: number;
  hearts: number;
  freezes: number;
  activeDates: string[];
}) {
  return (
    <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-4xl items-center gap-3 px-3 sm:gap-4 sm:px-4">
        <Link href="/learn" className="text-sm font-semibold tracking-tight">
          <span className="hidden sm:inline">Daily Frontend</span>
          <span className="sm:hidden">DF</span>
        </Link>
        <div className="ml-auto flex items-center gap-2 text-sm sm:gap-3">
          <Stat icon={<Zap className="h-5 w-5" />} value={xp} label={`${xp} XP`} />
          <StreakPopover streak={streak} freezes={freezes} activeDates={activeDates} />
          <Stat
            icon={<Heart className="h-5 w-5 text-rose-500" />}
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
      className="flex items-center gap-1.5 tabular-nums text-muted-foreground"
      title={label}
      aria-label={label}
    >
      {icon}
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
