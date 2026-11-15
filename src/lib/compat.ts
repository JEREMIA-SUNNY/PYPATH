import compat from "../../content/browser-compat.json";
import { hashCode } from "./hash";

export type CompatReason = "network" | "server" | "threads" | "package" | "other";
export interface Incompat {
  reason: CompatReason;
  detail?: string;
}

const data = compat as { exercises: Record<string, Incompat>; blocks: Record<string, Incompat> };

/** Exercises that can't run in Pyodide, from `npm run check:content:browser`. Keyed "module/exercise". */
export const exerciseIncompat = (ref: string): Incompat | null => data.exercises[ref] ?? null;
/** Lesson code blocks that can't run in Pyodide, keyed by a hash of the code. */
export const blockIncompat = (code: string): Incompat | null => data.blocks[hashCode(code)] ?? null;

const WHY: Record<CompatReason, string> = {
  network: "it uses the network",
  server: "it runs a server",
  threads: "it uses threads",
  package: "it needs a package that isn't available in the browser",
  other: "it uses something the browser can't do",
};
export const incompatWhy = (i: Incompat) => WHY[i.reason];
