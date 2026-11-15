"use client";

import { PYODIDE_VERSION } from "../mode";
import type { ExerciseTest, RunResult } from "../types";
import { MAX_OUTPUT, TIMEOUT_MESSAGE, TIMEOUT_MS } from "./parse.ts";
import type { WorkerRequest, WorkerResponse } from "./pyodide.worker";

export interface BrowserRunBody {
  code: string;
  stdin?: string;
  mode?: "run" | "test";
  tests?: ExerciseTest[];
}

// ---------- status (for "Loading Python…" hints in the UI) ----------
let status: string | null = null;
const subs = new Set<() => void>();
const setStatus = (s: string | null) => {
  status = s;
  subs.forEach((f) => f());
};
export const subscribeRunnerStatus = (fn: () => void) => {
  subs.add(fn);
  return () => subs.delete(fn);
};
export const getRunnerStatus = () => status;
export const getServerRunnerStatus = () => null;

// ---------- worker lifecycle ----------
let worker: Worker | null = null;
let nextId = 1;
let chain: Promise<unknown> = Promise.resolve();

function getWorker(): Worker {
  if (!worker) worker = new Worker("/pyodide-worker.mjs", { type: "module" });
  return worker;
}

const failed = (error: string, tests: ExerciseTest[] | undefined, extra: Partial<RunResult> = {}): RunResult => ({
  ok: false,
  stdout: "",
  stderr: "",
  error,
  tests: (tests ?? []).map((t) => ({ name: t.name, passed: false, message: "Did not run" })),
  durationMs: 0,
  ...extra,
});

function runOnce(body: BrowserRunBody): Promise<RunResult> {
  const test = body.mode === "test";
  if (test && !body.tests) return Promise.resolve(failed("This exercise has no tests to run.", undefined));
  const id = nextId++;
  const started = Date.now();
  const w = getWorker();

  return new Promise<RunResult>((resolve) => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    let streamed = "";
    const done = (r: RunResult) => {
      if (timer) clearTimeout(timer);
      w.removeEventListener("message", onMessage);
      w.removeEventListener("error", onError);
      setStatus(null);
      resolve(r);
    };
    const onMessage = (e: MessageEvent<WorkerResponse>) => {
      const m = e.data;
      if (m.id !== id) return;
      if (m.type === "status") setStatus(m.message);
      else if (m.type === "start") {
        setStatus(null);
        // The 10 s limit covers the learner's code only, not Pyodide start-up or package downloads.
        timer = setTimeout(() => {
          // An infinite loop can't be interrupted from inside, so throw the worker away; the next run gets a fresh one.
          w.terminate();
          if (worker === w) worker = null;
          done({
            ok: false,
            stdout: streamed.slice(0, MAX_OUTPUT),
            stderr: "",
            error: TIMEOUT_MESSAGE,
            tests: (body.tests ?? []).map((t) => ({ name: t.name, passed: false, message: "Timed out" })),
            durationMs: Date.now() - started,
            timedOut: true,
            truncated: streamed.length > MAX_OUTPUT,
          });
        }, TIMEOUT_MS);
      } else if (m.type === "chunk") {
        if (streamed.length <= MAX_OUTPUT) streamed += m.text;
      } else if (m.type === "result") done(m.result);
      else if (m.type === "fatal") {
        w.terminate();
        if (worker === w) worker = null;
        done(failed(`Python could not start in your browser: ${m.message}. Check your internet connection (Python downloads once) and try again.`, body.tests));
      }
    };
    const onError = (e: ErrorEvent) => {
      w.terminate();
      if (worker === w) worker = null;
      done(failed(`Python could not start in your browser: ${e.message || "worker error"}`, body.tests));
    };
    w.addEventListener("message", onMessage);
    w.addEventListener("error", onError);
    const req: WorkerRequest = { type: "run", id, code: body.code, stdin: body.stdin, tests: test ? body.tests : undefined };
    w.postMessage(req);
  });
}

/** Runs code with Pyodide in a Web Worker. One run at a time; returns the same RunResult as the local runner. */
export function runInBrowser(body: BrowserRunBody): Promise<RunResult> {
  const job = chain.then(() => runOnce(body));
  chain = job.catch(() => {});
  return job;
}

export { PYODIDE_VERSION };
