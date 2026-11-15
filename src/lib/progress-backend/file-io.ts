import { normalizeProgress } from "../progress";
import type { Progress } from "../types";
import type { FSFileHandle, FilePickerOptions, PickerWindow } from "./fs-types";

export const DEFAULT_FILE_NAME = "pypath-progress.json";
const PICKER_TYPES: FilePickerOptions["types"] = [{ description: "PyPath progress", accept: { "application/json": [".json"] } }];

export const hasFilePicker = () => typeof window !== "undefined" && "showSaveFilePicker" in window;

/** Same bytes as local mode's data/progress.json: 2-space JSON plus a trailing newline. */
export const serialize = (p: Progress) => JSON.stringify(p, null, 2) + "\n";

export class ProgressFileError extends Error {
  constructor(
    public code: "missing" | "corrupt" | "permission",
    message: string,
  ) {
    super(message);
  }
}

/** Parses and validates a progress document. Throws ProgressFileError("corrupt") if it isn't one. */
export function parseProgressText(text: string): Progress {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new ProgressFileError("corrupt", "Your progress file is damaged");
  }
  const d = raw as Record<string, unknown> | null;
  if (!d || typeof d !== "object" || d.version !== 1 || !d.lessons || typeof d.lessons !== "object") {
    throw new ProgressFileError("corrupt", "That file is not a PyPath progress file");
  }
  return normalizeProgress(raw);
}

export async function readFile(handle: FSFileHandle): Promise<Progress> {
  let file: File;
  try {
    file = await handle.getFile();
  } catch (e) {
    const name = (e as DOMException).name;
    if (name === "NotFoundError") throw new ProgressFileError("missing", "File not found");
    if (name === "NotAllowedError" || name === "SecurityError") throw new ProgressFileError("permission", "Permission needed");
    throw e;
  }
  return parseProgressText(await file.text());
}

export async function writeFile(handle: FSFileHandle, p: Progress): Promise<void> {
  const w = await handle.createWritable();
  try {
    await w.write(serialize(p));
    await w.close(); // swaps the file contents in one step
  } catch (e) {
    await w.abort?.().catch(() => {});
    throw e;
  }
}

export const isAbort = (e: unknown) => (e as DOMException)?.name === "AbortError";

export async function pickSaveFile(): Promise<FSFileHandle> {
  return (window as unknown as PickerWindow).showSaveFilePicker({ suggestedName: DEFAULT_FILE_NAME, types: PICKER_TYPES });
}

export async function pickOpenFile(): Promise<FSFileHandle> {
  const [h] = await (window as unknown as PickerWindow).showOpenFilePicker({ types: PICKER_TYPES, multiple: false });
  return h;
}

export async function permissionState(h: FSFileHandle, request: boolean): Promise<PermissionState> {
  const opts = { mode: "readwrite" as const };
  const cur = await h.queryPermission(opts);
  if (cur === "granted" || !request) return cur;
  return h.requestPermission(opts);
}

export function downloadBackup(p: Progress) {
  const blob = new Blob([serialize(p)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `pypath-progress-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
