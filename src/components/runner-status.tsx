"use client";

import { LoaderCircle, MonitorSmartphone } from "lucide-react";
import { useSyncExternalStore } from "react";
import { type Incompat, incompatWhy } from "@/lib/compat";
import { HOSTED, REPO_URL } from "@/lib/mode";
import { getRunnerStatus, getServerRunnerStatus, subscribeRunnerStatus } from "@/lib/runner/browser";

/** "Loading Python (first time only, about 10 MB)…" while the in-browser runner starts. Hosted mode only. */
export function RunnerStatus({ busy }: { busy: boolean }) {
  const status = useSyncExternalStore(subscribeRunnerStatus, getRunnerStatus, getServerRunnerStatus);
  if (!HOSTED || !busy || !status) return null;
  return (
    <p className="flex items-center gap-2 px-4 py-3 text-[13px] text-zinc-500">
      <LoaderCircle className="size-4 animate-spin" /> {status}
    </p>
  );
}

/** Replaces a Run button for things that need real Python on the user's computer. */
export function BrowserIncompatNotice({ incompat, compact = false }: { incompat: Incompat; compact?: boolean }) {
  return (
    <div className={`flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200 ${compact ? "px-2.5 py-1.5 text-[11.5px]" : "p-3 text-[13px]"}`}>
      <MonitorSmartphone className="mt-0.5 size-4 shrink-0" />
      <p>
        This one needs Python on your computer ({incompatWhy(incompat)}).{" "}
        {REPO_URL ? (
          <>
            Get PyPath from{" "}
            <a href={REPO_URL} target="_blank" rel="noreferrer" className="underline underline-offset-2">
              GitHub
            </a>{" "}
            to run it locally.
          </>
        ) : (
          "Get PyPath from GitHub to run it locally."
        )}
      </p>
    </div>
  );
}
