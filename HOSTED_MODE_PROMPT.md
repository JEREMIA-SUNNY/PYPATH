# Task: add a "hosted" mode to PyPath so it can be deployed on Vercel

You are working in the PyPath repo (Next.js 16 App Router, React 19, TypeScript, Tailwind v4).
Today PyPath is **local-only**: a Next.js server on 127.0.0.1 saves progress to
`data/progress.json` and runs learner code by spawning the user's own Python.
That cannot work on Vercel: Vercel Functions have a read-only filesystem (only a
temporary `/tmp`), no Python to spawn, and the API refuses any non-localhost request.

Add a second build mode, **hosted**, in which PyPath is a fully static site with **no
server code**:

1. **Progress** is saved to a JSON file the user chooses on their own computer
   (File System Access API), with a backup copy in the browser (IndexedDB), and
   restored automatically every time the site loads.
2. **Python** runs in the browser with **Pyodide** (WebAssembly) inside a Web Worker.

**Local mode must keep working exactly as it does today.** Do not remove or weaken anything
in local mode.

---

## 0. Before writing code

Read these first: `README.md`, `next.config.ts`, `package.json`, `src/app/layout.tsx`,
`src/components/providers.tsx`, `src/lib/client-api.ts`, `src/lib/progress.ts`
(the pure `applyEvent` / `emptyProgress` / `normalizeProgress` reducer, which is shared by
client and server), `src/lib/progress-store.ts`, `src/lib/python.ts`, `python/harness.py`,
`src/lib/guard.ts`, `src/lib/content.ts`, `src/lib/types.ts`, every route under `src/app/api/`,
`src/components/settings-client.tsx`, `src/components/workspace.tsx`, `src/components/output-view.tsx`,
and `scripts/check-content.mjs`.

Then write a short plan listing which files you will add or change, and work through it in small
steps. Run `npm run typecheck` after each step.

Where you are unsure about a current API (Next.js static export rules, Pyodide's latest
stable version and API, File System Access permission methods), check the official docs
instead of guessing.

---

## 1. Mode switch and build

- The mode is set at build time with the env var `NEXT_PUBLIC_PYPATH_MODE`, either `local`
  (default) or `hosted`. Expose it from one place, e.g. `src/lib/mode.ts`
  (`export const HOSTED = process.env.NEXT_PUBLIC_PYPATH_MODE === "hosted"`).
- Add scripts: `"build:hosted": "cross-env NEXT_PUBLIC_PYPATH_MODE=hosted next build"` and
  `"dev:hosted": "cross-env NEXT_PUBLIC_PYPATH_MODE=hosted next dev -p 3001"`. Add `cross-env`
  as a dev dependency so the scripts work on Windows too.
- The hosted build must be a **static export** (`output: "export"` when hosted). This means:
  - no route handlers in the hosted build. Exclude `src/app/api/**` cleanly. One option is to
    rename them to `route.local.ts` and set `pageExtensions` so `local.ts` is only included in
    local mode. Verify whichever approach you pick actually works with Next 16.
  - every dynamic route (`learn/[module]/[lesson]`, `code/[module]/[exercise]`,
    `quizzes/[module]`, `learn/[module]`, `code/[module]`) needs `generateStaticParams`
    built from `getCurriculum()`.
  - Route segment config (`export const dynamic = ...`) must be a literal. Don't try to make it
    conditional.
- **Progress loading moves to the client in both modes.** The root layout must stop calling
  `readProgress()` and stop being `force-dynamic`. `AppProvider` loads progress through a
  backend (section 2) and renders a small loading skeleton until it is ready. Local mode then
  loads from `GET /api/progress` exactly as before.
- Leave `allowedDevOrigins`, the 127.0.0.1 binding of `dev`/`start`, `guard.ts` and the
  `x-pypath` header untouched for local mode.

## 2. Progress in hosted mode: a file on the user's computer

### 2.1 Backend abstraction

Create `src/lib/progress-backend/` with one interface and two implementations:

```ts
interface ProgressBackend {
  load(): Promise<Progress>;        // initial progress (may show UI first, see 2.3)
  save(next: Progress, event: ProgressEvent): Promise<void>;
  status(): SaveStatus;             // for the navbar indicator
}
```

- `serverBackend` (local mode) wraps the existing `/api/progress` GET and POST. Keep the
  current behaviour where the server applies the event and the client adopts the server copy
  once nothing else is in flight.
- `fileBackend` (hosted mode) applies events locally with the existing `applyEvent` and
  persists as described below.
- `AppProvider` only talks to `ProgressBackend`. Components keep using `useApp().dispatch`
  unchanged.

