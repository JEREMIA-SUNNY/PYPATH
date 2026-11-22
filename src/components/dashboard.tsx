"use client";

import { ArrowRight, Award, BookOpen, CalendarCheck, CircleCheck, Code2, Flame, ListChecks, Repeat2, Sparkles, Target, Zap } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { achievements, localDay, moduleStats, nextStep, overallStats, pickDaily } from "@/lib/progress";
import { cn } from "@/lib/utils";
import { Heatmap } from "./heatmap";
import { ModuleIcon } from "./module-icon";
import { ProgressRing } from "./progress-ring";
import { useApp } from "./providers";
import { SpotlightCard } from "./spotlight-card";
import { ButtonLink, DifficultyBadge, ProgressBar } from "./ui";

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: 0.04 * i, duration: 0.45, ease: [0.22, 1, 0.36, 1] as const } }),
};

function greeting() {
  const h = new Date().getHours();
  return h < 5 ? "Burning the midnight oil" : h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

function Stat({ icon: Icon, label, value, hint, i }: { icon: typeof Zap; label: string; value: React.ReactNode; hint?: string; i: number }) {
  return (
    <motion.div variants={fadeUp} custom={i} initial="hidden" animate="show" className="col-span-3 lg:col-span-2">
      <SpotlightCard className="h-full">
        <div className="flex items-center gap-2 text-[12px] font-medium text-zinc-500">
          <Icon className="size-4" />
          {label}
        </div>
        <div className="mt-3 text-2xl font-semibold tabular-nums tracking-tight sm:text-3xl text-zinc-900 dark:text-white">{value}</div>
        {hint && <div className="mt-1 text-[12px] text-zinc-500">{hint}</div>}
      </SpotlightCard>
    </motion.div>
  );
}

export function Dashboard() {
  const { catalog, index, progress, profile, dispatch } = useApp();
  const [hello, setHello] = useState("Welcome back");
  useEffect(() => setHello(greeting()), []);

  // The profile's syllabus IS the path: its own modules, in its own order.
  const path = index;
  const stats = useMemo(() => overallStats(index, progress, catalog.projects.length), [index, progress, catalog.projects.length]);
  const next = nextStep(path, progress);
  const pathStats = path.map((m) => moduleStats(m, progress));
  const pathPercent = pathStats.length ? Math.round(pathStats.reduce((a, s) => a + s.percent, 0) / pathStats.length) : 0;

  // Daily challenge: fixed for the whole day once chosen.
  const today = localDay();
  useEffect(() => {
    if (progress.daily?.date === today) return;
    const ref = pickDaily(path, progress, today);
    if (ref) dispatch({ type: "daily.set", date: today, ref });
  }, [today, progress, path, dispatch]);
  const dailyRef = progress.daily?.date === today ? progress.daily.ref : null;
  const [dMod, dEx] = dailyRef?.split("/") ?? [];
  const dailyModule = index.find((m) => m.id === dMod);
  const dailyEx = dailyModule?.exercises.find((e) => e.id === dEx);
  const dailyDone = !!dailyRef && progress.exercises[dailyRef]?.status === "passed";

  const earned = achievements(catalog, progress).filter((a) => a.earned);
  const name = progress.settings.name;

  return (
    <main className="relative">
      <div aria-hidden className="bg-dots mask-fade pointer-events-none absolute inset-x-0 top-0 h-[520px]" />
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-72 w-[46rem] -translate-x-1/2 rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-500/15" />

      <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-28 sm:px-6 sm:pt-32">
        {/* Hero */}
        <section className="grid items-center gap-10 lg:grid-cols-[1fr_auto]">
          <motion.div variants={fadeUp} custom={0} initial="hidden" animate="show">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/70 px-3 py-1 text-[12px] text-zinc-600 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400">
              <Sparkles className="size-3.5 text-indigo-500" />
              {hello}
              {name ? `, ${name}` : ""}
            </p>
            <h1 className="max-w-2xl text-4xl font-semibold leading-[1.08] tracking-tight text-zinc-900 sm:text-5xl dark:text-white">
              {profile && pathPercent === 0 ? (
                <>
                  {profile.emoji} {profile.title}. <span className="text-zinc-400 dark:text-zinc-500">{profile.tagline}.</span>
                </>
              ) : stats.percent === 0 ? (
                <>
                  Learn Python. <span className="text-zinc-400 dark:text-zinc-500">Get job-ready.</span>
                </>
              ) : (
                <>
                  You&apos;re {pathPercent}% along <span className="text-zinc-400 dark:text-zinc-500">your {profile ? `${profile.title} ` : ""}path.</span>
                </>
              )}
            </h1>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-zinc-600 dark:text-zinc-400">
              {profile ? (
                <>
                  {profile.summary} <span className="font-medium text-zinc-900 dark:text-white">{index.length} modules</span>, its own progress, saved on this computer.
                </>
              ) : (
                <>Pick a profile to get a syllabus built for your goal.</>
              )}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              {next ? (
                <ButtonLink href={next.href} className="h-11 px-5">
                  {stats.percent === 0 ? "Start learning" : "Continue"} <ArrowRight className="size-4" />
                </ButtonLink>
              ) : (
                <ButtonLink href="/career" className="h-11 px-5">
                  Path complete. Build a portfolio project <ArrowRight className="size-4" />
                </ButtonLink>
              )}
              <ButtonLink href="/learn" variant="secondary" className="h-11 px-5">
                Browse modules
              </ButtonLink>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} custom={1} initial="hidden" animate="show" className="flex items-center gap-6 justify-self-start lg:justify-self-end">
            <ProgressRing value={stats.percent} size={168} stroke={12} sublabel="all content" />
            <div className="space-y-3 text-sm">
              <div>
                <div className="text-zinc-500">{profile ? `${profile.title} path` : "Your path"}</div>
                <div className="font-semibold tabular-nums text-zinc-900 dark:text-white">{pathPercent}%</div>
              </div>
              <div>
                <div className="text-zinc-500">Modules done</div>
                <div className="font-semibold tabular-nums text-zinc-900 dark:text-white">
                  {stats.modulesComplete} / {index.length}
                </div>
              </div>
              <div>
                <div className="text-zinc-500">XP</div>
                <div className="font-semibold tabular-nums text-zinc-900 dark:text-white">{stats.xp.toLocaleString()}</div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Bento */}
        <section className="mt-14 grid grid-cols-6 gap-4">
          <motion.div variants={fadeUp} custom={2} initial="hidden" animate="show" className="col-span-6 lg:col-span-3">
            <SpotlightCard className="flex h-full flex-col">
              <div className="flex items-center gap-2 text-[12px] font-medium text-zinc-500">
                <Target className="size-4" /> Up next
              </div>
              {next ? (
                <>
                  <div className="mt-3 text-[12px] text-zinc-500">
                    {next.label} · {next.moduleTitle}
                  </div>
                  <div className="mt-1 text-xl font-semibold tracking-tight text-zinc-900 dark:text-white">{next.title}</div>
                  <div className="mt-auto flex items-center justify-between pt-5">
                    {progress.lastVisited ? (
                      <Link href={progress.lastVisited.href} className="truncate text-[12px] text-zinc-500 hover:text-zinc-900 dark:hover:text-white">
                        Last visited: {progress.lastVisited.title}
                      </Link>
                    ) : (
                      <span />
                    )}
                    <ButtonLink href={next.href} className="h-9">
                      Go <ArrowRight className="size-4" />
                    </ButtonLink>
                  </div>
                </>
              ) : (
                <div className="mt-3 text-zinc-600 dark:text-zinc-400">Everything on your path is done. Try a portfolio project or a mock interview.</div>
              )}
            </SpotlightCard>
          </motion.div>

          <motion.div variants={fadeUp} custom={3} initial="hidden" animate="show" className="col-span-6 lg:col-span-3">
            <SpotlightCard className="flex h-full flex-col">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[12px] font-medium text-zinc-500">
                  <CalendarCheck className="size-4" /> Today&apos;s challenge
                </div>
                {dailyEx && <DifficultyBadge difficulty={dailyEx.difficulty} />}
              </div>
              {dailyEx && dailyModule ? (
                <>
                  <div className="mt-3 text-[12px] text-zinc-500">{dailyModule.title}</div>
                  <div className="mt-1 text-xl font-semibold tracking-tight text-zinc-900 dark:text-white">{dailyEx.title}</div>
                  <div className="mt-auto flex items-center justify-between pt-5">
                    <span className={cn("flex items-center gap-1.5 text-[12px]", dailyDone ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-500")}>
                      {dailyDone ? <CircleCheck className="size-4" /> : <Flame className="size-4" />}
                      {dailyDone ? "Solved. See you tomorrow." : "One problem a day keeps the streak alive."}
                    </span>
                    <ButtonLink href={`/code/${dailyRef}`} variant={dailyDone ? "secondary" : "primary"} className="h-9">
                      {dailyDone ? "Open" : "Solve"} <ArrowRight className="size-4" />
                    </ButtonLink>
                  </div>
                </>
              ) : (
                <div className="mt-3 text-sm text-zinc-500">Start a module and a daily challenge will appear here.</div>
              )}
            </SpotlightCard>
          </motion.div>

          <Stat i={4} icon={Zap} label="Experience" value={stats.xp.toLocaleString()} hint="XP from lessons, quizzes, code and projects" />
          <Stat i={5} icon={Flame} label="Day streak" value={stats.streak} hint={`Longest: ${stats.longestStreak} days`} />
          <motion.div variants={fadeUp} custom={6} initial="hidden" animate="show" className="col-span-3 lg:col-span-2">
            <Link href="/review" className="block h-full">
              <SpotlightCard className="h-full">
                <div className="flex items-center gap-2 text-[12px] font-medium text-zinc-500">
                  <Repeat2 className="size-4" /> Review due
                </div>
                <div className="mt-3 text-2xl font-semibold tabular-nums tracking-tight sm:text-3xl text-zinc-900 dark:text-white">{stats.reviewDue}</div>
                <div className="mt-1 flex items-center gap-1 text-[12px] text-zinc-500">
                  {stats.reviewDue ? "Missed questions ready to revisit" : "Nothing due. Nice."} <ArrowRight className="size-3" />
                </div>
              </SpotlightCard>
            </Link>
          </motion.div>
          <Stat i={7} icon={BookOpen} label="Lessons" value={`${stats.lessonsDone}/${stats.lessonsTotal}`} />
          <Stat i={8} icon={Code2} label="Exercises passed" value={`${stats.exercisesPassed}/${stats.exercisesTotal}`} />
          <Stat
            i={9}
            icon={ListChecks}
            label="Quiz average"
            value={stats.quizAverage === null ? "–" : `${stats.quizAverage}%`}
            hint={`${stats.quizzesPassed} of ${stats.quizzesTotal} quizzes passed`}
          />

          <motion.div variants={fadeUp} custom={10} initial="hidden" animate="show" className="col-span-6 lg:col-span-4">
            <SpotlightCard className="h-full">
              <div className="mb-4 flex items-center gap-2 text-[12px] font-medium text-zinc-500">
                <Flame className="size-4" /> Activity, last 16 weeks
              </div>
              <Heatmap activity={progress.activity} />
            </SpotlightCard>
          </motion.div>
          <motion.div variants={fadeUp} custom={11} initial="hidden" animate="show" className="col-span-6 lg:col-span-2">
            <Link href="/career" className="block h-full">
              <SpotlightCard className="h-full">
                <div className="flex items-center gap-2 text-[12px] font-medium text-zinc-500">
                  <Award className="size-4" /> Achievements
                </div>
                <div className="mt-3 text-3xl font-semibold tabular-nums text-zinc-900 dark:text-white">
                  {earned.length}
                  <span className="text-lg text-zinc-400"> / {achievements(catalog, progress).length}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {earned.slice(-4).map((a) => (
                    <span key={a.id} className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-[11px] font-medium text-indigo-700 dark:text-indigo-300">
                      {a.title}
                    </span>
                  ))}
                  {earned.length === 0 && <span className="text-[12px] text-zinc-500">Finish a lesson to earn your first.</span>}
                </div>
              </SpotlightCard>
            </Link>
          </motion.div>
        </section>

        {/* Path */}
        <section className="mt-16">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-white">{profile ? `Your ${profile.title} syllabus` : "Your path"}</h2>
              <p className="mt-1 text-sm text-zinc-500">{index.length} modules, in the order they are taught.</p>
            </div>
            <Link href="/learn" className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white">
              All modules →
            </Link>
          </div>
          <div className="grid grid-cols-[minmax(0,1fr)] gap-2 sm:grid-cols-2">
            {pathStats.map((s, i) => (
              <Link
                key={s.module.id}
                href={`/learn/${s.module.id}`}
                className="group flex items-center gap-4 rounded-xl border border-transparent px-3 py-3 transition-colors hover:border-zinc-200 hover:bg-white dark:hover:border-zinc-800 dark:hover:bg-zinc-900/50"
              >
                <span
                  className={cn(
                    "grid size-9 shrink-0 place-items-center rounded-lg border",
                    s.complete
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "border-zinc-200 bg-white text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900",
                  )}
                >
                  {s.complete ? <CircleCheck className="size-4" /> : <ModuleIcon name={s.module.icon} className="size-4" />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-200">
                      <span className="mr-2 font-mono text-[11px] text-zinc-400">{String(i + 1).padStart(2, "0")}</span>
                      {s.module.title}
                    </span>
                    <span className="shrink-0 text-[11px] tabular-nums text-zinc-500">{s.percent}%</span>
                  </div>
                  <ProgressBar value={s.percent} className="mt-2" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
