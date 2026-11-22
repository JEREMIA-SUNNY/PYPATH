// Runs python/harness.py inside a Pyodide instance. Used by the browser Web Worker AND by
// scripts/check-content-pyodide.mjs (Node), so both grade exactly the same way.
// Keep this file free of browser-only and bundler-only imports.
import type { ExerciseTest, RunResult } from "../types";
import { MAX_OUTPUT, parseHarnessOutput } from "./parse.ts";

/** Minimal shape of the Pyodide API we use. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PyodideAPI = any;

export interface CoreRunOptions {
  code: string;
  stdin?: string;
  tests?: ExerciseTest[];
  /** Called with each chunk of stdout as it is produced (lets the host keep partial output on timeout). */
  onChunk?: (text: string) => void;
  /** Called once packages are ready, right before the learner's code starts. The host starts its timeout here. */
  onStart?: () => void;
  /** Progress messages while loading packages. */
  onStatus?: (message: string) => void;
}

/** Import name -> PyPI / Pyodide package name, where they differ. */
export const IMPORT_TO_PACKAGE: Record<string, string> = {
  PIL: "pillow",
  bs4: "beautifulsoup4",
  yaml: "pyyaml",
  sklearn: "scikit-learn",
  cv2: "opencv-python",
  dateutil: "python-dateutil",
  dotenv: "python-dotenv",
  jwt: "pyjwt",
  fitz: "pymupdf",
};

// Runs once per Pyodide instance. `run_harness` isolates each run: it restores sys.modules, sys.path,
// cwd, stdout/stderr and __main__, because harness.py swaps them out.
const DRIVER = `
import ast, os, shutil, sys, importlib.util

def missing_imports(*sources):
    names = set()
    for src in sources:
        try:
            tree = ast.parse(src)
        except SyntaxError:
            continue
        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                names.update(a.name.split(".")[0] for a in node.names)
            elif isinstance(node, ast.ImportFrom) and node.level == 0 and node.module:
                names.add(node.module.split(".")[0])
    out = []
    for n in sorted(names):
        try:
            if importlib.util.find_spec(n) is None:
                out.append(n)
        except (ImportError, ValueError):
            out.append(n)
    return out

def run_harness(workdir, sentinel, mode, harness_src):
    saved_modules = set(sys.modules)
    saved_path = list(sys.path)
    saved_argv = list(sys.argv)
    saved_main = sys.modules.get("__main__")
    saved_cwd = os.getcwd()
    saved_out, saved_err = sys.stdout, sys.stderr
    sys.argv = ["harness.py", workdir, sentinel, mode]
    try:
        g = {"__name__": "__main__", "__file__": "harness.py"}
        exec(compile(harness_src, "harness.py", "exec"), g)
    except SystemExit:
        pass
    finally:
        sys.stdout, sys.stderr = saved_out, saved_err
        sys.argv = saved_argv
        sys.path[:] = saved_path
        try:
            os.chdir(saved_cwd)
        except OSError:
            os.chdir("/")
        if saved_main is not None:
            sys.modules["__main__"] = saved_main
        for name in list(sys.modules):
            if name in saved_modules:
                continue
            f = getattr(sys.modules[name], "__file__", None)
            if f and os.path.abspath(f).startswith(workdir):
                del sys.modules[name]
        importlib.invalidate_caches()
        shutil.rmtree(workdir, ignore_errors=True)
`;

