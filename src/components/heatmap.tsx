"use client";

import { localDay } from "@/lib/progress";
import { cn } from "@/lib/utils";

const WEEKS = 16;

export function Heatmap({ activity }: { activity: Record<string, number> }) {
  const today = new Date();
  // Columns are weeks (Sunday to Saturday); the last column is the current week.
  const start = new Date(today);
  start.setDate(today.getDate() - today.getDay() - (WEEKS - 1) * 7);
  const days: { key: string; count: number; future: boolean }[] = [];
  for (let i = 0; i < WEEKS * 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = localDay(d);
    days.push({ key, count: activity[key] ?? 0, future: d > today });
  }
  const weeks: (typeof days)[] = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
  const level = (n: number) => (n === 0 ? 0 : n < 3 ? 1 : n < 6 ? 2 : n < 10 ? 3 : 4);
  const shades = [
    "bg-zinc-100 dark:bg-zinc-800/60",
    "bg-indigo-200 dark:bg-indigo-900/70",
    "bg-indigo-300 dark:bg-indigo-700",
    "bg-indigo-500 dark:bg-indigo-500",
    "bg-indigo-700 dark:bg-indigo-300",
  ];
  const total = Object.values(activity).reduce((a, b) => a + b, 0);
  return (
    <div>
      <div className="flex gap-[3px] overflow-x-auto pb-1">
        {weeks.map((w, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {w.map((d) => (
              <div
                key={d.key}
                title={d.future ? "" : `${d.key}: ${d.count} ${d.count === 1 ? "activity" : "activities"}`}
                className={cn("size-3 rounded-[3px]", d.future ? "opacity-0" : shades[level(d.count)])}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-500">
        <span>{total} activities in total</span>
        <span className="flex items-center gap-1">
          Less
          {shades.map((s, i) => (
            <span key={i} className={cn("size-2.5 rounded-[3px]", s)} />
          ))}
          More
        </span>
      </div>
    </div>
  );
}
