#!/usr/bin/env node
// Validates every module under /content and proves each exercise is solvable:
//   - the reference solution must pass every test
//   - the starter code must fail at least one test
// Usage: npm run check:content            (all modules)
//        npm run check:content -- strings  (modules whose id contains "strings")
import { spawn, spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import matter from "gray-matter";
import YAML from "yaml";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");
const CONTENT = path.join(ROOT, "content");
const HARNESS = path.join(ROOT, "python", "harness.py");
const filter = process.argv[2] ?? "";
const errors = [];
const warn = (m) => errors.push(m);

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
  throw new Error("Python not found");
}
const [PY, PYARGS] = findPython();

function run(code, tests, stdin = "") {
  const dir = mkdtempSync(path.join(os.tmpdir(), "pypath-check-"));
  const sentinel = `__R_${randomBytes(6).toString("hex")}__`;
  writeFileSync(path.join(dir, "main.py"), code);
  writeFileSync(path.join(dir, "tests.json"), JSON.stringify(tests));
  return new Promise((resolve) => {
    const child = spawn(PY, [...PYARGS, "-u", HARNESS, dir, sentinel, "test"], { cwd: dir, env: { ...process.env, PYTHONIOENCODING: "utf-8" } });
    let out = "";
    let err = "";
    child.stdout.on("data", (d) => (out += d));
    child.stderr.on("data", (d) => (err += d));
    child.stdin.end(stdin);
    const t = setTimeout(() => child.kill("SIGKILL"), 20000);
    child.on("close", () => {
      clearTimeout(t);
      rmSync(dir, { recursive: true, force: true });
      const i = out.lastIndexOf(sentinel);
      if (i === -1) return resolve({ ok: false, error: err || "no result", tests: [] });
      resolve(JSON.parse(out.slice(i + sentinel.length).split("\n")[0]));
    });
  });
}

const dirs = readdirSync(CONTENT, { withFileTypes: true })
  .filter((d) => d.isDirectory() && /^\d+[-_]/.test(d.name))
  .map((d) => d.name)
  .sort();

const ids = new Set();
const jobs = [];
let lessons = 0;
let questions = 0;
let exerciseCount = 0;

for (const d of dirs) {
  const id = d.replace(/^\d+[-_]/, "");
  ids.add(id);
  const dir = path.join(CONTENT, d);
  const metaFile = path.join(dir, "module.yaml");
  if (!existsSync(metaFile)) warn(`${d}: missing module.yaml`);
  const meta = existsSync(metaFile) ? YAML.parse(readFileSync(metaFile, "utf8")) : {};
  if (!meta.title || !meta.summary) warn(`${d}: module.yaml needs title and summary`);
  for (const f of readdirSync(dir).filter((f) => f.endsWith(".md"))) {
    lessons++;
    const { data, content } = matter(readFileSync(path.join(dir, f), "utf8"));
    if (!data.title) warn(`${d}/${f}: missing title front-matter`);
    if (content.trim().length < 200) warn(`${d}/${f}: lesson looks too short`);
  }
  const quiz = existsSync(path.join(dir, "quiz.yaml")) ? YAML.parse(readFileSync(path.join(dir, "quiz.yaml"), "utf8")) ?? [] : [];
  quiz.forEach((q, i) => {
    questions++;
    if (!q.q || !Array.isArray(q.options) || q.options.length < 2) warn(`${d} quiz #${i + 1}: needs q and options`);
    if (!(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < (q.options?.length ?? 0))) warn(`${d} quiz #${i + 1}: answer index out of range`);
    if (!q.explain) warn(`${d} quiz #${i + 1}: missing explain`);
  });
  const exercises = existsSync(path.join(dir, "exercises.yaml"))
    ? YAML.parse(readFileSync(path.join(dir, "exercises.yaml"), "utf8")) ?? []
    : [];
  const exIds = new Set();
  for (const e of exercises) {
    exerciseCount++;
    if (exIds.has(e.id)) warn(`${d}: duplicate exercise id ${e.id}`);
    exIds.add(e.id);
    for (const k of ["id", "title", "prompt", "starter", "solution", "tests"]) if (!e[k]) warn(`${d}/${e.id}: missing ${k}`);
    if (!["easy", "medium", "hard", undefined].includes(e.difficulty)) warn(`${d}/${e.id}: bad difficulty`);
    if (!id.includes(filter) && !e.id.includes(filter)) continue;
    jobs.push(async () => {
      const sol = await run(e.solution, e.tests, e.stdin ?? "");
      const bad = sol.tests.filter((t) => !t.passed);
      if (!sol.ok || bad.length || sol.tests.length === 0) {
        warn(`${d}/${e.id}: SOLUTION FAILS -> ${sol.error ?? ""} ${bad.map((t) => `[${t.name}: ${t.message}]`).join(" ")}`);
      }
      const st = await run(e.starter, e.tests, e.stdin ?? "");
      if (st.tests.length && st.tests.every((t) => t.passed) && st.ok) warn(`${d}/${e.id}: starter already passes every test`);
      process.stdout.write(bad.length || !sol.ok ? "x" : ".");
    });
  }
}

for (const f of ["tracks.yaml", "projects.yaml"]) {
  if (!existsSync(path.join(CONTENT, f))) warn(`missing content/${f}`);
}
const tracks = existsSync(path.join(CONTENT, "tracks.yaml")) ? YAML.parse(readFileSync(path.join(CONTENT, "tracks.yaml"), "utf8")) : [];
const projects = existsSync(path.join(CONTENT, "projects.yaml")) ? YAML.parse(readFileSync(path.join(CONTENT, "projects.yaml"), "utf8")) : [];
for (const t of tracks) {
  for (const m of t.modules) if (!ids.has(m)) warn(`tracks.yaml ${t.id}: unknown module ${m}`);
  if (t.project && !projects.some((p) => p.id === t.project)) warn(`tracks.yaml ${t.id}: unknown project ${t.project}`);
}

const CONCURRENCY = Math.max(2, Math.min(8, os.cpus().length));
let next = 0;
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    while (next < jobs.length) await jobs[next++]();
  }),
);

console.log(`\n\n${dirs.length} modules · ${lessons} lessons · ${questions} quiz questions · ${exerciseCount} exercises (${jobs.length} executed)`);
if (errors.length) {
  console.log(`\n${errors.length} problem(s):`);
  for (const e of errors) console.log(" - " + e);
  process.exit(1);
}
console.log("All content checks passed.");
