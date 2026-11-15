"use client";

import { BookOpen, CircleCheck, Code2, ListChecks, Package } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { moduleStats } from "@/lib/progress";
import type { ModuleIndex, Section } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ModuleIcon } from "./module-icon";
import { useApp } from "./providers";
import { Badge, ProgressBar } from "./ui";

export const SECTIONS: { id: Section; title: string; blurb: string }[] = [
  { id: "foundations", title: "Foundations", blurb: "The core language, from your first print() to decorators, the standard library and two guided projects." },
  { id: "career", title: "Career modules", blurb: "What Python job listings ask for: Git, testing, APIs, SQL, FastAPI, data analysis, automation and AI apps." },
  { id: "interview", title: "Interview prep", blurb: "Data-structure and algorithm patterns, drilled with test-checked problems, plus common Python questions." },
];

export function ModuleCard({ m, i }: { m: ModuleIndex; i: number }) {
  const { progress } = useApp();
  const s = moduleStats(m, progress);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: (i % 3) * 0.05 }}
    >
      <Link
        href={`/learn/${m.id}`}
        className="group relative flex h-full flex-col rounded-2xl border border-zinc-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-lg hover:shadow-zinc-900/5 dark:border-zinc-800/80 dark:bg-zinc-900/40 dark:hover:border-zinc-700 dark:hover:shadow-black/30"
      >
        <div className="flex items-start justify-between">
          <span
            className={cn(
              "grid size-10 place-items-center rounded-xl border",
              s.complete
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300",
            )}
          >
            {s.complete ? <CircleCheck className="size-5" /> : <ModuleIcon name={m.icon} className="size-5" />}
          </span>
          <span className="font-mono text-[11px] text-zinc-400">{String(m.order).padStart(2, "0")}</span>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <h3 className="font-semibold tracking-tight text-zinc-900 dark:text-white">{m.title}</h3>
          {m.kind === "project" && <Badge className="border-indigo-500/30 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300">Project</Badge>}
        </div>
        <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-zinc-600 dark:text-zinc-400">{m.summary}</p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          <Badge>
            <BookOpen className="size-3" /> {m.lessons.length}
          </Badge>
          {m.quizCount > 0 && (
            <Badge>
              <ListChecks className="size-3" /> {m.quizCount}
            </Badge>
          )}
          {m.exercises.length > 0 && (
            <Badge>
              <Code2 className="size-3" /> {m.exercises.length}
            </Badge>
          )}
          {m.packages.length > 0 && (
            <Badge className="border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400">
              <Package className="size-3" /> {m.packages.join(", ")}
            </Badge>
          )}
        </div>
        <div className="mt-auto pt-5">
          <div className="mb-1.5 flex justify-between text-[11px] text-zinc-500">
            <span>{s.complete ? "Complete" : s.started ? "In progress" : "Not started"}</span>
            <span className="tabular-nums">{s.percent}%</span>
          </div>
          <ProgressBar value={s.percent} />
        </div>
      </Link>
    </motion.div>
  );
}

export function LearnGrid() {
  const { index } = useApp();
  return (
    <div className="space-y-16">
      {SECTIONS.map((sec) => {
        const mods = index.filter((m) => m.section === sec.id);
        if (!mods.length) return null;
        return (
          <section key={sec.id}>
            <div className="mb-6 max-w-2xl">
              <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-white">{sec.title}</h2>
              <p className="mt-1 text-sm text-zinc-500">{sec.blurb}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {mods.map((m, i) => (
                <ModuleCard key={m.id} m={m} i={i} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
