import type { Progress, ProgressEvent } from "../types";
import type { ProgressBackend, SaveStatus } from "./types";

const headers = { "content-type": "application/json", "x-pypath": "1" };

/** Local mode: the Node server owns data/progress.json and applies each event itself. */
export function createServerBackend(): ProgressBackend {
  let status: SaveStatus = { kind: "saved-server" };
  const subs = new Set<() => void>();
  const set = (s: SaveStatus) => {
    status = s;
    subs.forEach((f) => f());
  };
  return {
    async load() {
      const res = await fetch("/api/progress", { cache: "no-store" });
      if (!res.ok) throw new Error("Could not load progress");
      return (await res.json()) as Progress;
    },
    async save(_next: Progress, event: ProgressEvent) {
      try {
        const res = await fetch("/api/progress", { method: "POST", headers, body: JSON.stringify(event) });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Could not save progress");
        set({ kind: "saved-server" });
        return data as Progress;
      } catch (e) {
        set({ kind: "error", message: (e as Error).message });
        throw e;
      }
    },
    status: () => status,
    subscribe(fn) {
      subs.add(fn);
      return () => subs.delete(fn);
    },
  };
}
