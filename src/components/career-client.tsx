"use client";

import { Award, Check, CircleCheck, Copy, ExternalLink, Lock, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { achievements, moduleStats } from "@/lib/progress";
import type { PortfolioProject } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ModuleIcon } from "./module-icon";
import { useApp } from "./providers";
import { Badge, ProgressBar } from "./ui";

function ProjectCard({ p, highlight }: { p: PortfolioProject; highlight: boolean }) {
  const { progress, dispatch } = useApp();
  const rec = progress.projects[p.id];
  const done = rec?.done ?? [];
  const complete = !!rec?.completedAt;
  const [repo, setRepo] = useState(rec?.repo ?? "");
  const [copied, setCopied] = useState(false);
  useEffect(() => setRepo(rec?.repo ?? ""), [rec?.repo]);
  const pct = Math.round((done.length / p.steps.length) * 100);

  return (
    <div
      className={cn(
        "flex flex-col rounded-2xl border bg-white p-5 dark:bg-zinc-900/40",
        highlight ? "border-indigo-500/40 ring-1 ring-indigo-500/20" : "border-zinc-200 dark:border-zinc-800/80",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-zinc-900 dark:text-white">{p.title}</h3>
            {complete && <CircleCheck className="size-4 text-emerald-500" />}
          </div>
          <p className="mt-1 text-[13px] leading-relaxed text-zinc-600 dark:text-zinc-400">{p.summary}</p>
        </div>
        {highlight && <Badge className="shrink-0 border-indigo-500/30 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300">Your track</Badge>}
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {p.skills.map((s) => (
          <Badge key={s}>{s}</Badge>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between text-[11px] text-zinc-500">
        <span>
          {done.length}/{p.steps.length} steps
        </span>
        <span>{pct}%</span>
      </div>
      <ProgressBar value={pct} className="mt-1.5" />
      <ul className="mt-4 space-y-1">
        {p.steps.map((s) => {
          const on = done.includes(s.id);
          return (
            <li key={s.id}>
              <button
                onClick={() => dispatch({ type: "project.toggle", id: p.id, step: s.id, total: p.steps.length })}
                className="flex w-full items-start gap-2.5 rounded-lg px-2 py-1.5 text-left text-[13px] transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
              >
                <span
                  className={cn(
                    "mt-0.5 grid size-4 shrink-0 place-items-center rounded border",
                    on ? "border-emerald-500 bg-emerald-500 text-white" : "border-zinc-300 dark:border-zinc-600",
                  )}
                >
                  {on && <Check className="size-3" />}
                </span>
                <span className={cn(on ? "text-zinc-400 line-through" : "text-zinc-700 dark:text-zinc-300")}>{s.text}</span>
              </button>
            </li>
          );
        })}
      </ul>
      {p.stretch.length > 0 && (
        <details className="mt-3 text-[13px] text-zinc-500">
          <summary className="cursor-pointer select-none">Stretch goals</summary>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {p.stretch.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </details>
      )}
      <div className="mt-4 flex items-center gap-2">
        <input
          value={repo}
          onChange={(e) => setRepo(e.target.value)}
          onBlur={() => repo !== (rec?.repo ?? "") && dispatch({ type: "project.repo", id: p.id, repo })}
          placeholder="https://github.com/you/project"
          className="h-9 flex-1 rounded-lg border border-zinc-200 bg-transparent px-3 text-[13px] outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-zinc-800"
        />
        {rec?.repo && (
          <a href={rec.repo} target="_blank" rel="noreferrer" className="grid size-9 place-items-center rounded-lg border border-zinc-200 text-zinc-500 dark:border-zinc-800" aria-label="Open repo">
            <ExternalLink className="size-4" />
          </a>
        )}
      </div>
      <div className={cn("mt-4 rounded-xl p-3 text-[13px]", complete ? "bg-emerald-500/10" : "bg-zinc-50 dark:bg-zinc-950/50")}>
        <div className="mb-1 flex items-center justify-between text-[11px] font-medium uppercase tracking-wider text-zinc-500">
          {complete ? "Ready for your resume" : "Resume bullet (unlocks when done)"}
          {complete && (
            <button
              onClick={() => {
                navigator.clipboard?.writeText(p.bullet);
                setCopied(true);
                setTimeout(() => setCopied(false), 1200);
              }}
              className="flex items-center gap-1 normal-case tracking-normal text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            >
              {copied ? <Check className="size-3" /> : <Copy className="size-3" />} {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>
        <p className={cn("leading-relaxed", complete ? "text-zinc-800 dark:text-zinc-200" : "text-zinc-400 blur-[2px] select-none")}>{p.bullet}</p>
      </div>
    </div>
  );
}

export function CareerClient() {
  const { catalog, index, progress, dispatch } = useApp();
  const track = catalog.tracks.find((t) => t.id === progress.settings.trackId);
  const stats = index.map((m) => moduleStats(m, progress));
  const foundations = stats.filter((s) => s.module.section === "foundations");
  const foundationsPct = foundations.length ? Math.round(foundations.reduce((a, s) => a + s.percent, 0) / foundations.length) : 0;
  const earnedSkills = [...new Set(stats.filter((s) => s.complete).flatMap((s) => s.module.skills))];
  const learningSkills = [...new Set(stats.filter((s) => s.started && !s.complete).flatMap((s) => s.module.skills))].filter(
    (sk) => !earnedSkills.includes(sk),
  );
  const ach = achievements(catalog, progress);
  const projects = [...catalog.projects].sort((a, b) => Number(b.id === track?.project) - Number(a.id === track?.project));

  return (
    <div className="mt-10 space-y-16">
      {/* Tracks */}
      <section>
        <h2 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-white">Choose your target role</h2>
        <p className="mt-1 text-sm text-zinc-500">Your dashboard, next steps and daily challenge follow this track. You can switch any time.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {catalog.tracks.map((t) => {
            const active = t.id === track?.id;
            const mods = stats.filter((s) => t.modules.includes(s.module.id));
            const pct = mods.length ? Math.round(mods.reduce((a, s) => a + s.percent, 0) / mods.length) : 0;
            return (
              <button
                key={t.id}
                onClick={() => dispatch({ type: "settings", trackId: active ? "" : t.id })}
                className={cn(
                  "relative rounded-2xl border p-5 text-left transition-all",
                  active
                    ? "border-indigo-500 bg-indigo-500/[0.06] ring-2 ring-indigo-500/20"
                    : "border-zinc-200 bg-white hover:-translate-y-0.5 hover:border-zinc-300 dark:border-zinc-800/80 dark:bg-zinc-900/40 dark:hover:border-zinc-700",
                )}
              >
                {active && (
                  <motion.span layoutId="track-check" className="absolute right-4 top-4 grid size-6 place-items-center rounded-full bg-indigo-500 text-white">
                    <Check className="size-3.5" />
                  </motion.span>
                )}
                <ModuleIcon name={t.icon} className="size-6 text-zinc-700 dark:text-zinc-300" />
                <div className="mt-3 font-semibold text-zinc-900 dark:text-white">{t.title}</div>
                <div className="mt-0.5 text-[12px] text-zinc-500">{t.roles}</div>
                <p className="mt-2 text-[13px] leading-relaxed text-zinc-600 dark:text-zinc-400">{t.summary}</p>
                <div className="mt-4 flex items-center justify-between text-[11px] text-zinc-500">
                  <span>{t.modules.length} modules after Foundations</span>
                  <span>{pct}%</span>
                </div>
                <ProgressBar value={pct} className="mt-1.5" />
              </button>
            );
          })}
        </div>
      </section>

      {/* Roadmap */}
      {track && (
        <section>
          <h2 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-white">{track.title} roadmap</h2>
          <ol className="relative mt-6 space-y-3 border-l border-zinc-200 pl-6 dark:border-zinc-800">
            <li className="relative">
              <span className="absolute -left-[31px] top-3 grid size-3.5 place-items-center rounded-full border-2 border-white bg-indigo-500 dark:border-zinc-950" />
              <Link href="/learn" className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/40">
                <div className="flex-1">
                  <div className="text-sm font-medium text-zinc-900 dark:text-white">Foundations (modules 1 to {foundations.length})</div>
                  <ProgressBar value={foundationsPct} className="mt-2" />
                </div>
                <span className="text-[12px] tabular-nums text-zinc-500">{foundationsPct}%</span>
              </Link>
            </li>
            {track.modules.map((id) => {
              const s = stats.find((x) => x.module.id === id);
              if (!s) return null;
              return (
                <li key={id} className="relative">
                  <span
                    className={cn(
                      "absolute -left-[31px] top-3 size-3.5 rounded-full border-2 border-white dark:border-zinc-950",
                      s.complete ? "bg-emerald-500" : s.started ? "bg-amber-400" : "bg-zinc-300 dark:bg-zinc-700",
                    )}
                  />
                  <Link
                    href={`/learn/${id}`}
                    className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white px-4 py-3 transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/40 dark:hover:border-zinc-700"
                  >
                    <ModuleIcon name={s.module.icon} className="size-4 text-zinc-500" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-zinc-900 dark:text-white">{s.module.title}</div>
                      <ProgressBar value={s.percent} className="mt-2" />
                    </div>
                    <span className="text-[12px] tabular-nums text-zinc-500">{s.percent}%</span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </section>
      )}

      {/* Skills */}
      <section>
        <h2 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-white">Skills</h2>
        <p className="mt-1 text-sm text-zinc-500">Finish a module to earn its skills. These are the words recruiters search for.</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {earnedSkills.map((s) => (
            <span key={s} className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[13px] text-emerald-800 dark:text-emerald-300">
              <CircleCheck className="size-3.5" /> {s}
            </span>
          ))}
          {learningSkills.map((s) => (
            <span key={s} className="rounded-full border border-dashed border-zinc-300 px-3 py-1 text-[13px] text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
              {s}
            </span>
          ))}
          {earnedSkills.length + learningSkills.length === 0 && <p className="text-sm text-zinc-500">Start a module to see skills appear here.</p>}
        </div>
      </section>

      {/* Projects */}
      <section>
        <h2 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-white">Portfolio projects</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Build these in your own GitHub repo, outside the app. Tick steps as you go; a finished project unlocks a resume bullet and 150 XP.
        </p>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {projects.map((p) => (
            <ProjectCard key={p.id} p={p} highlight={p.id === track?.project} />
          ))}
        </div>
      </section>

      {/* Achievements */}
      <section>
        <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-zinc-900 dark:text-white">
          <Award className="size-5" /> Achievements
        </h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {ach.map((a) => (
            <div
              key={a.id}
              className={cn(
                "rounded-2xl border p-4",
                a.earned ? "border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 to-transparent" : "border-zinc-200 dark:border-zinc-800",
              )}
            >
              <div className="flex items-center gap-2">
                {a.earned ? <Sparkles className="size-4 text-indigo-500" /> : <Lock className="size-4 text-zinc-400" />}
                <span className={cn("text-sm font-medium", a.earned ? "text-zinc-900 dark:text-white" : "text-zinc-500")}>{a.title}</span>
              </div>
              <p className="mt-1 text-[12px] text-zinc-500">{a.description}</p>
              {!a.earned && a.progress && (
                <div className="mt-3">
                  <ProgressBar value={(a.progress[0] / Math.max(1, a.progress[1])) * 100} />
                  <div className="mt-1 text-right text-[11px] tabular-nums text-zinc-400">
                    {a.progress[0]}/{a.progress[1]}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
