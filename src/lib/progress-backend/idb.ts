import type { Progress } from "../types";
import type { FSFileHandle } from "./fs-types";

// IndexedDB layout (database "pypath"):
//   handles    progressFile -> FileSystemFileHandle
//   progress   current      -> Progress (mirror of the file)
//   snapshots  <timestamp>  -> { at, reason, data }   (newest 5 kept)
//   settings   key -> value (mode choice, lastBackupAt, banner dismissals)
const DB = "pypath";
const STORES = ["handles", "progress", "snapshots", "settings"] as const;
type Store = (typeof STORES)[number];
const MAX_SNAPSHOTS = 5;

let dbPromise: Promise<IDBDatabase> | null = null;
function open(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB, 1);
      req.onupgradeneeded = () => {
        for (const s of STORES) if (!req.result.objectStoreNames.contains(s)) req.result.createObjectStore(s);
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    dbPromise.catch(() => (dbPromise = null));
  }
  return dbPromise;
}

async function tx<T>(store: Store, mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await open();
  return new Promise<T>((resolve, reject) => {
    const t = db.transaction(store, mode);
    const req = fn(t.objectStore(store));
    t.oncomplete = () => resolve(req.result);
    t.onerror = () => reject(t.error);
    t.onabort = () => reject(t.error);
  });
}

const get = <T>(store: Store, key: string) => tx<T | undefined>(store, "readonly", (s) => s.get(key));
const put = (store: Store, key: string, value: unknown) => tx(store, "readwrite", (s) => s.put(value, key));
const del = (store: Store, key: string) => tx(store, "readwrite", (s) => s.delete(key));

export const getHandle = () => get<FSFileHandle>("handles", "progressFile").catch(() => undefined);
export const putHandle = (h: FSFileHandle) => put("handles", "progressFile", h);
export const clearHandle = () => del("handles", "progressFile").catch(() => undefined);

export const getMirror = () => get<Progress>("progress", "current").catch(() => undefined);
export const putMirror = (p: Progress) => put("progress", "current", p);

export interface Snapshot {
  at: number;
  reason: string;
  data: Progress;
}

export async function listSnapshots(): Promise<Snapshot[]> {
  try {
    const db = await open();
    return await new Promise((resolve, reject) => {
      const req = db.transaction("snapshots", "readonly").objectStore("snapshots").getAll();
      req.onsuccess = () => resolve((req.result as Snapshot[]).sort((a, b) => b.at - a.at));
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
}

export async function addSnapshot(data: Progress, reason: string): Promise<void> {
  try {
    const at = Date.now();
    await put("snapshots", String(at).padStart(16, "0"), { at, reason, data } satisfies Snapshot);
    const db = await open();
    const keys: IDBValidKey[] = await new Promise((resolve, reject) => {
      const req = db.transaction("snapshots", "readonly").objectStore("snapshots").getAllKeys();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    const old = keys.sort().slice(0, Math.max(0, keys.length - MAX_SNAPSHOTS));
    for (const k of old) await del("snapshots", String(k));
  } catch {
    // A failed snapshot must never block saving progress.
  }
}

export const getSetting = <T>(key: string) => get<T>("settings", key).catch(() => undefined);
export const putSetting = (key: string, value: unknown) => put("settings", key, value).catch(() => undefined);
