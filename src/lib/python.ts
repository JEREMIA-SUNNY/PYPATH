import "server-only";
import { spawn, spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { MAX_OUTPUT, parseHarnessOutput, TIMEOUT_MS } from "./runner/parse";
import type { ExerciseTest, RunResult } from "./types";

const HARNESS = path.join(/* turbopackIgnore: true */ process.cwd(), "python", "harness.py");

export interface PythonInfo {
  found: boolean;
  command?: string;
  args?: string[];
  version?: string;
  tried: string[];
}

let cached: PythonInfo | null = null;

function candidates(): { command: string; args: string[] }[] {
  const list: { command: string; args: string[] }[] = [];
  if (process.env.PYPATH_PYTHON) list.push({ command: process.env.PYPATH_PYTHON, args: [] });
  if (process.platform === "win32") {
    list.push({ command: "py", args: ["-3"] }, { command: "python", args: [] }, { command: "python3", args: [] });
  } else {
    list.push({ command: "python3", args: [] }, { command: "python", args: [] });
  }
  return list;
}

/** Finds a Python 3.10+ interpreter once and remembers it. */
export function findPython(force = false): PythonInfo {
  if (cached && !force) return cached;
  const tried: string[] = [];
  for (const c of candidates()) {
    const label = [c.command, ...c.args].join(" ");
    tried.push(label);
    const r = spawnSync(c.command, [...c.args, "-c", "import sys; print(sys.version.split()[0]); print(sys.version_info >= (3, 10))"], {
      encoding: "utf8",
      timeout: 5000,
      windowsHide: true,
    });
    if (r.status === 0 && r.stdout) {
      const [version, okFlag] = r.stdout.trim().split(/\r?\n/);
      if (okFlag === "True") {
        cached = { found: true, command: c.command, args: c.args, version, tried };
        return cached;
      }
    }
  }
  cached = { found: false, tried };
  return cached;
}

export async function runPython(opts: { code: string; stdin?: string; tests?: ExerciseTest[] }): Promise<RunResult> {
  const py = findPython();
  if (!py.found || !py.command) {
    return { ok: false, stdout: "", stderr: "", error: null, tests: [], durationMs: 0, pythonMissing: true };
  }

  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "pypath-"));
  const sentinel = `__PYPATH_RESULT_${randomBytes(8).toString("hex")}__`;
  const mode = opts.tests ? "test" : "run";
  await fs.writeFile(path.join(dir, "main.py"), opts.code, "utf8");
  if (opts.tests) await fs.writeFile(path.join(dir, "tests.json"), JSON.stringify(opts.tests), "utf8");

  const started = Date.now();
  try {
    return await new Promise<RunResult>((resolve) => {
      const child = spawn(/* turbopackIgnore: true */ py.command!, [...(py.args ?? []), "-u", HARNESS, dir, sentinel, mode], {
        cwd: dir,
        env: { ...process.env, PYTHONIOENCODING: "utf-8", PYTHONUTF8: "1", PYTHONDONTWRITEBYTECODE: "1" },
        windowsHide: true,
      });
      let out = "";
      let err = "";
      let truncated = false;
      let timedOut = false;

      child.stdout.setEncoding("utf8");
      child.stderr.setEncoding("utf8");
      child.stdout.on("data", (chunk: string) => {
        if (out.length < MAX_OUTPUT * 2) out += chunk;
        else truncated = true;
      });
      child.stderr.on("data", (chunk: string) => {
        if (err.length < MAX_OUTPUT) err += chunk;
        else truncated = true;
      });
      child.stdin.on("error", () => {});
      child.stdin.end(opts.stdin ?? "");

      const timer = setTimeout(() => {
        timedOut = true;
        child.kill("SIGKILL");
      }, TIMEOUT_MS);

      child.on("close", () => {
        clearTimeout(timer);
        resolve(parseHarnessOutput({ out, err, sentinel, tests: opts.tests, timedOut, truncated, startedAt: started }));
      });
      child.on("error", (e) => {
        clearTimeout(timer);
        resolve({ ok: false, stdout: "", stderr: String(e), error: `Could not start Python: ${e.message}`, tests: [], durationMs: 0 });
      });
    });
  } finally {
    await fs.rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}
