/// <reference lib="webworker" />
// Module Web Worker: loads Pyodide from the pinned CDN and runs python/harness.py through pyodide-core.
import { PYODIDE_CDN } from "../mode";
import type { ExerciseTest } from "../types";
import { createPyodideRunner } from "./pyodide-core.ts";

export type WorkerRequest = { type: "run"; id: number; code: string; stdin?: string; tests?: ExerciseTest[] };
export type WorkerResponse =
  | { type: "status"; id: number; message: string }
  | { type: "start"; id: number }
  | { type: "chunk"; id: number; text: string }
  | { type: "result"; id: number; result: import("../types").RunResult }
  | { type: "fatal"; id: number; message: string };

const ctx = self as unknown as DedicatedWorkerGlobalScope;
const post = (m: WorkerResponse) => ctx.postMessage(m);

let runner: Promise<Awaited<ReturnType<typeof createPyodideRunner>>> | null = null;

function boot(id: number) {
  if (!runner) {
    runner = (async () => {
      post({ type: "status", id, message: "Loading Python (first time only, about 10 MB)…" });
      const mod = await import(/* webpackIgnore: true */ /* turbopackIgnore: true */ `${PYODIDE_CDN}pyodide.mjs`);
      const pyodide = await mod.loadPyodide({ indexURL: PYODIDE_CDN });
      const harness = await (await fetch("/harness.py")).text();
      return createPyodideRunner(pyodide, harness);
    })();
    runner.catch(() => (runner = null));
  }
  return runner;
}

ctx.onmessage = async (e: MessageEvent<WorkerRequest>) => {
  const { id, code, stdin, tests } = e.data;
  try {
    const r = await boot(id);
    const result = await r.run({
      code,
      stdin,
      tests,
      onStatus: (message) => post({ type: "status", id, message }),
      onStart: () => post({ type: "start", id }),
      onChunk: (text) => post({ type: "chunk", id, text }),
    });
    post({ type: "result", id, result });
  } catch (err) {
    post({ type: "fatal", id, message: (err as Error)?.message ?? String(err) });
  }
};
