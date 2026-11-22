"use client";

import { Download, LoaderCircle, RefreshCw, Trash2, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { postEvent } from "@/lib/client-api";
import { HOSTED, PYODIDE_VERSION } from "@/lib/mode";
import type { ProgressRoot } from "@/lib/types";
import { useApp } from "./providers";
import { HostedProgressCard } from "./hosted/settings-card";
import { Button, Card } from "./ui";

type PyInfo = { found: boolean; command?: string; args?: string[]; version?: string; tried: string[] };

export function SettingsClient({ dataFile }: { dataFile: string }) {
  const { catalog, progress, dispatch } = useApp();
  const [name, setName] = useState(progress.settings.name ?? "");
  const [py, setPy] = useState<PyInfo | null>(null);
  const [checking, setChecking] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const check = async (recheck = false) => {
    if (HOSTED) return;
    setChecking(true);
    try {
      const r = await fetch(`/api/python${recheck ? "?recheck=1" : ""}`);
      setPy(await r.json());
    } catch {
      setPy({ found: false, tried: ["(could not reach the PyPath server, try restarting npm run dev)"] });
    } finally {
      setChecking(false);
    }
  };
  useEffect(() => {
    check();
  }, []);

  const row = "flex flex-col gap-3 border-t border-zinc-200 py-5 first:border-t-0 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800";

  return (
    <div className="mt-10 max-w-3xl space-y-6">
      <Card className="px-6">
        <div className={row}>
          <div>
            <div className="text-sm font-medium text-zinc-900 dark:text-white">Profile</div>
            <div className="text-[13px] text-zinc-500">
              {catalog.profiles.find((p) => p.id === progress.settings.profileId)?.title ?? "None chosen"}. Each profile has its own syllabus and its own progress.
            </div>
          </div>
          <Button variant="secondary" onClick={() => window.dispatchEvent(new Event("pypath:profiles"))}>
            Switch profile
          </Button>
        </div>
        <div className={row}>
          <div>
            <div className="text-sm font-medium text-zinc-900 dark:text-white">Your name</div>
            <div className="text-[13px] text-zinc-500">Used for the dashboard greeting.</div>
          </div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => dispatch({ type: "settings", name })}
            placeholder="Your name"
            className="h-10 w-full rounded-xl border border-zinc-200 bg-transparent px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500/30 sm:w-64 dark:border-zinc-800"
          />
        </div>
        {HOSTED ? (
          <div className={row}>
            <div>
              <div className="text-sm font-medium text-zinc-900 dark:text-white">Python</div>
              <div className="text-[13px] text-zinc-500">Python runs in your browser (Pyodide {PYODIDE_VERSION}).</div>
            </div>
          </div>
        ) : (
          <>
          <div className={row}>
            <div>
              <div className="text-sm font-medium text-zinc-900 dark:text-white">Python interpreter</div>
              <div className="text-[13px] text-zinc-500">
                {py === null
                  ? "Checking…"
                  : py.found
                    ? `Python ${py.version} via "${[py.command, ...(py.args ?? [])].join(" ")}"`
                    : `Not found. Tried: ${py.tried.join(", ")}. Install Python 3.10+ or set PYPATH_PYTHON.`}
              </div>
            </div>
            <Button variant="secondary" onClick={() => check(true)} disabled={checking}>
              {checking ? <LoaderCircle className="size-4 animate-spin" /> : <RefreshCw className="size-4" />} Re-check
            </Button>
          </div>
          </>
        )}
      </Card>

      {HOSTED ? <HostedProgressCard /> : (
      <Card className="px-6">
        <div className={row}>
          <div>
            <div className="text-sm font-medium text-zinc-900 dark:text-white">Progress file</div>
            <div className="break-all font-mono text-[12px] text-zinc-500">{dataFile}</div>
          </div>
        </div>
        <div className={row}>
          <div>
            <div className="text-sm font-medium text-zinc-900 dark:text-white">Export</div>
            <div className="text-[13px] text-zinc-500">Download a backup of everything: progress, notes, code.</div>
          </div>
          <a
            href="/api/progress?download=1"
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-zinc-200 px-4 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-800/70"
          >
            <Download className="size-4" /> Export JSON
          </a>
        </div>
        <div className={row}>
          <div>
            <div className="text-sm font-medium text-zinc-900 dark:text-white">Import</div>
            <div className="text-[13px] text-zinc-500">Replace your progress with an exported file. The current file is backed up first.</div>
          </div>
          <>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                try {
                  const data = JSON.parse(await f.text()) as ProgressRoot;
                  await postEvent({ type: "import", data });
                  setMsg("Imported. Reloading…");
                  setTimeout(() => location.reload(), 600);
                } catch (err) {
                  setMsg(`Import failed: ${(err as Error).message}`);
                }
              }}
            />
            <Button variant="secondary" onClick={() => fileRef.current?.click()}>
              <Upload className="size-4" /> Import JSON
            </Button>
          </>
        </div>
        <div className={row}>
          <div>
            <div className="text-sm font-medium text-rose-600 dark:text-rose-400">Reset progress</div>
            <div className="text-[13px] text-zinc-500">Start over with the CURRENT profile only; other profiles keep their progress. A backup of the file is kept in the data folder.</div>
          </div>
          <Button
            variant="secondary"
            className="border-rose-500/40 text-rose-600 hover:bg-rose-500/10 dark:text-rose-400"
            onClick={async () => {
              if (!confirm("Reset this profile's progress? Other profiles are not touched. A backup is saved in the data folder.")) return;
              await postEvent({ type: "reset" });
              location.href = "/";
            }}
          >
            <Trash2 className="size-4" /> Reset
          </Button>
        </div>
        {msg && <p className="pb-4 text-[13px] text-zinc-600 dark:text-zinc-400">{msg}</p>}
      </Card>
      )}
    </div>
  );
}
