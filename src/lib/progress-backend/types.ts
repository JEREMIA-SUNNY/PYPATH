import type { Progress, ProgressEvent } from "../types";

export type SaveStatus =
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "saved-server" }
  | { kind: "saved-file"; fileName: string; at: number }
  | { kind: "browser-only"; at: number | null }
  | { kind: "file-missing" }
  | { kind: "permission" }
  | { kind: "error"; message: string };

export interface ProgressBackend {
  /** Initial progress. In hosted mode the ProgressGate has already connected a file or chosen browser-only. */
  load(): Promise<Progress>;
  /** Persist the result of `event`. May return a newer authoritative copy (server mode). */
  save(next: Progress, event: ProgressEvent): Promise<Progress | void>;
  status(): SaveStatus;
  subscribe(fn: () => void): () => void;
}