export async function createPyodideRunner(pyodide: PyodideAPI, harnessSource: string) {
  pyodide.runPython(DRIVER);
  const runHarness = pyodide.globals.get("run_harness");
  const missingImports = pyodide.globals.get("missing_imports");
  let micropipReady = false;
  let counter = 0;

  const decoder = () => new TextDecoder("utf-8");

  async function ensurePackages(sources: string[], onStatus?: (m: string) => void): Promise<string | null> {
    // zoneinfo needs the tz database, which Pyodide ships as a separate package.
    if (sources.some((src) => src.includes("zoneinfo"))) await pyodide.loadPackage("tzdata").catch(() => {});
    for (const src of sources) {
      try {
        await pyodide.loadPackagesFromImports(src, { messageCallback: onStatus, errorCallback: onStatus });
      } catch (e) {
        return `Could not load a package this code needs: ${(e as Error).message}`;
      }
    }
    const proxy = missingImports(...sources);
    const missing: string[] = proxy.toJs();
    proxy.destroy();
    for (const name of missing) {
      const pkg = IMPORT_TO_PACKAGE[name] ?? name;
      try {
        if (!micropipReady) {
          onStatus?.("Loading package installer…");
          await pyodide.loadPackage("micropip");
          micropipReady = true;
        }
        onStatus?.(`Installing ${pkg}…`);
        await pyodide.pyimport("micropip").install(pkg);
      } catch {
        return `The package ${pkg} can't run in the browser. Run PyPath locally to use it.`;
      }
    }
    return null;
  }

  async function run(opts: CoreRunOptions): Promise<RunResult> {
    const startedAt = Date.now();
    const tests = opts.tests;
    const mode = tests ? "test" : "run";
    const sources = [opts.code, ...(tests ?? []).map((t) => t.code)];

    const pkgError = await ensurePackages(sources, opts.onStatus);
    if (pkgError) {
      return {
        ok: false,
        stdout: "",
        stderr: "",
        error: pkgError,
        tests: (tests ?? []).map((t) => ({ name: t.name, passed: false, message: "Did not run" })),
        durationMs: Date.now() - startedAt,
      };
    }

    const dir = `/home/pyodide/run-${++counter}`;
    pyodide.FS.mkdirTree(dir);
    pyodide.FS.writeFile(`${dir}/main.py`, opts.code, { encoding: "utf8" });
    if (tests) pyodide.FS.writeFile(`${dir}/tests.json`, JSON.stringify(tests), { encoding: "utf8" });

    const sentinel = `__PYPATH_RESULT_${Math.random().toString(16).slice(2)}${Date.now().toString(16)}__`;
    let out = "";
    let err = "";
    let truncated = false;
    const outDec = decoder();
    const errDec = decoder();
    pyodide.setStdout({
      write: (buf: Uint8Array) => {
        const text = outDec.decode(buf, { stream: true });
        if (out.length < MAX_OUTPUT * 2) {
          out += text;
          opts.onChunk?.(text);
        } else truncated = true;
        return buf.length;
      },
    });
    pyodide.setStderr({
      write: (buf: Uint8Array) => {
        const text = errDec.decode(buf, { stream: true });
        if (err.length < MAX_OUTPUT) err += text;
        else truncated = true;
        return buf.length;
      },
    });
    // One line per input() call; once the lines run out, input() raises EOFError like a closed stdin.
    const lines = (opts.stdin ?? "") === "" ? [] : (opts.stdin as string).replace(/\r\n/g, "\n").replace(/\n$/, "").split("\n");
    pyodide.setStdin({ stdin: () => (lines.length ? lines.shift() : undefined) });

    const runStarted = Date.now();
    opts.onStart?.();
    try {
      // asyncio.run() and friends need a promising entry point (JSPI). Fall back to a plain call where the engine lacks it.
      const promising = typeof (globalThis as { WebAssembly?: { promising?: unknown } }).WebAssembly?.promising === "function";
      if (promising && typeof runHarness.callPromising === "function") await runHarness.callPromising(dir, sentinel, mode, harnessSource);
      else runHarness(dir, sentinel, mode, harnessSource);
    } catch (e) {
      err += String((e as Error).message ?? e);
    } finally {
      pyodide.setStdin({ stdin: () => undefined });
    }
    return parseHarnessOutput({ out, err, sentinel, tests, truncated, startedAt: runStarted });
  }

  return { run };
}
