import type { ExerciseTest, RunResult } from "../types.ts";

export const TIMEOUT_MS = 10_000;
export const MAX_OUTPUT = 200_000;
export const TIMEOUT_MESSAGE = `Timed out after ${TIMEOUT_MS / 1000} seconds. Is there an infinite loop, or an input() waiting for text?`;

/**
 * Turns the raw stdout/stderr of python/harness.py into a RunResult.
 * Shared by the local runner (src/lib/python.ts) and the in-browser Pyodide worker.
 * The harness prints its JSON result on a line that starts with a random sentinel.
 */
export function parseHarnessOutput(opts: {
  out: string;
  err: string;
  sentinel: string;
  tests?: ExerciseTest[];
  timedOut?: boolean;
  truncated?: boolean;
  startedAt: number;
}): RunResult {
  const { out, err, sentinel, tests, timedOut = false, startedAt } = opts;
  let truncated = opts.truncated ?? false;
  const idx = out.lastIndexOf(sentinel);
  let parsed: { ok: boolean; error: string | null; tests: RunResult["tests"]; durationMs: number } | null = null;
  let stdout = out;
  if (idx !== -1) {
    const line = out.slice(idx + sentinel.length).split(/\r?\n/)[0];
    try {
      parsed = JSON.parse(line);
    } catch {
      parsed = null;
    }
    stdout = out.slice(0, idx).replace(/\r?\n$/, "");
  }
  if (stdout.length > MAX_OUTPUT) {
    stdout = stdout.slice(0, MAX_OUTPUT);
    truncated = true;
  }
  return {
    ok: !timedOut && !!parsed?.ok,
    stdout,
    stderr: err,
    error: timedOut ? TIMEOUT_MESSAGE : parsed ? parsed.error : err || "Python exited without a result.",
    tests: parsed?.tests ?? (tests ?? []).map((t) => ({ name: t.name, passed: false, message: timedOut ? "Timed out" : "Did not run" })),
    durationMs: parsed?.durationMs ?? Date.now() - startedAt,
    timedOut,
    truncated,
  };
}
