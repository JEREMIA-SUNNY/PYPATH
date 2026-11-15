"use client";

import { CircleCheck, Circle, CircleDot } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { Difficulty, Section } from "@/lib/types";
import { cn } from "@/lib/utils";
import { SECTIONS } from "./learn-grid";
import { useApp } from "./providers";
import { DifficultyBadge } from "./ui";

type Status = "all" | "todo" | "attempted" | "passed";

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-[12px] font-medium capitalize transition-colors",
        active
          ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900"
          : "border-zinc-200 text-zinc-600 hover:border-zinc-300 dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-700",
      )}
    >
      {children}
    </button>
  );
}

export function CodeHub({ sections = ["foundations", "career", "interview"] as Section[] }: { sections?: Section[] }) {
  const { index, progress } = useApp();
  const [status, setStatus] = useState<Status>("all");
  const [diff, setDiff] = useState<Difficulty | "all">("all");

  const total = index.filter((m) => sections.includes(m.section)).reduce((a, m) => a + m.exercises.length, 0);
  const passed = index
    .filter((m) => sections.includes(m.section))
    .reduce((a, m) => a + m.exercises.filter((e) => progress.exercises[`${m.id}/${e.id}`]?.status === "passed").length, 0);

  return (
    <div className="mt-10">
      <div className="flex flex-wrap items-center gap-2">
        {(["all", "todo", "attempted", "passed"] as Status[]).map((s) => (
          <Chip key={s} active={status === s} onClick={() => setStatus(s)}>
            {s === "todo" ? "To do" : s}
          </Chip>
        ))}
        <span className="mx-2 h-5 w-px bg-zinc-200 dark:bg-zinc-800" />
        {(["all", "easy", "medium", "hard"] as const).map((d) => (
          <Chip key={d} active={diff === d} onClick={() => setDiff(d)}>
            {d === "all" ? "Any difficulty" : d}
          </Chip>
        ))}
        <span className="ml-auto text-[13px] tabular-nums text-zinc-500">
          {passed} / {total} passed
        </span>
      </div>

      <div className="mt-8 space-y-12">
        {SECTIONS.filter((s) => sections.includes(s.id)).map((sec) => {
          const mods = index
            .filter((m) => m.section === sec.id)
            .map((m) => ({
              m,
              items: m.exercises.filter((e) => {
                const st = progress.exercises[`${m.id}/${e.id}`]?.status;
                const okStatus =
                  status === "all" || (status === "passed" && st === "passed") || (status === "attempted" && st === "attempted") || (status === "todo" && st !== "passed");
                return okStatus && (diff === "all" || e.difficulty === diff);
              }),
            }))
            .filter((x) => x.items.length > 0);
          if (!mods.length) return null;
          return (
            <section key={sec.id}>
              {sections.length > 1 && <h2 className="mb-4 text-lg font-semibold tracking-tight text-zinc-900 dark:text-white">{sec.title}</h2>}
              <div className="grid gap-4 lg:grid-cols-2">
                {mods.map(({ m, items }) => (
                  <div key={m.id} className="rounded-2xl border border-zinc-200 bg-white p-2 dark:border-zinc-800/80 dark:bg-zinc-900/40">
                    <Link href={`/learn/${m.id}`} className="flex items-center justify-between px-3 pb-1 pt-2 text-sm font-semibold text-zinc-900 hover:underline dark:text-white">
                      {m.title}
                      <span className="font-mono text-[11px] font-normal text-zinc-400">{String(m.order).padStart(2, "0")}</span>
                    </Link>
                    {items.map((e) => {
                      const st = progress.exercises[`${m.id}/${e.id}`]?.status;
                      return (
                        <Link
                          key={e.id}
                          href={`/code/${m.id}/${e.id}`}
                          className="flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
                        >
                          {st === "passed" ? (
                            <CircleCheck className="size-4 text-emerald-500" />
                          ) : st === "attempted" ? (
                            <CircleDot className="size-4 text-amber-500" />
                          ) : (
                            <Circle className="size-4 text-zinc-300 dark:text-zinc-700" />
                          )}
                          <span className="flex-1 truncate text-zinc-700 dark:text-zinc-300">{e.title}</span>
                          <DifficultyBadge difficulty={e.difficulty} />
                        </Link>
                      );
                    })}
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
