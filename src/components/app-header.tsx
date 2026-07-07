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
      <div className="mx-auto flex h-14 w-full max-w-4xl items-center gap-4 px-4">
        <Link href="/learn" className="text-sm font-semibold tracking-tight">
          Daily Frontend
        </Link>
        <div className="ml-auto flex items-center gap-4 text-sm">
          <Stat icon={<Zap className="h-4 w-4" />} value={xp} label="XP" />
          <Stat icon={<Flame className="h-4 w-4 text-orange-500" />} value={streak} label="day streak" />
          <Stat icon={<Heart className="h-4 w-4 text-rose-500" />} value={hearts} label="hearts" />
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
    >
      {icon}
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
