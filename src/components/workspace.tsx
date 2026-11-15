"use client";

import {
  ArrowLeft, ArrowRight, CircleCheck, CircleDashed, CircleX, Eye, FlaskConical, Lightbulb, LoaderCircle, Play, RotateCcw, Send, Timer,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { runCode } from "@/lib/client-api";
import { exerciseIncompat } from "@/lib/compat";
import { HOSTED } from "@/lib/mode";
import type { Exercise, ModuleIndex, RunResult } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CodeEditor } from "./code-editor";
import { Confetti } from "./confetti";
import { Markdown } from "./markdown";
import { OutputView } from "./output-view";
import { BrowserIncompatNotice, RunnerStatus } from "./runner-status";
import { useApp } from "./providers";
import { Badge, Button, DifficultyBadge, Kbd } from "./ui";

type LeftTab = "prompt" | "hints" | "tests" | "solution";

export function useCountdown(startedAt?: string, minutes?: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!startedAt) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [startedAt]);
  if (!startedAt || !minutes) return null;
  const left = Math.max(0, new Date(startedAt).getTime() + minutes * 60_000 - now);
  const mm = String(Math.floor(left / 60000)).padStart(2, "0");
  const ss = String(Math.floor((left % 60000) / 1000)).padStart(2, "0");
  return { left, label: `${mm}:${ss}` };
}

