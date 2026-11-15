import { emptyProgress } from "../progress";
import type { Progress, ProgressEvent } from "../types";
import type { FSFileHandle } from "./fs-types";
import { isAbort, permissionState, pickOpenFile, pickSaveFile, readFile, writeFile } from "./file-io";
import { addSnapshot, clearHandle, getSetting, putHandle, putMirror, putSetting } from "./idb";
import type { ProgressBackend, SaveStatus } from "./types";

const WRITE_DEBOUNCE_MS = 400;
const SNAPSHOT_EVERY_MS = 60 * 60 * 1000;

export type StorageChoice = "file" | "browser";

/**
 * Hosted-mode persistence. Every change goes to the IndexedDB mirror immediately and to the user's
 * file (debounced, through one promise queue so writes never interleave).
 * One instance per page: the ProgressGate connects it, AppProvider saves through it, Settings manages it.
 */
class HostedStore {
  private handle: FSFileHandle | null = null;
  private choice: StorageChoice = "browser";
  private current: Progress = emptyProgress();
  private initial: Progress | null = null;
  private lastFileWriteAt: number | null = null;
  private status: SaveStatus = { kind: "idle" };
  private timer: ReturnType<typeof setTimeout> | null = null;
  private queue: Promise<unknown> = Promise.resolve();
  private subs = new Set<() => void>();
  private listening = false;
  private version = 0;

  // ---------- subscription (useSyncExternalStore) ----------
  subscribe = (fn: () => void) => {
    this.subs.add(fn);
    return () => this.subs.delete(fn);
  };
  getVersion = () => this.version;
  private emit() {
    this.version++;
    this.subs.forEach((f) => f());
  }
  private setStatus(s: SaveStatus) {
    this.status = s;
    this.emit();
  }

  getStatus = (): SaveStatus => this.status;
  fileName = () => (this.choice === "file" ? (this.handle?.name ?? null) : null);
  getChoice = () => this.choice;
  lastWriteAt = () => this.lastFileWriteAt;
  currentProgress = () => this.current;

  // ---------- connecting ----------
  /** Called by the gate once progress is decided. `handle` is null in browser-only mode. */
  async connect(progress: Progress, handle: FSFileHandle | null) {
    this.current = progress;
    this.initial = progress;
    this.handle = handle;
    this.choice = handle ? "file" : "browser";
    await putSetting("storageChoice", this.choice);
    if (handle) await putHandle(handle);
    await putMirror(progress).catch(() => {});
    this.lastFileWriteAt = handle ? Date.parse(progress.updatedAt) || Date.now() : null;
    this.setStatus(handle ? { kind: "saved-file", fileName: handle.name, at: this.lastFileWriteAt ?? Date.now() } : { kind: "browser-only", at: null });
    this.listen();
    // Ask the browser not to evict our IndexedDB copy.
    navigator.storage?.persist?.().catch(() => {});
  }

  takeInitial(): Progress {
    return this.initial ?? this.current;
  }

  private listen() {
    if (this.listening || typeof window === "undefined") return;
    this.listening = true;
    const flush = () => void this.flush();
    document.addEventListener("visibilitychange", () => document.visibilityState === "hidden" && flush());
    window.addEventListener("pagehide", flush);
  }

  // ---------- saving ----------
  async save(next: Progress, event: ProgressEvent): Promise<void> {
    const prev = this.current;
    this.current = next;
    const big = event.type === "reset" || event.type === "import";
    if (big) {
      await addSnapshot(prev, event.type);
    } else {
      const last = (await getSetting<number>("lastSnapshotAt")) ?? 0;
      if (Date.now() - last > SNAPSHOT_EVERY_MS) {
        await putSetting("lastSnapshotAt", Date.now());
        await addSnapshot(prev, "hourly");
      }
    }
    await putMirror(next).catch(() => {});
    if (this.choice === "file" && this.handle) {
      if (this.status.kind === "saved-file") this.setStatus({ kind: "saving" });
      if (big) await this.flush();
      else this.schedule();
    } else {
      this.setStatus({ kind: "browser-only", at: Date.now() });
    }
  }

  private schedule() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => void this.flush(), WRITE_DEBOUNCE_MS);
  }

  flush(): Promise<void> {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    const job = this.queue.then(() => this.writeNow());
    this.queue = job.catch(() => {});
    return job;
  }

  private async writeNow() {
    const handle = this.handle;
    if (this.choice !== "file" || !handle) return;
    const snapshot = this.current;
    try {
      await writeFile(handle, snapshot);
      this.lastFileWriteAt = Date.now();
      this.setStatus({ kind: "saved-file", fileName: handle.name, at: this.lastFileWriteAt });
    } catch (e) {
      const name = (e as DOMException)?.name;
      if (name === "NotFoundError") this.setStatus({ kind: "file-missing" });
      else if (name === "NotAllowedError" || name === "SecurityError") this.setStatus({ kind: "permission" });
      else this.setStatus({ kind: "error", message: (e as Error)?.message || "Could not write the progress file" });
    }
  }

  // ---------- recovery & settings actions ----------
  /** Re-ask for write permission (must be called from a click). */
  async allowAgain() {
    if (!this.handle) return;
    const p = await permissionState(this.handle, true);
    if (p === "granted") await this.flush();
  }

  /** Point at an existing file that holds the current progress (e.g. the moved original). Keeps in-session progress. */
  async findMyFile(): Promise<boolean> {
    try {
      const h = await pickOpenFile();
      if ((await permissionState(h, true)) !== "granted") return false;
      try {
        const onDisk = await readFile(h);
        await addSnapshot(onDisk, "found-file");
      } catch {
        // Unreadable file: we overwrite it with current progress below, the user chose it.
      }
      await this.useHandle(h);
      return true;
    } catch (e) {
      if (isAbort(e)) return false;
      throw e;
    }
  }

  /** Save current progress into a brand-new file the user picks. */
  async saveToNewFile(): Promise<boolean> {
    try {
      const h = await pickSaveFile();
      await addSnapshot(this.current, "file-switch");
      await this.useHandle(h);
      return true;
    } catch (e) {
      if (isAbort(e)) return false;
      throw e;
    }
  }

  private async useHandle(h: FSFileHandle) {
    this.handle = h;
    this.choice = "file";
    await putHandle(h);
    await putSetting("storageChoice", "file");
    await this.flush();
  }

  /** Attach an already-validated existing file (Settings → "Use an existing file"). The caller dispatches the import. */
  async attachExisting(h: FSFileHandle) {
    await addSnapshot(this.current, "file-switch");
    this.handle = h;
    this.choice = "file";
    await putHandle(h);
    await putSetting("storageChoice", "file");
    this.setStatus({ kind: "saved-file", fileName: h.name, at: Date.now() });
  }

  async disconnect() {
    await this.flush();
    await addSnapshot(this.current, "file-switch");
    this.handle = null;
    this.choice = "browser";
    await clearHandle();
    await putSetting("storageChoice", "browser");
    this.setStatus({ kind: "browser-only", at: null });
  }
}

export const hostedStore = new HostedStore();

export function createFileBackend(): ProgressBackend {
  return {
    async load() {
      return hostedStore.takeInitial();
    },
    async save(next, event) {
      await hostedStore.save(next, event);
    },
    status: hostedStore.getStatus,
    subscribe: hostedStore.subscribe,
  };
}
