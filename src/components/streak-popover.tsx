"use client";

import { Flame, Shield } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const WEEKDAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

function todayUTC() {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function startOfCalendar(monthAnchor: Date) {
  const first = new Date(
    Date.UTC(monthAnchor.getUTCFullYear(), monthAnchor.getUTCMonth(), 1),
  );
  // shift so Monday is column 0; getUTCDay: 0=Sun..6=Sat
  const dayOfWeek = (first.getUTCDay() + 6) % 7;
  const start = new Date(first);
  start.setUTCDate(first.getUTCDate() - dayOfWeek);
  return start;
}

function buildCells(monthAnchor: Date) {
  const start = startOfCalendar(monthAnchor);
  const cells: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + i);
    cells.push(d);
  }
  return cells;
}

function formatISO(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function StreakPopover({
  streak,
  freezes,
  activeDates,
}: {
  streak: number;
  freezes: number;
  activeDates: string[];
}) {
  const activeSet = new Set(activeDates);
  const today = todayUTC();
  const monthAnchor = today;
  const cells = buildCells(monthAnchor);
  const monthName = today.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  const nextFreezeIn = 5 - (streak % 5 === 0 && streak > 0 ? 5 : streak % 5);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-md px-1.5 py-1 text-sm tabular-nums text-muted-foreground transition-colors hover:bg-accent"
          aria-label={`${streak} day streak, ${freezes} freezes`}
        >
          <Flame className="h-5 w-5 text-orange-500" />
          <span className="font-medium text-foreground">{streak}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            <div className="text-sm">
              <div className="font-semibold">{streak} day streak</div>
              <div className="text-xs text-muted-foreground">
                {nextFreezeIn === 0 || streak === 0
                  ? "Start today to earn your first freeze!"
                  : `${nextFreezeIn} day${nextFreezeIn === 1 ? "" : "s"} until next freeze`}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 rounded-md border px-2 py-1 text-sm">
            <Shield className="h-4 w-4 text-sky-500" />
            <span className="font-medium tabular-nums">{freezes}</span>
          </div>
        </div>

        <div className="mb-1.5 text-xs font-medium text-muted-foreground">
          {monthName}
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] uppercase tracking-wider text-muted-foreground">
          {WEEKDAY_LABELS.map((d, i) => (
            <div key={i}>{d}</div>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1">
          {cells.map((d) => {
            const iso = formatISO(d);
            const inMonth = d.getUTCMonth() === today.getUTCMonth();
            const isActive = activeSet.has(iso);
            const isToday = iso === formatISO(today);
            return (
              <div
                key={iso}
                className={cn(
                  "relative flex h-8 items-center justify-center rounded text-xs tabular-nums",
                  inMonth ? "text-foreground" : "text-muted-foreground/40",
                  isActive && "bg-orange-500/15 font-semibold text-orange-600 dark:text-orange-400",
                  isToday && !isActive && "ring-1 ring-border",
                  isToday && isActive && "ring-1 ring-orange-500",
                )}
              >
                {d.getUTCDate()}
              </div>
            );
          })}
        </div>

        <p className="mt-3 text-[11px] text-muted-foreground">
          Earn <span className="font-medium text-foreground">+1 freeze</span> every
          5 streak days. Freezes auto-shield missed days.
        </p>
      </PopoverContent>
    </Popover>
  );
}