### 2.2 Storage pieces (hosted)

- **Primary:** a `FileSystemFileHandle` for the user's file, by default named
  `pypath-progress.json`. Store the handle in IndexedDB (database `pypath`, store `handles`,
  key `progressFile`). Handles can be stored there and come back on the next visit.
- **Mirror:** the full progress JSON in IndexedDB (store `progress`, key `current`), plus the
  last 5 snapshots (store `snapshots`) taken before every `reset`, `import` or file switch, and
  at most once per hour otherwise.
- **The file format must be byte-for-byte the same shape as local mode's `data/progress.json`**
  (`version: 1`, same fields, pretty-printed with 2 spaces and a trailing newline). A user must
  be able to point the hosted site at their local `data/progress.json`, and copy a hosted file
  into `data/` for local mode.
- Call `navigator.storage.persist()` once after setup so the browser is less likely to evict
  IndexedDB.
- Add TypeScript declarations for `showSaveFilePicker`, `showOpenFilePicker`,
  `FileSystemHandle.queryPermission` and `requestPermission` if the DOM lib lacks them.

### 2.3 What happens on every page load (hosted)

Wrap the app in a `ProgressGate` client component that runs this before rendering the app:

1. If `"showSaveFilePicker" in window` is false, go to **Browser-only mode** (2.6).
2. Read the stored handle from IndexedDB.
   - **No handle:** show the **Setup screen** (2.4).
   - **Handle found:** call `queryPermission({ mode: "readwrite" })`.
     - `"granted"`: read the file and continue to step 3 with no UI.
     - `"prompt"`: show the **Welcome back screen**. `requestPermission` must be called
       from a click.
     - `"denied"`: show the Welcome back screen with a note that access was blocked, plus
       "Choose the file again".
3. Read and validate the file (`JSON.parse`, then `version === 1` and an object
   `lessons`, then `normalizeProgress`).
   - **`NotFoundError`** (deleted, moved or renamed): show the **Missing file screen**.
   - **Unreadable or corrupt JSON:** never overwrite it. Show the Missing file screen with
     the message "Your progress file is damaged" and offer "Restore from browser backup"
     (which writes to a **new** file the user picks) or "Choose another file".
4. **Reconcile** the file copy with the IndexedDB mirror using `updatedAt`:
   - same, or file newer: use the file and refresh the mirror.
   - mirror newer (for example, the last file write failed): use the mirror, write it to the
     file, and keep the old file content as a snapshot.
   - Then show a small toast: "Progress restored from pypath-progress.json · last saved
     {relative time}".
5. Render the app.

### 2.4 Setup screen (first visit)

Full-page card in the existing PyPath style (dark, Geist, gradient accents, motion
fade-in). Use this copy:

> **Save your progress on your computer**
>
> PyPath has no accounts and no server. Your progress is saved in one file on your computer:
> `pypath-progress.json`.
>
> ⚠️ **If this file is deleted, renamed or moved, PyPath can't find it and your progress is
> lost.** Keep it somewhere safe, like Documents, or a OneDrive or Google Drive folder so
> it's backed up automatically.
>
> ☐ I understand that this file is my progress.
>
> [ **Create progress file** ]  [ I already have a progress file ]
>
> Skip, and keep progress in this browser only (not recommended)

- Both buttons stay disabled until the checkbox is ticked.
- **Create progress file** calls `showSaveFilePicker({ suggestedName: "pypath-progress.json",
  types: [{ description: "PyPath progress", accept: { "application/json": [".json"] } }] })`,
  then writes `emptyProgress()`. If an IndexedDB mirror already exists (for example, they
  used browser-only mode before), write that instead and say so.
- **I already have a progress file** calls `showOpenFilePicker` and then follows step 3 of 2.3.
- The user cancelling a picker (`AbortError`) is not an error. Stay on the screen.
- **Skip** goes to Browser-only mode (2.6) and remembers that choice.

### 2.5 Welcome back and Missing file screens

**Welcome back** (needs one click):

