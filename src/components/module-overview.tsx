"use client";

import { ArrowRight, BookOpen, CircleCheck, Circle, Code2, ListChecks, Package } from "lucide-react";
import Link from "next/link";
import { moduleStats } from "@/lib/progress";
import type { ModuleIndex } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ProgressRing } from "./progress-ring";
import { useApp } from "./providers";
import { Badge, ButtonLink, Card, DifficultyBadge } from "./ui";

export function ModuleOverview({ m }: { m: ModuleIndex }) {
  const { progress } = useApp();
  const s = moduleStats(m, progress);
  const firstOpen = m.lessons.find((l) => !progress.lessons[`${m.id}/${l.id}`]) ?? m.lessons[0];
  const q = progress.quizzes[m.id];

  return (
    <div className="mt-10 grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <Card className="p-2">
          <div className="flex items-center justify-between px-4 pb-2 pt-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-white">
              <BookOpen className="size-4 text-zinc-400" /> Lessons
            </h2>
            <span className="text-[12px] text-zinc-500">
              {s.lessonsDone}/{s.lessonsTotal} done
            </span>
          </div>
          {m.lessons.map((l, i) => {
            const done = !!progress.lessons[`${m.id}/${l.id}`];
            return (
              <Link
                key={l.id}
                href={`/learn/${m.id}/${l.id}`}
                className="group flex items-center gap-4 rounded-xl px-4 py-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
              >
                {done ? <CircleCheck className="size-5 text-emerald-500" /> : <Circle className="size-5 text-zinc-300 dark:text-zinc-700" />}
                <span className="flex-1 text-sm text-zinc-800 dark:text-zinc-200">
                  <span className="mr-2 font-mono text-[11px] text-zinc-400">{i + 1}.</span>
                  {l.title}
                </span>
                <span className="text-[12px] text-zinc-400">{l.minutes} min</span>
                <ArrowRight className="size-4 text-zinc-300 transition-transform group-hover:translate-x-0.5 dark:text-zinc-600" />
              </Link>
            );
          })}
        </Card>

        {m.exercises.length > 0 && (
          <Card className="p-2">
            <div className="flex items-center justify-between px-4 pb-2 pt-3">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-white">
                <Code2 className="size-4 text-zinc-400" /> {m.kind === "project" ? "Project steps" : "Coding exercises"}
              </h2>
              <span className="text-[12px] text-zinc-500">
                {s.exercisesPassed}/{s.exercisesTotal} passed
              </span>
            </div>
            {m.exercises.map((e, i) => {
              const st = progress.exercises[`${m.id}/${e.id}`]?.status;
              return (
                <Link
                  key={e.id}
                  href={`/code/${m.id}/${e.id}`}
                  className="group flex items-center gap-4 rounded-xl px-4 py-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
                >
                  {st === "passed" ? (
                    <CircleCheck className="size-5 text-emerald-500" />
                  ) : (
                    <Circle className={cn("size-5", st === "attempted" ? "text-amber-400" : "text-zinc-300 dark:text-zinc-700")} />
                  )}
                  <span className="flex-1 text-sm text-zinc-800 dark:text-zinc-200">
                    <span className="mr-2 font-mono text-[11px] text-zinc-400">{i + 1}.</span>
                    {e.title}
                  </span>
                  <DifficultyBadge difficulty={e.difficulty} />
                </Link>
              );
            })}
          </Card>
        )}
      </div>

      <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
        <Card className="flex flex-col items-center p-6 text-center">
          <ProgressRing value={s.percent} size={128} />
          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
            {s.complete ? "Module complete." : "Lessons, the quiz and every exercise count toward this module."}
          </p>
          {firstOpen && (
            <ButtonLink href={`/learn/${m.id}/${firstOpen.id}`} className="mt-5 w-full">
              {s.lessonsDone === 0 ? "Start module" : s.lessonsDone === s.lessonsTotal ? "Review lessons" : "Continue"} <ArrowRight className="size-4" />
            </ButtonLink>
          )}
        </Card>
        {m.quizCount > 0 && (
          <Link href={`/quizzes/${m.id}`} className="block">
            <Card className="p-5 transition-colors hover:border-zinc-300 dark:hover:border-zinc-700">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-white">
                  <ListChecks className="size-4 text-zinc-400" /> Module quiz
                </span>
                {s.quizPassed && <CircleCheck className="size-4 text-emerald-500" />}
              </div>
              <p className="mt-2 text-[13px] text-zinc-500">
                {q ? `Best score ${q.best}/${q.total} · ${q.attempts} attempt${q.attempts === 1 ? "" : "s"}` : `${m.quizCount} questions · pass at 70%`}
              </p>
            </Card>
          </Link>
        )}
        {m.skills.length > 0 && (
          <Card className="p-5">
            <div className="text-sm font-semibold text-zinc-900 dark:text-white">Skills you&apos;ll earn</div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {m.skills.map((sk) => (
                <Badge key={sk}>{sk}</Badge>
              ))}
            </div>
          </Card>
        )}
        {m.packages.length > 0 && (
          <Card className="p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-white">
              <Package className="size-4 text-zinc-400" /> Install first
            </div>
            <p className="mt-2 text-[13px] text-zinc-500">This module uses packages that don&apos;t come with Python. Run once in a terminal:</p>
            <code className="mt-3 block rounded-lg bg-zinc-100 px-3 py-2 font-mono text-[12px] text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
              pip install {m.packages.join(" ")}
            </code>
          </Card>
        )}
      </aside>
    </div>
  );
}
