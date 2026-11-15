"use client";

import { ArrowRight, CircleCheck, Repeat2 } from "lucide-react";
import Link from "next/link";
import { moduleStats, overallStats, reviewDue } from "@/lib/progress";
import { cn } from "@/lib/utils";
import { SECTIONS } from "./learn-grid";
import { ModuleIcon } from "./module-icon";
import { ProgressRing } from "./progress-ring";
import { useApp } from "./providers";
import { SpotlightCard } from "./spotlight-card";
import { ButtonLink } from "./ui";

export function QuizHub() {
  const { index, progress } = useApp();
  const stats = overallStats(index, progress);
  const due = reviewDue(progress).length;
  const inQueue = Object.keys(progress.review).length;

  return (
    <div className="mt-10 space-y-12">
      <div className="grid gap-4 md:grid-cols-3">
        <SpotlightCard className="flex items-center gap-5">
          <ProgressRing value={stats.quizzesTotal ? (stats.quizzesPassed / stats.quizzesTotal) * 100 : 0} size={84} stroke={8} label={stats.quizzesPassed} />
          <div>
            <div className="text-sm font-semibold text-zinc-900 dark:text-white">Quizzes passed</div>
            <div className="text-[13px] text-zinc-500">of {stats.quizzesTotal}, pass mark 70%</div>
          </div>
        </SpotlightCard>
        <SpotlightCard className="flex flex-col justify-center">
          <div className="text-[12px] text-zinc-500">Average best score</div>
          <div className="mt-1 text-3xl font-semibold tabular-nums text-zinc-900 dark:text-white">
            {stats.quizAverage === null ? "–" : `${stats.quizAverage}%`}
          </div>
          <div className="text-[12px] text-zinc-500">{stats.quizzesTaken} quizzes taken</div>
        </SpotlightCard>
        <SpotlightCard className="flex flex-col justify-center">
          <div className="flex items-center gap-2 text-[12px] text-zinc-500">
            <Repeat2 className="size-4" /> Review queue
          </div>
          <div className="mt-1 text-3xl font-semibold tabular-nums text-zinc-900 dark:text-white">
            {due} <span className="text-base font-normal text-zinc-500">due today</span>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-[12px] text-zinc-500">{inQueue} questions in rotation</span>
            <ButtonLink href="/review" variant={due ? "primary" : "secondary"} className="h-8 px-3 text-[13px]">
              Review <ArrowRight className="size-3.5" />
            </ButtonLink>
          </div>
        </SpotlightCard>
      </div>

      {SECTIONS.map((sec) => {
        const mods = index.filter((m) => m.section === sec.id && m.quizCount > 0);
        if (!mods.length) return null;
        return (
          <section key={sec.id}>
            <h2 className="mb-4 text-lg font-semibold tracking-tight text-zinc-900 dark:text-white">{sec.title}</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {mods.map((m) => {
                const s = moduleStats(m, progress);
                const q = progress.quizzes[m.id];
                return (
                  <Link
                    key={m.id}
                    href={`/quizzes/${m.id}`}
                    className="group flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-zinc-300 dark:border-zinc-800/80 dark:bg-zinc-900/40 dark:hover:border-zinc-700"
                  >
                    <span
                      className={cn(
                        "grid size-10 shrink-0 place-items-center rounded-xl border",
                        s.quizPassed
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "border-zinc-200 text-zinc-500 dark:border-zinc-800",
                      )}
                    >
                      {s.quizPassed ? <CircleCheck className="size-5" /> : <ModuleIcon name={m.icon} className="size-5" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-zinc-900 dark:text-white">{m.title}</div>
                      <div className="text-[12px] text-zinc-500">
                        {q ? `Best ${q.best}/${q.total} · ${q.attempts} attempt${q.attempts === 1 ? "" : "s"}` : `${m.quizCount} questions`}
                      </div>
                    </div>
                    <ArrowRight className="size-4 text-zinc-300 transition-transform group-hover:translate-x-0.5 dark:text-zinc-600" />
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
