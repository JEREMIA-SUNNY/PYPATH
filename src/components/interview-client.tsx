"use client";

import { ArrowRight, CircleCheck, Circle, Swords, Timer } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { moduleStats } from "@/lib/progress";
import { cn } from "@/lib/utils";
import { CodeHub } from "./code-hub";
import { ModuleIcon } from "./module-icon";
import { useApp } from "./providers";
import { SpotlightCard } from "./spotlight-card";
import { useCountdown } from "./workspace";
import { Button, DifficultyBadge, ProgressBar } from "./ui";

export function InterviewClient() {
  const { index, progress, dispatch } = useApp();
  const mods = index.filter((m) => m.section === "interview");
  const problems = mods.flatMap((m) => m.exercises.map((e) => ({ ref: `${m.id}/${e.id}`, m, e })));
  const solved = problems.filter((p) => progress.exercises[p.ref]?.status === "passed").length;
  const mock = progress.mock;
  const countdown = useCountdown(mock?.startedAt, mock?.minutes);
  const [summary, setSummary] = useState<{ passed: number; total: number } | null>(null);

  const start = () => {
    const unsolved = problems.filter((p) => progress.exercises[p.ref]?.status !== "passed");
    const pool = unsolved.length >= 2 ? unsolved : problems;
    const rand = <T,>(xs: T[]) => xs[Math.floor(Math.random() * xs.length)];
    const firstPool = pool.filter((p) => p.e.difficulty !== "hard");
    const first = rand(firstPool.length ? firstPool : pool);
    const secondPool = pool.filter((p) => p.ref !== first.ref && p.e.difficulty !== "easy");
    const second = rand(secondPool.length ? secondPool : pool.filter((p) => p.ref !== first.ref));
    setSummary(null);
    dispatch({ type: "mock.start", refs: [first.ref, second.ref].filter(Boolean), minutes: 45 });
  };

  const end = () => {
    if (!mock) return;
    const passed = mock.refs.filter((r) => {
      const rec = progress.exercises[r];
      return rec?.status === "passed" && rec.passedAt && rec.passedAt >= mock.startedAt;
    }).length;
    setSummary({ passed, total: mock.refs.length });
    dispatch({ type: "mock.end" });
  };

  return (
    <div className="mt-10 space-y-14">
      <div className="grid gap-4 lg:grid-cols-[1fr_1.3fr]">
        <SpotlightCard>
          <div className="text-[12px] font-medium text-zinc-500">Problems solved</div>
          <div className="mt-2 text-4xl font-semibold tabular-nums text-zinc-900 dark:text-white">
            {solved}
            <span className="text-xl text-zinc-400"> / {problems.length}</span>
          </div>
          <ProgressBar value={problems.length ? (solved / problems.length) * 100 : 0} className="mt-4" />
          <p className="mt-4 text-[13px] leading-relaxed text-zinc-500">
            Interviewers care about the pattern more than the problem. Learn each pattern&apos;s lesson, then solve its problems without peeking.
          </p>
        </SpotlightCard>

        <SpotlightCard className="relative">
          <div className="flex items-center gap-2 text-[12px] font-medium text-zinc-500">
            <Swords className="size-4" /> Mock interview
          </div>
          {mock ? (
            <>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-lg font-semibold text-zinc-900 dark:text-white">{countdown?.left === 0 ? "Time is up" : "In progress"}</span>
                <span className="flex items-center gap-1.5 font-mono text-2xl tabular-nums text-zinc-900 dark:text-white">
                  <Timer className="size-5 text-indigo-500" /> {countdown?.label}
                </span>
              </div>
              <div className="mt-4 space-y-2">
                {mock.refs.map((r, k) => {
                  const p = problems.find((x) => x.ref === r);
                  if (!p) return null;
                  const ok = progress.exercises[r]?.status === "passed";
                  return (
                    <Link
                      key={r}
                      href={`/code/${r}`}
                      className="flex items-center gap-3 rounded-xl border border-zinc-200 px-3 py-2.5 text-sm transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/40"
                    >
                      {ok ? <CircleCheck className="size-4 text-emerald-500" /> : <Circle className="size-4 text-zinc-300 dark:text-zinc-700" />}
                      <span className="flex-1">
                        <span className="mr-2 text-zinc-400">Q{k + 1}</span>
                        {p.e.title}
                      </span>
                      <DifficultyBadge difficulty={p.e.difficulty} />
                      <ArrowRight className="size-4 text-zinc-400" />
                    </Link>
                  );
                })}
              </div>
              <Button variant="secondary" className="mt-4" onClick={end}>
                End session
              </Button>
            </>
          ) : summary ? (
            <>
              <div className="mt-2 text-lg font-semibold text-zinc-900 dark:text-white">
                You solved {summary.passed} of {summary.total}.
              </div>
              <p className="mt-1 text-[13px] text-zinc-500">
                {summary.passed === summary.total
                  ? "That's an offer-worthy round. Try another tomorrow."
                  : "Read the pattern lessons for the ones you missed, then try again in a day or two."}
              </p>
              <Button className="mt-4" onClick={start}>
                Start another
              </Button>
            </>
          ) : (
            <>
              <p className="mt-2 text-[14px] leading-relaxed text-zinc-600 dark:text-zinc-400">
                Two problems, 45 minutes: one warm-up and one harder. Talk through your approach out loud as you code; that is half of a real interview.
              </p>
              <Button className="mt-5" onClick={start} disabled={problems.length < 2}>
                <Timer className="size-4" /> Start mock interview
              </Button>
            </>
          )}
        </SpotlightCard>
      </div>

      <section>
        <h2 className="mb-4 text-lg font-semibold tracking-tight text-zinc-900 dark:text-white">Patterns</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {mods.map((m) => {
            const s = moduleStats(m, progress);
            return (
              <Link
                key={m.id}
                href={`/learn/${m.id}`}
                className="group rounded-2xl border border-zinc-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-zinc-300 dark:border-zinc-800/80 dark:bg-zinc-900/40 dark:hover:border-zinc-700"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "grid size-9 place-items-center rounded-lg border",
                      s.complete ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600" : "border-zinc-200 text-zinc-500 dark:border-zinc-800",
                    )}
                  >
                    <ModuleIcon name={m.icon} className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-zinc-900 dark:text-white">{m.title}</div>
                    <div className="text-[12px] text-zinc-500">
                      {s.exercisesPassed}/{s.exercisesTotal} problems
                    </div>
                  </div>
                </div>
                <ProgressBar value={s.percent} className="mt-3" />
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-white">All problems</h2>
        <CodeHub sections={["interview"]} />
      </section>
    </div>
  );
}
