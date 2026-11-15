// worker_threads worker used by check-content-pyodide.mjs.
// It loads Pyodide and runs jobs through the SAME runner core as the browser Web Worker.
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parentPort } from "node:worker_threads";
import { loadPyodide } from "pyodide";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const { createPyodideRunner } = await import(pathToFileURL(path.join(root, "src", "lib", "runner", "pyodide-core.ts")).href);

const pyodide = await loadPyodide();
const runner = await createPyodideRunner(pyodide, readFileSync(path.join(root, "python", "harness.py"), "utf8"));
parentPort.postMessage({ type: "ready" });

parentPort.on("message", async ({ id, code, stdin, tests }) => {
  try {
    const result = await runner.run({ code, stdin, tests });
    parentPort.postMessage({ type: "result", id, result });
  } catch (e) {
    parentPort.postMessage({ type: "result", id, result: { ok: false, stdout: "", stderr: "", error: String(e?.message ?? e), tests: [], durationMs: 0 } });
  }
});