> **Welcome back!**
> [ **Continue with pypath-progress.json** ]  (use the handle's real `name`)
> Tip: when Chrome asks, choose **"Allow on every visit"** so you won't need this click next
> time.
> Use a different file · Use the browser backup instead

**Missing file:**

> **We can't find your progress file**
> It may have been moved, renamed or deleted.
> [ **Find my file** ] → open picker
> [ **Restore from browser backup** ]: show when it was saved and a summary
> ("saved 2 hours ago · 34 lessons · 120 exercises"). This writes the backup into a file the
> user picks.
> [ Start fresh ]: confirm dialog first ("This starts with empty progress. Your browser backup
> is kept.")

### 2.6 Browser-only mode (Firefox, Safari, iPhone, or "Skip")

- IndexedDB is the primary store. No file.
- Show a dismissible banner, which comes back every 3 days:
  > Your browser can't save progress to a file automatically, so it's kept inside this
  > browser. Clearing browsing data will erase it. **Download a backup** regularly, or use
  > Chrome or Edge for automatic saving.
  > [ Download backup ] [ Restore from file ]
- Track `lastBackupAt` in IndexedDB settings, not inside the progress JSON. If it's older
  than 3 days and there's new progress since, show the banner again.
- **Download backup** creates a Blob download named `pypath-progress-YYYY-MM-DD.json`.
  **Restore from file** uses `<input type="file" accept=".json">` and goes through the same
  validation and `import` event as Settings.

### 2.7 Saving (hosted)

- `dispatch` keeps its optimistic update. Then:
  1. Write the mirror to IndexedDB immediately.
  2. Debounce file writes by about 400 ms, and run them through **one promise queue** so
     writes never interleave (same idea as `progress-store.ts`). Write with
     `handle.createWritable()`, then `write(json)`, then `close()`. This replaces the file
     atomically on close.
  3. Flush pending writes on `visibilitychange` (hidden) and `pagehide`.
- On write failure:
  - `NotFoundError`: the file vanished. Show a persistent red banner, "Progress file
    missing, your progress is still saved in this browser", with [Find my file] [Save to a
    new file].
  - `NotAllowedError`: permission was revoked. Banner with [Allow again] (calls
    `requestPermission` on click).
  - Never lose the event. The mirror already has it.
- Before `reset` or `import`, take a snapshot (the hosted equivalent of the server's
  `progress.backup-*.json`).

### 2.8 Navbar indicator and Settings

- Navbar: a small status pill with tooltip. Hosted with a file: "Saved to
  pypath-progress.json · just now". Browser-only: "Saved in this browser only" (amber). Error
  states: red. Local mode: keep whatever the navbar shows today.
- Settings, hosted mode:
  - Show the connected file's name and its last save time.
  - Add actions: **Change file**, **Disconnect file** (switches to browser-only after a
    confirm), **Download backup**, **Import**, **Reset**, and a list of browser snapshots you
    can restore.
  - Replace the `/api/progress?download=1` link with a Blob download. Hide the "Python
    interpreter" section and show "Python runs in your browser (Pyodide {version})".

## 3. Python in the browser (Pyodide)

### 3.1 Runner

- Create `src/lib/runner/` with `runCode()` that returns **exactly the existing `RunResult`
  shape** (`ok`, `stdout`, `stderr`, `error`, `tests`, `durationMs`, `timedOut`, `truncated`).
  The UI (`workspace.tsx`, `playground-client.tsx`, `code-block.tsx`, `output-view.tsx`) must
  not need to know which runner is used.
  - Local mode: `client-api.ts` → `/api/run` (unchanged).
  - Hosted mode: a **module Web Worker** that loads Pyodide.
- Pin a specific stable Pyodide version from the official CDN (check pyodide.org for the
  current stable release). Load it lazily on the **first Run or Submit**, not on page load.
  Show "Loading Python (first time only, about 10 MB)…" with progress in the output panel.
- **Reuse `python/harness.py` unchanged** so grading behaves the same in both modes:
  - Copy it into the worker at build time. A tiny prebuild script that copies it into
    `public/harness.py` (and fetches it from the worker) is fine. Keep **one** source of
    truth.
  - Per run, write `main.py` (and `tests.json` in test mode) into a fresh folder in Pyodide's
    virtual FS (e.g. `/home/pyodide/run-<n>`), set `sys.argv = ["harness.py", dir, sentinel,
    mode]`, and execute the harness.
  - Parse stdout with the same sentinel logic as `src/lib/python.ts`. Factor the parsing
    into a shared pure function and use it in both places.
- **Isolation between runs.** The harness replaces `sys.modules["__main__"]` and changes the
  working directory. Wrap each run in a small Python driver that saves `sys.modules` keys,
  `sys.path`, the cwd, `sys.stdout`/`stderr` and `__main__` before the run, and restores them
  after, removing any modules the learner's code imported from its own folder.
- **stdin:** feed the provided `stdin` string with `pyodide.setStdin`, line by line. When it
  runs out, `input()` must raise `EOFError`, as it does locally with stdin closed.
- **stdout/stderr:** `setStdout` / `setStderr` with batching. Cap at 200 KB and set
  `truncated` like the server does.
- **Timeout:** 10 s, the same message as local mode ("Timed out after 10 seconds. Is there
  an infinite loop, or an input() waiting for text?"). The reliable way is to `terminate()` the
  worker and start a fresh one for the next run. Optionally, if you add COOP/COEP headers,
  use `setInterruptBuffer` for a softer interrupt, but terminate must remain the fallback.
- **Packages:** before running, call `pyodide.loadPackagesFromImports(code)`. For imports
  that aren't in the Pyodide distribution, try `micropip.install`. Map import names to
  package names (`PIL` → `pillow`, `bs4` → `beautifulsoup4`, `yaml` → `pyyaml`). If a
  package can't be loaded, return a clear `error`: "The package X can't run in the browser.
  Run PyPath locally to use it."
- **Hidden tests:** in hosted mode the exercise tests must reach the browser. Include each
  exercise's `tests` and `stdin` only in that exercise page's data, not in the global
  catalog. Note in the README that hosted tests are visible to anyone who reads the page
  source. That is acceptable for a learning tool.

### 3.2 Things that can't run in a browser

Network calls (`requests`, `httpx`, `urllib` to real hosts), sending email (`smtplib`,
`imaplib`), running servers (`uvicorn`), threads, `subprocess`, and some `asyncio` and
`time.sleep` behaviour may fail or differ in Pyodide.

- Write `scripts/check-content-pyodide.mjs`. It loads Pyodide in Node with the `pyodide` npm
  package (dev dependency, same version as the CDN pin) and, like `check-content.mjs`,
  proves for every exercise that **the solution passes and the starter fails**. It must use
  the same harness and runner code path as the worker, as far as possible. It also runs every
  ```` ```python ```` block in the lessons and reports which ones error.
- It writes `content/browser-compat.json` listing exercise refs and lesson code blocks that
  don't work in Pyodide. Add `"check:content:browser"` to package.json.
- In hosted mode, items on that list show a friendly notice instead of a broken Run button:
  "This one needs Python on your computer (it uses the network / a server / threads). Get
  PyPath from GitHub to run it locally." Link to the repo URL from an env var
  `NEXT_PUBLIC_REPO_URL`.
- Don't rewrite lesson content to dodge the problem unless the fix is trivial and keeps the
  lesson's teaching point.

## 4. Docs and deploy

- README: add a "Hosted mode (Vercel)" section covering how progress works (file +
  browser backup), the browser support table (automatic file saving works in Chrome, Edge,
  Opera and Chrome on Android; Firefox and Safari use browser-only mode with backups), what
  can't run in the browser, and how to deploy:
  - Vercel project env: `NEXT_PUBLIC_PYPATH_MODE=hosted` and `NEXT_PUBLIC_REPO_URL=…`.
  - Build command `npm run build:hosted`. Output: the static export.
- Make sure `npm run build` (local) still produces the local app, and that hosted builds
  contain no `/api` routes and no Node-only imports (`server-only`, `node:fs`,
  `child_process`) in client bundles.
- Optional, nice to have: a web app manifest and icons so users can install PyPath. Chrome
  then keeps file permission for installed apps without asking every visit. Mention this in
  the Setup screen tip only if you implement it.

## 5. Acceptance checklist (verify each one and report results)

Build and checks:
- [ ] `npm run typecheck` passes.
- [ ] `npm run check:content` (local, real Python) still passes.
- [ ] `npm run build` (local) and `npm run build:hosted` both succeed with no warnings you
      introduced.
- [ ] `npm run check:content:browser` runs and writes `content/browser-compat.json`. Report
      how many exercises and lesson blocks are browser-compatible.

Local mode (`npm run dev`, then `npm start`): behaviour unchanged, and progress still lands in
`data/progress.json`.

Hosted mode (serve the static output and test in Chrome):
- [ ] First visit shows the Setup screen. The buttons stay disabled until the checkbox is
      ticked.
- [ ] Create file, then complete a lesson. The file on disk updates within about a second.
- [ ] Reload: the Welcome back click (or none, if "Allow on every visit" was chosen) restores
      the same progress.
- [ ] Delete the file and reload: the Missing file screen appears, and "Restore from browser
      backup" brings everything back into a new file.
- [ ] Corrupt the file by hand: the site doesn't overwrite it and offers restore.
- [ ] Point hosted mode at a local-mode `data/progress.json`: it loads correctly.
- [ ] Run: `print`, `input()` with stdin, an infinite loop (times out after 10 s and the next
      run still works), `import pandas`, and Submit on a few exercises with the same pass/fail
      as local mode.
- [ ] Firefox: Browser-only mode with the backup banner. Download and restore work.

When you're done, summarise what changed (files added and modified), anything you couldn't
do, and the compatibility numbers.
