"use client";

import { CircleCheck, CircleX, Clock, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { HOSTED } from "@/lib/mode";
import type { RunResult } from "@/lib/types";
import { cn } from "@/lib/utils";

export function pipHint(error: string | null): string | null {
  const m = error ? /No module named '([\w.]+)'/.exec(error) : null;
  if (!m) return null;
  const mod = m[1].split(".")[0];
  const map: Record<string, string> = { bs4: "beautifulsoup4", PIL: "pillow", sklearn: "scikit-learn", yaml: "pyyaml" };
  return map[mod] ?? mod;
}

export function OutputView({ result, compact = false }: { result: RunResult; compact?: boolean }) {
  if (result.pythonMissing) {
    return (
      <div className="flex gap-3 p-4 text-sm text-amber-700 dark:text-amber-400">
        <TriangleAlert className="mt-0.5 size-4 shrink-0" />
        <div>
          Python 3.10+ was not found on this computer. Install it from python.org (tick &quot;Add Python to PATH&quot; on Windows), restart{" "}
          <code className="font-mono">npm run dev</code>, then check{" "}
          <Link href="/settings" className="underline">
            Settings
          </Link>
          .
        </div>
      </div>
    );
  }
  const pkg = HOSTED ? null : pipHint(result.error);
  return (
    <div className={cn("font-mono text-[12.5px] leading-relaxed", compact ? "max-h-72 overflow-auto p-3" : "p-4")}>
      {result.stdout && <pre className="whitespace-pre-wrap break-words text-zinc-800 dark:text-zinc-200">{result.stdout}</pre>}
      {result.error && <pre className="mt-1 whitespace-pre-wrap break-words text-rose-600 dark:text-rose-400">{result.error}</pre>}
      {pkg && (
        <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 font-sans text-[12.5px] text-amber-800 dark:text-amber-300">
          This needs a package. In a terminal, run <code className="font-mono">pip install {pkg}</code> (or{" "}
          <code className="font-mono">py -m pip install {pkg}</code> on Windows), then run again.
        </div>
      )}
      {!result.stdout && !result.error && <span className="text-zinc-400">(no output)</span>}
      {result.truncated && <div className="mt-2 text-amber-600">Output was cut off at 200 KB.</div>}
      <div className="mt-2 flex items-center gap-1.5 font-sans text-[11px] text-zinc-400">
        {result.timedOut ? (
          <Clock className="size-3" />
        ) : result.ok ? (
          <CircleCheck className="size-3 text-emerald-500" />
        ) : (
          <CircleX className="size-3 text-rose-500" />
        )}
        {result.timedOut ? "Timed out" : result.ok ? "Finished" : "Error"} · {result.durationMs} ms
      </div>
    </div>
  );
}
