import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { applyRootEvent, emptyRoot, normalizeRoot } from "./profiles";
import type { ProgressEvent, ProgressRoot } from "./types";

export const DATA_DIR = path.resolve(/* turbopackIgnore: true */ process.env.PYPATH_DATA_DIR || path.join(/* turbopackIgnore: true */ process.cwd(), "data"));
export const PROGRESS_FILE = path.join(DATA_DIR, "progress.json");

const stamp = () => new Date().toISOString().replace(/[:.]/g, "-");

async function writeAtomic(data: ProgressRoot) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmp = `${PROGRESS_FILE}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2) + "\n", "utf8");
  try {
    await fs.rename(tmp, PROGRESS_FILE);
  } catch (err) {
    await fs.rm(tmp, { force: true });
    const code = (err as NodeJS.ErrnoException).code;
    // Windows can refuse a rename over a file another program (antivirus, an editor) has open.
    if (code !== "EPERM" && code !== "EACCES" && code !== "EBUSY") throw err;
    await fs.writeFile(PROGRESS_FILE, JSON.stringify(data, null, 2) + "\n", "utf8");
  }
}

export async function readProgress(): Promise<ProgressRoot> {
  let text: string;
  try {
    text = await fs.readFile(PROGRESS_FILE, "utf8");
  } catch {
    const fresh = emptyRoot();
    await writeAtomic(fresh);
    return fresh;
  }
  try {
    return normalizeRoot(JSON.parse(text));
  } catch {
    // Keep the unreadable file so nothing is silently lost, then start fresh.
    await fs.copyFile(PROGRESS_FILE, path.join(DATA_DIR, `progress.corrupt-${stamp()}.json`));
    const fresh = emptyRoot();
    await writeAtomic(fresh);
    return fresh;
  }
}

// All writes go through one promise chain so two requests can never interleave.
let queue: Promise<unknown> = Promise.resolve();

export function updateProgress(event: ProgressEvent): Promise<ProgressRoot> {
  const job = queue.then(async () => {
    const current = await readProgress();
    if (event.type === "reset" || event.type === "import") {
      await fs.copyFile(PROGRESS_FILE, path.join(DATA_DIR, `progress.backup-${stamp()}.json`)).catch(() => {});
    }
    const next = applyRootEvent(current, event);
    await writeAtomic(next);
    return next;
  });
  queue = job.catch(() => {});
  return job;
}