export function Workspace({ exercise, module: m }: { exercise: Exercise; module: ModuleIndex }) {
  const { progress, dispatch } = useApp();
  const ref = `${m.id}/${exercise.id}`;
  const record = progress.exercises[ref];
  const [code, setCode] = useState(record?.code ?? exercise.starter);
  const [stdin, setStdin] = useState(exercise.stdin ?? "");
  const [result, setResult] = useState<RunResult | null>(null);
  const [busy, setBusy] = useState<"run" | "test" | null>(null);
  const [bottom, setBottom] = useState<"output" | "tests">("output");
  const [left, setLeft] = useState<LeftTab>("prompt");
  const [hintsShown, setHintsShown] = useState(0);
  const [solution, setSolution] = useState(false);
  const [celebrate, setCelebrate] = useState(0);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const idx = m.exercises.findIndex((e) => e.id === exercise.id);
  const prev = m.exercises[idx - 1];
  const next = m.exercises[idx + 1];
  const incompat = HOSTED ? exerciseIncompat(ref) : null;
  const passed = record?.status === "passed";
  const mock = progress.mock && progress.mock.refs.includes(ref) ? progress.mock : undefined;
  const countdown = useCountdown(mock?.startedAt, mock?.minutes);

  useEffect(() => {
    dispatch({ type: "visit", href: `/code/${ref}`, title: exercise.title });
  }, [ref, exercise.title, dispatch]);

  const onChange = (v: string) => {
    setCode(v);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => dispatch({ type: "exercise.save", ref, code: v }), 800);
  };

  const run = useCallback(async () => {
    if (busy) return;
    setBusy("run");
    setBottom("output");
    setResult(await runCode({ code, stdin, mode: "run" }));
    setBusy(null);
  }, [busy, code, stdin]);

  const submit = useCallback(async () => {
    if (busy) return;
    setBusy("test");
    setBottom("tests");
    const r = await runCode({ code, mode: "test", exercise: ref, tests: exercise.tests, stdin: exercise.stdin });
    setResult(r);
    setBusy(null);
    if (r.pythonMissing) return;
    const allPassed = r.ok && r.tests.length > 0 && r.tests.every((t) => t.passed);
    if (allPassed && !passed) setCelebrate((c) => c + 1);
    dispatch({ type: "exercise.result", ref, code, passed: allPassed });
  }, [busy, code, ref, passed, dispatch, exercise.tests, exercise.stdin]);

  const tests = result?.tests ?? [];
  const passCount = tests.filter((t) => t.passed).length;
  const lastAllPassed = tests.length > 0 && passCount === tests.length;

  const tabBtn = (id: LeftTab, label: React.ReactNode) => (
    <button
      onClick={() => setLeft(id)}
      className={cn(
        "relative px-3 py-2.5 text-[13px] font-medium transition-colors",
        left === id ? "text-zinc-900 dark:text-white" : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200",
      )}
    >
      {label}
      {left === id && <motion.span layoutId="ws-left-tab" className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-zinc-900 dark:bg-white" />}
    </button>
  );

  return (
    <main className="mx-auto flex h-[100dvh] max-w-[1600px] flex-col px-3 pb-3 pt-[76px] sm:px-4 sm:pt-[84px]">
      {mock && countdown && (
        <div
          className={cn(
            "mb-3 flex items-center justify-between rounded-xl border px-4 py-2 text-[13px]",
            countdown.left === 0 ? "border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300" : "border-indigo-500/30 bg-indigo-500/10 text-indigo-800 dark:text-indigo-200",
          )}
        >
          <span className="flex items-center gap-2 font-medium">
            <Timer className="size-4" /> Mock interview {countdown.left === 0 ? "time is up" : "in progress"}
          </span>
          <span className="flex items-center gap-4">
            <span className="font-mono text-base tabular-nums">{countdown.label}</span>
            <Link href="/interview" className="underline underline-offset-2">
              Session
            </Link>
          </span>
        </div>
      )}
      <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[minmax(340px,0.85fr)_1.4fr]">
        {/* Left: prompt */}
        <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/40">
          <div className="border-b border-zinc-200 px-5 pb-0 pt-4 dark:border-zinc-800">
            <div className="flex items-center justify-between gap-2 text-[12px] text-zinc-500">
              <Link href={`/learn/${m.id}`} className="truncate hover:text-zinc-900 dark:hover:text-white">
                {m.title} · {idx + 1}/{m.exercises.length}
              </Link>
              <div className="flex items-center gap-1.5">
                {passed && (
                  <Badge className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                    <CircleCheck className="size-3" /> Passed
                  </Badge>
                )}
                <DifficultyBadge difficulty={exercise.difficulty} />
              </div>
            </div>
            <h1 className="mt-2 text-xl font-semibold tracking-tight text-zinc-900 dark:text-white">{exercise.title}</h1>
            <div className="-mb-px mt-3 flex">
              {tabBtn("prompt", "Prompt")}
              {exercise.hints.length > 0 && tabBtn("hints", `Hints (${exercise.hints.length})`)}
              {tabBtn("tests", `Tests (${exercise.tests.length})`)}
              {tabBtn("solution", "Solution")}
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
            {left === "prompt" && (
              <div className="prose-py text-[15px]">
                <Markdown runnable={false}>{exercise.prompt}</Markdown>
              </div>
            )}
            {left === "hints" && (
              <div className="space-y-3">
                {exercise.hints.slice(0, hintsShown).map((h, k) => (
                  <motion.div
                    key={k}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="prose-py rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-[14px]"
                  >
                    <Markdown runnable={false}>{`**Hint ${k + 1}.** ${h}`}</Markdown>
                  </motion.div>
                ))}
                {hintsShown < exercise.hints.length ? (
                  <Button variant="secondary" onClick={() => setHintsShown((n) => n + 1)}>
                    <Lightbulb className="size-4 text-amber-500" /> Show hint {hintsShown + 1}
                  </Button>
                ) : (
                  <p className="text-[13px] text-zinc-500">That&apos;s every hint. You&apos;ve got this.</p>
                )}
              </div>
            )}
            {left === "tests" && (
              <ul className="space-y-2">
                {exercise.tests.map((t) => {
                  const r = tests.find((x) => x.name === t.name);
                  return (
                    <li key={t.name} className="flex items-start gap-2.5 rounded-lg border border-zinc-200 px-3 py-2 text-[13px] dark:border-zinc-800">
                      {r ? (
                        r.passed ? (
                          <CircleCheck className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                        ) : (
                          <CircleX className="mt-0.5 size-4 shrink-0 text-rose-500" />
                        )
                      ) : (
                        <CircleDashed className="mt-0.5 size-4 shrink-0 text-zinc-400" />
                      )}
                      <div>
                        <div className="text-zinc-800 dark:text-zinc-200">{t.name}</div>
                        {r && !r.passed && <div className="mt-0.5 font-mono text-[12px] text-rose-600 dark:text-rose-400">{r.message}</div>}
                      </div>
                    </li>
                  );
                })}
                <p className="pt-2 text-[12px] text-zinc-500">The test code is hidden. Submit to run it against your solution.</p>
              </ul>
            )}
            {left === "solution" &&
              (solution ? (
                <div className="prose-py">
                  <Markdown runnable={false}>{"```py\n" + exercise.solution.replace(/\n$/, "") + "\n```"}</Markdown>
                  <p className="text-[13px]">There is usually more than one good answer. If yours passes the tests, it counts.</p>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-zinc-300 p-6 text-center dark:border-zinc-700">
                  <Eye className="mx-auto size-6 text-zinc-400" />
                  <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
                    Struggling is where the learning happens. Try the hints first; peek only when you&apos;re truly stuck.
                  </p>
                  <Button variant="secondary" className="mt-4" onClick={() => setSolution(true)}>
                    Reveal solution
                  </Button>
                </div>
              ))}
          </div>
          <div className="flex items-center justify-between border-t border-zinc-200 px-3 py-2 dark:border-zinc-800">
            {prev ? (
              <Link href={`/code/${m.id}/${prev.id}`} className="flex items-center gap-1 rounded-lg px-2 py-1 text-[12px] text-zinc-500 hover:text-zinc-900 dark:hover:text-white">
                <ArrowLeft className="size-3.5" /> {prev.title}
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link href={`/code/${m.id}/${next.id}`} className="flex items-center gap-1 rounded-lg px-2 py-1 text-[12px] text-zinc-500 hover:text-zinc-900 dark:hover:text-white">
                {next.title} <ArrowRight className="size-3.5" />
              </Link>
            ) : (
              <Link href="/code" className="flex items-center gap-1 rounded-lg px-2 py-1 text-[12px] text-zinc-500 hover:text-zinc-900 dark:hover:text-white">
                All exercises <ArrowRight className="size-3.5" />
              </Link>
            )}
          </div>
        </section>

        {/* Right: editor + console */}
        <section className="relative flex min-h-[560px] flex-col gap-3 lg:min-h-0">
          <AnimatePresence>{celebrate > 0 && <Confetti key={celebrate} />}</AnimatePresence>
          <div className="flex min-h-0 flex-[3] flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/40">
            <div className="flex items-center justify-between gap-2 border-b border-zinc-200 px-3 py-2 dark:border-zinc-800">
              <span className="flex items-center gap-2 rounded-md bg-zinc-100 px-2 py-1 font-mono text-[12px] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                main.py
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  className="h-8 px-2.5 text-[12px]"
                  onClick={() => {
                    if (confirm("Reset the editor to the starter code? Your current code will be replaced.")) {
                      setCode(exercise.starter);
                      dispatch({ type: "exercise.save", ref, code: exercise.starter });
                    }
                  }}
                >
                  <RotateCcw className="size-3.5" /> Reset
                </Button>
                <Button variant="secondary" className="h-8 px-3 text-[12px]" onClick={run} disabled={!!busy || !!incompat} title="Run (Ctrl+Enter)">
                  {busy === "run" ? <LoaderCircle className="size-3.5 animate-spin" /> : <Play className="size-3.5" />} Run
                </Button>
                <Button className="h-8 px-3 text-[12px]" onClick={submit} disabled={!!busy || !!incompat} title="Submit (Ctrl+Shift+Enter)">
                  {busy === "test" ? <LoaderCircle className="size-3.5 animate-spin" /> : <Send className="size-3.5" />} Submit
                </Button>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-hidden">
              <CodeEditor value={code} onChange={onChange} onRun={run} onSubmit={submit} className="h-full" />
            </div>
          </div>

          <div className="flex min-h-[200px] flex-[2] flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/40">
            <div className="flex items-center justify-between border-b border-zinc-200 px-2 dark:border-zinc-800">
              <div className="flex">
                {(["output", "tests"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setBottom(t)}
                    className={cn(
                      "relative px-3 py-2 text-[12px] font-medium capitalize",
                      bottom === t ? "text-zinc-900 dark:text-white" : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200",
                    )}
                  >
                    {t === "tests" && tests.length > 0 ? `Tests ${passCount}/${tests.length}` : t}
                    {bottom === t && <motion.span layoutId="ws-bottom-tab" className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-zinc-900 dark:bg-white" />}
                  </button>
                ))}
              </div>
              <span className="hidden items-center gap-1 pr-2 text-[11px] text-zinc-400 sm:flex">
                <Kbd>Ctrl</Kbd>+<Kbd>Enter</Kbd> run · <Kbd>Ctrl</Kbd>+<Kbd>Shift</Kbd>+<Kbd>Enter</Kbd> submit
              </span>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              {incompat && (
                <div className="p-3">
                  <BrowserIncompatNotice incompat={incompat} />
                </div>
              )}
              {bottom === "output" && (
                <div>
                  <details className="border-b border-zinc-100 px-4 py-2 text-[12px] text-zinc-500 dark:border-zinc-800">
                    <summary className="cursor-pointer select-none">Input for input() {stdin ? "(set)" : ""}</summary>
                    <textarea
                      value={stdin}
                      onChange={(e) => setStdin(e.target.value)}
                      rows={3}
                      placeholder="One line per input() call"
                      className="mt-2 w-full rounded-lg bg-zinc-50 p-2 font-mono text-[12px] text-zinc-800 outline-none dark:bg-zinc-950 dark:text-zinc-200"
                    />
                  </details>
                  <RunnerStatus busy={!!busy} />
                  {result ? (
                    <OutputView result={result} />
                  ) : (
                    <p className="p-4 text-[13px] text-zinc-400">Run your code to see its output here.</p>
                  )}
                </div>
              )}
              {bottom === "tests" && (
                <div className="p-4">
                  {busy === "test" && (
                    <p className="flex items-center gap-2 text-[13px] text-zinc-500">
                      <LoaderCircle className="size-4 animate-spin" /> Running tests…
                    </p>
                  )}
                  <RunnerStatus busy={busy === "test"} />
                  {!busy && tests.length === 0 && !result?.error && <p className="text-[13px] text-zinc-400">Submit to run the hidden tests.</p>}
                  {!busy && result && (
                    <>
                      {tests.length > 0 && (
                        <div
                          className={cn(
                            "mb-3 flex items-center gap-2 rounded-xl px-3 py-2 text-[13px] font-medium",
                            lastAllPassed ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "bg-rose-500/10 text-rose-700 dark:text-rose-400",
                          )}
                        >
                          {lastAllPassed ? <CircleCheck className="size-4" /> : <FlaskConical className="size-4" />}
                          {lastAllPassed
                            ? next
                              ? "All tests passed. On to the next one!"
                              : "All tests passed. Exercise set complete!"
                            : `${passCount} of ${tests.length} tests passed`}
                          {lastAllPassed && next && (
                            <Link href={`/code/${m.id}/${next.id}`} className="ml-auto underline underline-offset-2">
                              Next →
                            </Link>
                          )}
                        </div>
                      )}
                      <ul className="space-y-1.5">
                        {tests.map((t) => (
                          <li key={t.name} className="flex items-start gap-2 text-[13px]">
                            {t.passed ? (
                              <CircleCheck className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                            ) : (
                              <CircleX className="mt-0.5 size-4 shrink-0 text-rose-500" />
                            )}
                            <span>
                              <span className="text-zinc-800 dark:text-zinc-200">{t.name}</span>
                              {!t.passed && t.message && <span className="block font-mono text-[12px] text-rose-600 dark:text-rose-400">{t.message}</span>}
                            </span>
                          </li>
                        ))}
                      </ul>
                      {(result.error || result.stdout) && (
                        <div className="mt-3 rounded-xl border border-zinc-200 dark:border-zinc-800">
                          <OutputView result={result} compact />
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
