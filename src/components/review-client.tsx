"use client";

import { Repeat2 } from "lucide-react";
import { useState } from "react";
import { localDay, reviewDue } from "@/lib/progress";
import type { QuizQuestion } from "@/lib/types";
import { useApp } from "./providers";
import { QuizPlayer } from "./quiz-player";
import { Button, ButtonLink } from "./ui";

type BankQ = QuizQuestion & { moduleId: string; moduleTitle: string };

export function ReviewClient({ bank }: { bank: Record<string, BankQ> }) {
  const { progress } = useApp();
  // Freeze the session's question list when it starts, so answering doesn't reshuffle it.
  const [session, setSession] = useState<string[] | null>(null);
  const due = reviewDue(progress).filter((r) => bank[r]);
  const all = Object.keys(progress.review).filter((r) => bank[r]);

  if (session) {
    const qs = session.map((ref) => ({ ...bank[ref], ref, moduleTitle: bank[ref].moduleTitle }));
    return <QuizPlayer key={session.join(",")} questions={qs} mode="review" title="Review" backHref="/quizzes" />;
  }

  const upcoming = Object.entries(progress.review)
    .filter(([ref, r]) => bank[ref] && r.due > localDay())
    .sort((a, b) => a[1].due.localeCompare(b[1].due))
    .slice(0, 8);

  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900/40">
      <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
        <Repeat2 className="size-6" />
      </span>
      <h2 className="mt-4 text-xl font-semibold text-zinc-900 dark:text-white">
        {due.length ? `${due.length} question${due.length === 1 ? "" : "s"} due today` : "You're all caught up"}
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-zinc-600 dark:text-zinc-400">
        Questions you miss in any quiz land here. Each right answer pushes the next review further out (1, 3, 7, 14, 30 days) until it graduates.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        {due.length > 0 && <Button onClick={() => setSession(due.slice(0, 20))}>Start review</Button>}
        {all.length > 0 && (
          <Button variant="secondary" onClick={() => setSession(all.slice(0, 20))}>
            Practice all {all.length} now
          </Button>
        )}
        {all.length === 0 && <ButtonLink href="/quizzes">Take a quiz</ButtonLink>}
      </div>
      {upcoming.length > 0 && (
        <div className="mx-auto mt-8 max-w-md text-left">
          <div className="mb-2 text-[12px] font-medium text-zinc-500">Coming up</div>
          {upcoming.map(([ref, r]) => (
            <div key={ref} className="flex justify-between border-t border-zinc-100 py-2 text-[13px] dark:border-zinc-800">
              <span className="truncate pr-4 text-zinc-700 dark:text-zinc-300">{bank[ref].moduleTitle}</span>
              <span className="shrink-0 tabular-nums text-zinc-500">
                {r.due} · box {r.box}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
