"use client";

import { Check, Copy, LoaderCircle, Play } from "lucide-react";
import { useState } from "react";
import { runCode } from "@/lib/client-api";
import { blockIncompat } from "@/lib/compat";
import { HOSTED } from "@/lib/mode";
import type { RunResult } from "@/lib/types";
import { OutputView } from "./output-view";
import { BrowserIncompatNotice, RunnerStatus } from "./runner-status";

export function CodeBlock({ code, lang, runnable, children }: { code: string; lang: string; runnable: boolean; children: React.ReactNode }) {
  const [copied, setCopied] = useState(false);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);
  const incompat = HOSTED && runnable ? blockIncompat(code) : null;

  const run = async () => {
    setRunning(true);
    setResult(await runCode({ code }));
    setRunning(false);
  };

  return (
    <div className="not-prose group overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-900/60">
      <div className="flex items-center justify-between border-b border-zinc-200 px-3 py-1.5 dark:border-zinc-800">
        <span className="font-mono text-[11px] text-zinc-500">{lang === "py" ? "python" : lang || "text"}</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              navigator.clipboard?.writeText(code);
              setCopied(true);
              setTimeout(() => setCopied(false), 1200);
            }}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-zinc-500 hover:bg-zinc-200/70 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white"
            aria-label="Copy code"
          >
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
          {runnable && !incompat && (
            <button
              onClick={run}
              disabled={running}
              className="flex items-center gap-1 rounded-md bg-zinc-900 px-2 py-1 text-[11px] font-medium text-white hover:bg-zinc-700 disabled:opacity-60 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {running ? <LoaderCircle className="size-3.5 animate-spin" /> : <Play className="size-3.5" />}
              Run
            </button>
          )}
        </div>
      </div>
      <pre className="overflow-x-auto px-4 py-3 font-mono text-[13px] leading-relaxed">{children}</pre>
      {incompat && (
        <div className="border-t border-zinc-200 p-2 dark:border-zinc-800">
          <BrowserIncompatNotice incompat={incompat} compact />
        </div>
      )}
      <RunnerStatus busy={running} />
      {result && (
        <div className="border-t border-zinc-200 dark:border-zinc-800">
          <OutputView result={result} compact />
        </div>
      )}
    </div>
  );
}
