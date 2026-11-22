import { HOSTED } from "./mode";
import type { ExerciseTest, ProgressEvent, ProgressRoot, RunResult } from "./types";

const headers = { "content-type": "application/json", "x-pypath": "1" };

export async function postEvent(event: ProgressEvent): Promise<ProgressRoot> {
  const res = await fetch("/api/progress", { method: "POST", headers, body: JSON.stringify(event) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Could not save progress");
  return data as ProgressRoot;
}

export interface RunBody {
  code: string;
  stdin?: string;
  mode?: "run" | "test";
  exercise?: string;
  /** Hosted mode only: the exercise's tests, graded in the browser. Local mode grades on the server by `exercise`. */
  tests?: ExerciseTest[];
}

export async function runCode(body: RunBody): Promise<RunResult> {
  if (HOSTED) {
    const { runInBrowser } = await import("./runner/browser");
    return runInBrowser(body);
  }
  const { tests: _tests, ...wire } = body;
  try {
    const res = await fetch("/api/run", { method: "POST", headers, body: JSON.stringify(wire) });
    const data = await res.json();
    if (!res.ok) return { ok: false, stdout: "", stderr: "", error: data.error ?? `Request failed (${res.status})`, tests: [], durationMs: 0 };
    return data as RunResult;
  } catch (e) {
    return { ok: false, stdout: "", stderr: "", error: `Could not reach the PyPath server: ${(e as Error).message}`, tests: [], durationMs: 0 };
  }
}
