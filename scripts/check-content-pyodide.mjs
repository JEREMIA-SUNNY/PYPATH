#!/usr/bin/env node
// Browser-compatibility check. Runs everything in Pyodide (WebAssembly Python), through the same runner
// core as the hosted site's Web Worker, and records what can't work there:
//   - every exercise: the reference solution must pass all tests (and the starter must still fail)
//   - every ```python block in the lessons: must run (compared against real Python, so intentional errors are ignored)
// Writes content/browser-compat.json, which hosted mode uses to replace broken Run buttons with a notice.
// Usage: npm run check:content:browser            (everything)
//        npm run check:content:browser -- strings  (modules whose id contains "strings")
import { spawn, spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Worker } from "node:worker_threads";
import matter from "gray-matter";
import YAML from "yaml";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT = path.join(ROOT, "content");
const HARNESS = path.join(ROOT, "python", "harness.py");
const OUT = path.join(CONTENT, "browser-compat.json");
const filter = process.argv[2] ?? "";
const JOB_TIMEOUT_MS = 60_000;
const PYODIDE_VERSION = JSON.parse(readFileSync(path.join(ROOT, "node_modules", "pyodide", "package.json"), "utf8")).version;

// Identical to src/lib/hash.ts (hashCode); lesson blocks are looked up by it at runtime.
function hashCode(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

// ---------- real Python (to tell "broken in the browser" from "meant to fail") ----------
function findPython() {
  const c = process.env.PYPATH_PYTHON
    ? [[process.env.PYPATH_PYTHON]]
    : process.platform === "win32"
      ? [["py", "-3"], ["python"], ["python3"]]
      : [["python3"], ["python"]];
  for (const [cmd, ...args] of c) {
    const r = spawnSync(cmd, [...args, "--version"], { encoding: "utf8" });
    if (r.status === 0) return [cmd, args];
  }
  return null;
}
const LOCAL = findPython();

function runLocal(code) {
  const dir = mkdtempSync(path.join(os.tmpdir(), "pypath-compat-"));
  const sentinel = `__R_${randomBytes(6).toString("hex")}__`;
  writeFileSync(path.join(dir, "main.py"), code);
  return new Promise((resolve) => {
    const child = spawn(LOCAL[0], [...LOCAL[1], "-u", HARNESS, dir, sentinel, "run"], { cwd: dir, env: { ...process.env, PYTHONIOENCODING: "utf-8" } });
    let out = "";
    child.stdout.on("data", (d) => (out += d));
    child.stderr.on("data", () => {});
    child.stdin.end("");
    const t = setTimeout(() => child.kill("SIGKILL"), 20000);
    child.on("close", () => {
      clearTimeout(t);
      rmSync(dir, { recursive: true, force: true });
      const i = out.lastIndexOf(sentinel);
      if (i === -1) return resolve({ ok: false });
      try {
        resolve(JSON.parse(out.slice(i + sentinel.length).split("\n")[0]));
      } catch {
        resolve({ ok: false });
      }
    });
  });
}

// ---------- Pyodide worker pool ----------
class Pool {
  constructor(size) {
    this.size = size;
    this.idle = [];
    this.waiting = [];
  }
  spawn() {
    return new Promise((resolve, reject) => {
      const w = new Worker(path.join(ROOT, "scripts", "pyodide-node-worker.mjs"));
      w.once("error", reject);
      w.on("message", (m) => m.type === "ready" && resolve(w));
    });
  }
  async acquire() {
    if (this.idle.length) return this.idle.pop();
    if (this.created < this.size || this.created === undefined) {
      this.created = (this.created ?? 0) + 1;
      return this.spawn();
    }
    return new Promise((r) => this.waiting.push(r));
  }
  release(w) {
    const next = this.waiting.shift();
    if (next) next(w);
    else this.idle.push(w);
  }
  async replace(w) {
    await w.terminate();
    return this.spawn();
  }
  /** Runs one job; a job that hangs (e.g. an infinite loop) kills its worker and reports a timeout. */
  async run(job) {
    let w = await this.acquire();
    let result;
    try {
      result = await new Promise((resolve) => {
        const timer = setTimeout(() => resolve({ ok: false, error: "Timed out in Pyodide", tests: [], timedOut: true }), JOB_TIMEOUT_MS);
        const onMsg = (m) => {
          if (m.type === "result" && m.id === job.id) {
            clearTimeout(timer);
            w.off("message", onMsg);
            resolve(m.result);
          }
        };
        w.on("message", onMsg);
        w.postMessage(job);
      });
      if (result.timedOut) w = await this.replace(w);
    } finally {
      this.release(w);
    }
    return result;
  }
  async close() {
    for (const w of this.idle) await w.terminate();
  }
}
let jobId = 0;

// ---------- classification ----------
const NETWORK = /\b(requests|httpx|urllib|urlopen|socket|smtplib|imaplib|aiohttp)\b|ConnectionError|Name or service|Network is unreachable|gaierror|OSError: \[Errno 23\]|NetworkError|Failed to fetch/i;
const SERVER = /\b(uvicorn|http\.server|socketserver|TestClient|ASGI)\b/i;
const THREADS = /\b(threading|concurrent\.futures|multiprocessing|subprocess)\b|can't start new thread|thread/i;
const PACKAGE = /can't run in the browser|ModuleNotFoundError|No module named/i;

function classify(source, error) {
  const text = `${error ?? ""}\n${source}`;
  if (PACKAGE.test(error ?? "") && !SERVER.test(source)) {
    return NETWORK.test(source) ? "network" : "package";
  }
  if (SERVER.test(text)) return "server";
  if (THREADS.test(text)) return "threads";
  if (NETWORK.test(text)) return "network";
  return "other";
}

// ---------- gather work ----------
const pool = new Pool(Math.max(2, Math.min(4, os.cpus().length - 1)));
const exerciseIncompat = {};
const blockIncompat = {};
const stats = { exercises: 0, exercisesOk: 0, blocks: 0, blocksOk: 0, blocksSkipped: 0 };
const details = [];

const dirs = readdirSync(CONTENT, { withFileTypes: true })
  .filter((d) => d.isDirectory() && /^\d+[-_]/.test(d.name))
  .map((d) => d.name)
  .sort();

const tasks = [];
for (const d of dirs) {
  const id = d.replace(/^\d+[-_]/, "");
  if (filter && !id.includes(filter)) continue;
  const dir = path.join(CONTENT, d);

  const exFile = path.join(dir, "exercises.yaml");
  const exercises = existsSync(exFile) ? (YAML.parse(readFileSync(exFile, "utf8")) ?? []) : [];
  for (const e of exercises) {
    tasks.push(async () => {
      stats.exercises++;
      const ref = `${id}/${e.id}`;
      const sol = await pool.run({ id: ++jobId, code: e.solution, stdin: e.stdin ?? "", tests: e.tests });
      const bad = (sol.tests ?? []).filter((t) => !t.passed);
      const solOk = sol.ok && bad.length === 0 && (sol.tests ?? []).length > 0;
      if (!solOk) {
        const why = sol.error || bad.map((t) => `${t.name}: ${t.message}`).join("; ") || "no tests ran";
        exerciseIncompat[ref] = { reason: classify(e.solution, why), detail: why.split("\n").slice(-2).join(" ").slice(0, 200) };
        details.push(`exercise ${ref}: solution fails in browser -> ${why.split("\n").slice(-1)[0]}`);
        return;
      }
      const st = await pool.run({ id: ++jobId, code: e.starter, stdin: e.stdin ?? "", tests: e.tests });
      if ((st.tests ?? []).length && st.tests.every((t) => t.passed) && st.ok) details.push(`exercise ${ref}: starter already passes every test in the browser (also checked locally by check:content)`);
      stats.exercisesOk++;
    });
  }

  for (const f of readdirSync(dir).filter((f) => f.endsWith(".md")).sort()) {
    const { content } = matter(readFileSync(path.join(dir, f), "utf8"));
    const blocks = [...content.matchAll(/^```python[^\n]*\n([\s\S]*?)^```/gm)].map((m) => m[1].replace(/\n$/, ""));
    blocks.forEach((code, i) => {
      tasks.push(async () => {
        stats.blocks++;
        const where = `${id}/${f.replace(/^\d+[-_]/, "").replace(/\.md$/, "")}#${i + 1}`;
        const r = await pool.run({ id: ++jobId, code, stdin: "" });
        if (r.ok) return void stats.blocksOk++;
        // Failed in the browser. Only blame the browser if real Python runs it fine.
        if (!LOCAL) return void stats.blocksSkipped++;
        const local = await runLocal(code);
        if (!local.ok) return void stats.blocksOk++; // meant to fail, or needs something neither side has
        blockIncompat[hashCode(code)] = { reason: classify(code, r.error), detail: (r.error ?? "").split("\n").slice(-1)[0].slice(0, 200), at: where };
        details.push(`lesson block ${where}: ${(r.error ?? "").split("\n").slice(-1)[0]}`);
      });
    });
  }
}

if (!LOCAL) console.warn("Real Python not found: lesson blocks that fail in Pyodide can't be compared and are not flagged.");
console.log(`Pyodide ${PYODIDE_VERSION}: running ${tasks.length} jobs…`);

let next = 0;
let done = 0;
await Promise.all(
  Array.from({ length: pool.size }, async () => {
    while (next < tasks.length) {
      await tasks[next++]();
      if (++done % 25 === 0) process.stdout.write(`  ${done}/${tasks.length}\n`);
    }
  }),
);
await pool.close();

const sortKeys = (o) => Object.fromEntries(Object.entries(o).sort(([a], [b]) => a.localeCompare(b)));
if (!filter) {
  writeFileSync(
    OUT,
    JSON.stringify({ pyodide: PYODIDE_VERSION, generatedAt: new Date().toISOString(), exercises: sortKeys(exerciseIncompat), blocks: sortKeys(blockIncompat) }, null, 2) + "\n",
  );
}

console.log(`\nExercises:     ${stats.exercisesOk}/${stats.exercises} work in the browser (${stats.exercises - stats.exercisesOk} need local Python)`);
console.log(`Lesson blocks: ${stats.blocksOk}/${stats.blocks} work in the browser (${Object.keys(blockIncompat).length} need local Python${stats.blocksSkipped ? `, ${stats.blocksSkipped} unchecked` : ""})`);
if (details.length) {
  console.log("\nDetails:");
  for (const d of details) console.log(" - " + d);
}
console.log(filter ? "\n(filtered run: content/browser-compat.json was not rewritten)" : `\nWrote ${path.relative(ROOT, OUT)}`);
process.exit(0);
