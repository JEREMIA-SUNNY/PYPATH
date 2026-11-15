"use client";

import { LoaderCircle, Play, Trash2 } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { runCode } from "@/lib/client-api";
import type { RunResult } from "@/lib/types";
import { CodeEditor } from "./code-editor";
import { OutputView } from "./output-view";
import { RunnerStatus } from "./runner-status";
import { useApp } from "./providers";
import { Button, Kbd } from "./ui";

export function PlaygroundClient() {
  const { progress, dispatch } = useApp();
  const [code, setCode] = useState(progress.playground.code);
  const [stdin, setStdin] = useState(progress.playground.stdin);
  const [result, setResult] = useState<RunResult | null>(null);
  const [busy, setBusy] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const save = (c: string, s: string) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => dispatch({ type: "playground.save", code: c, stdin: s }), 800);
  };

  const run = useCallback(async () => {
    setBusy(true);
    setResult(await runCode({ code, stdin }));
    setBusy(false);
  }, [code, stdin]);

  return (
    <main className="mx-auto flex h-[100dvh] max-w-[1600px] flex-col px-3 pb-3 pt-[76px] sm:px-4 sm:pt-[84px]">
      <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[1.5fr_1fr]">
        <section className="flex min-h-[420px] flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/40">
          <div className="flex items-center justify-between border-b border-zinc-200 px-3 py-2 dark:border-zinc-800">
            <span className="text-sm font-semibold text-zinc-900 dark:text-white">Playground</span>
            <div className="flex items-center gap-2">
              <span className="hidden items-center gap-1 text-[11px] text-zinc-400 sm:flex">
                <Kbd>Ctrl</Kbd>+<Kbd>Enter</Kbd>
              </span>
              <Button className="h-8 px-3 text-[12px]" onClick={run} disabled={busy}>
                {busy ? <LoaderCircle className="size-3.5 animate-spin" /> : <Play className="size-3.5" />} Run
              </Button>
            </div>
          </div>
          <div className="min-h-0 flex-1">
            <CodeEditor
              value={code}
              onChange={(v) => {
                setCode(v);
                save(v, stdin);
              }}
              onRun={run}
              className="h-full"
            />
          </div>
        </section>
        <section className="flex min-h-[300px] flex-col gap-3">
          <div className="rounded-2xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900/40">
            <div className="mb-2 text-[12px] font-medium text-zinc-500">Input (one line per input() call)</div>
            <textarea
              value={stdin}
              onChange={(e) => {
                setStdin(e.target.value);
                save(code, e.target.value);
              }}
              rows={3}
              className="w-full rounded-lg bg-zinc-50 p-2 font-mono text-[12px] text-zinc-800 outline-none dark:bg-zinc-950 dark:text-zinc-200"
            />
          </div>
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/40">
            <div className="flex items-center justify-between border-b border-zinc-200 px-3 py-2 dark:border-zinc-800">
              <span className="text-[12px] font-medium text-zinc-500">Output</span>
              {result && (
                <button onClick={() => setResult(null)} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white" aria-label="Clear output">
                  <Trash2 className="size-3.5" />
                </button>
              )}
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              <RunnerStatus busy={busy} />
              {result ? <OutputView result={result} /> : <p className="p-4 text-[13px] text-zinc-400">Your output appears here. Code is saved automatically.</p>}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
