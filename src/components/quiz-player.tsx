"use client";

import { ArrowRight, Check, CircleCheck, CircleX, RotateCcw, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { QUIZ_PASS_RATIO, localDay } from "@/lib/progress";
import type { QuizQuestion } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Confetti } from "./confetti";
import { Markdown } from "./markdown";
import { ProgressRing } from "./progress-ring";
import { useApp } from "./providers";
import { Button, ButtonLink, Kbd } from "./ui";

/** Renders `backtick` spans as code without block elements, so it is valid inside buttons. */
export function InlineCode({ text }: { text: string }) {
  return (
    <>
      {text.split(/(`[^`]+`)/g).map((part, k) =>
        part.startsWith("`") && part.endsWith("`") ? (
          <code key={k} className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-[0.88em] dark:bg-zinc-800">
            {part.slice(1, -1)}
          </code>
        ) : (
          <span key={k}>{part}</span>
        ),
      )}
    </>
  );
}

/** Stable shuffle: the same question shows the same option order for a given attempt and day. */
function optionOrder(key: string, n: number): number[] {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) h = Math.imul(h ^ key.charCodeAt(i), 16777619);
  const rand = () => {
    h = (h + 0x6d2b79f5) | 0;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const order = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

export type PlayerQuestion = QuizQuestion & { ref: string; moduleTitle?: string };

export function QuizPlayer({
  questions,
  mode,
  moduleId,
  title,
  backHref,
}: {
  questions: PlayerQuestion[];
  mode: "quiz" | "review";
  moduleId?: string;
  title: string;
  backHref: string;
}) {
  const { dispatch } = useApp();
  const [run, setRun] = useState(0);
  const [i, setI] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [locked, setLocked] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>(() => questions.map(() => null));
  const [done, setDone] = useState(false);

  const q = questions[i];
  const orders = useMemo(() => {
    const day = localDay();
    return questions.map((qq) => optionOrder(`${qq.ref}:${run}:${day}`, qq.options.length));
  }, [questions, run]);
  const order = orders[i] ?? [];
  const score = answers.filter((a, k) => a === questions[k]?.answer).length;
  const passMark = Math.ceil(questions.length * QUIZ_PASS_RATIO);

  const lock = useCallback(() => {
    if (selected === null || locked) return;
    setLocked(true);
    const next = [...answers];
    next[i] = selected;
    setAnswers(next);
    if (mode === "review") dispatch({ type: "review.answer", ref: q.ref, correct: selected === q.answer });
  }, [selected, locked, answers, i, mode, dispatch, q]);

  const advance = useCallback(() => {
    if (!locked) return;
    if (i + 1 < questions.length) {
      setI(i + 1);
      setSelected(null);
      setLocked(false);
      return;
    }
    setDone(true);
    if (mode === "quiz" && moduleId) {
      const missed = questions.filter((qq, k) => answers[k] !== qq.answer).map((qq) => qq.ref);
      const correct = questions.filter((qq, k) => answers[k] === qq.answer).map((qq) => qq.ref);
      dispatch({ type: "quiz.finish", moduleId, score, total: questions.length, missed, correct });
    }
  }, [locked, i, questions, mode, moduleId, answers, score, dispatch]);

  useEffect(() => {
    if (done) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) return;
      const n = Number(e.key);
      if (!locked && n >= 1 && n <= (q?.options.length ?? 0)) setSelected(order[n - 1]);
      if (e.key === "Enter") (locked ? advance : lock)();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [done, locked, q, order, lock, advance]);

  const restart = () => {
    setRun((r) => r + 1);
    setI(0);
    setSelected(null);
    setLocked(false);
    setAnswers(questions.map(() => null));
    setDone(false);
  };

  const shuffledKey = useMemo(() => `${run}-${i}`, [run, i]);

  if (questions.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-300 p-12 text-center text-sm text-zinc-500 dark:border-zinc-700">
        No questions here yet.
      </div>
    );
  }

  if (done) {
    const passed = mode === "review" || score >= passMark;
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative">
        {passed && score > 0 && <Confetti />}
        <div className="flex flex-col items-center rounded-3xl border border-zinc-200 bg-white px-6 py-10 text-center dark:border-zinc-800 dark:bg-zinc-900/40">
          <ProgressRing value={(score / questions.length) * 100} size={150} label={`${score}/${questions.length}`} sublabel="correct" />
          <h2 className="mt-6 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
            {mode === "review"
              ? "Review session done"
              : score === questions.length
                ? "Perfect score!"
                : passed
                  ? "Quiz passed"
                  : "Not quite yet"}
          </h2>
          <p className="mt-2 max-w-md text-sm text-zinc-600 dark:text-zinc-400">
            {mode === "review"
              ? "Questions you got right come back later and later; missed ones return tomorrow."
              : passed
                ? "Questions you missed go into your review queue so they come back in a day or two."
                : `You need ${passMark} of ${questions.length} to pass. Skim the lessons again, then retry.`}
          </p>
          <div className="mt-6 flex gap-3">
            <Button variant="secondary" onClick={restart}>
              <RotateCcw className="size-4" /> {mode === "review" ? "Go again" : "Retry"}
            </Button>
            <ButtonLink href={backHref}>
              Done <ArrowRight className="size-4" />
            </ButtonLink>
          </div>
        </div>
        <div className="mt-8 space-y-3">
          {questions.map((qq, k) => {
            const ok = answers[k] === qq.answer;
            return (
              <div key={qq.ref} className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
                <div className="flex items-start gap-3">
                  {ok ? <CircleCheck className="mt-0.5 size-4 shrink-0 text-emerald-500" /> : <CircleX className="mt-0.5 size-4 shrink-0 text-rose-500" />}
                  <div className="prose-py min-w-0 text-[14px]">
                    <Markdown runnable={false}>{qq.question}</Markdown>
                    {!ok && (
                      <p className="text-[13px]">
                        Answer: <strong><InlineCode text={qq.options[qq.answer]} /></strong>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    );
  }

  const correct = locked && selected === q.answer;

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <span className="text-[12px] tabular-nums text-zinc-500">
          {i + 1} / {questions.length}
        </span>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-sky-500 via-indigo-500 to-violet-500"
            animate={{ width: `${((i + (locked ? 1 : 0)) / questions.length) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        <Link href={backHref} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white" aria-label="Leave quiz">
          <X className="size-4" />
        </Link>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={shuffledKey}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.22 }}
        >
          {q.moduleTitle && <p className="mb-2 text-[12px] text-zinc-500">{q.moduleTitle}</p>}
          <div className="prose-py text-[17px] font-medium text-zinc-900 dark:text-white">
            <Markdown runnable={false}>{q.question}</Markdown>
          </div>
          {q.code && (
            <div className="prose-py mt-4">
              <Markdown runnable={false}>{"```py\n" + q.code + "\n```"}</Markdown>
            </div>
          )}

          <div className="mt-6 grid gap-2.5" role="radiogroup">
            {order.map((k, pos) => {
              const opt = q.options[k];
              const isSel = selected === k;
              const isAns = k === q.answer;
              return (
                <motion.button
                  key={k}
                  role="radio"
                  aria-checked={isSel}
                  disabled={locked}
                  onClick={() => setSelected(k)}
                  animate={locked && isSel && !isAns ? { x: [0, -6, 6, -4, 4, 0] } : {}}
                  transition={{ duration: 0.35 }}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-[14px] transition-all",
                    !locked && isSel && "border-indigo-500 bg-indigo-500/5 ring-2 ring-indigo-500/20",
                    !locked && !isSel && "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:border-zinc-700 dark:hover:bg-zinc-900",
                    locked && isAns && "border-emerald-500/60 bg-emerald-500/10 shadow-[0_0_0_3px_rgb(16_185_129/0.12)]",
                    locked && isSel && !isAns && "border-rose-500/60 bg-rose-500/10",
                    locked && !isSel && !isAns && "border-zinc-200 opacity-60 dark:border-zinc-800",
                  )}
                >
                  <span
                    className={cn(
                      "grid size-6 shrink-0 place-items-center rounded-md border font-mono text-[11px]",
                      locked && isAns
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : locked && isSel
                          ? "border-rose-500 bg-rose-500 text-white"
                          : "border-zinc-300 text-zinc-500 dark:border-zinc-700",
                    )}
                  >
                    {locked && isAns ? <Check className="size-3.5" /> : locked && isSel ? <X className="size-3.5" /> : pos + 1}
                  </span>
                  <span className="text-zinc-800 dark:text-zinc-200">
                    <InlineCode text={opt} />
                  </span>
                </motion.button>
              );
            })}
          </div>

          <AnimatePresence>
            {locked && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "mt-5 rounded-xl border p-4 text-[14px]",
                  correct ? "border-emerald-500/30 bg-emerald-500/5" : "border-rose-500/30 bg-rose-500/5",
                )}
              >
                <div className={cn("mb-1 font-semibold", correct ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400")}>
                  {correct ? "Correct" : "Not quite"}
                </div>
                <div className="prose-py text-[14px]">
                  <Markdown runnable={false}>{q.explanation}</Markdown>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-6 flex items-center justify-between">
            <span className="hidden items-center gap-1.5 text-[11px] text-zinc-400 sm:flex">
              <Kbd>1</Kbd>–<Kbd>{q.options.length}</Kbd> pick · <Kbd>Enter</Kbd> {locked ? "next" : "check"}
            </span>
            {locked ? (
              <Button onClick={advance}>
                {i + 1 < questions.length ? "Next question" : "See results"} <ArrowRight className="size-4" />
              </Button>
            ) : (
              <Button onClick={lock} disabled={selected === null}>
                Check answer
              </Button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
