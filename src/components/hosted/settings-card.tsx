"use client";

import { Download, FilePlus2, FolderOpen, History, Plug, Trash2, Upload } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { hasFilePicker, isAbort, parseProgressText, permissionState, pickOpenFile, readFile, downloadBackup } from "@/lib/progress-backend/file-io";
import { hostedStore } from "@/lib/progress-backend/hosted-store";
import { listSnapshots, putSetting, type Snapshot } from "@/lib/progress-backend/idb";
import { relTime, summarize } from "@/lib/rel-time";
import { useApp } from "../providers";
import { Button, Card } from "../ui";

const row = "flex flex-col gap-3 border-t border-zinc-200 py-5 first:border-t-0 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800";
const title = "text-sm font-medium text-zinc-900 dark:text-white";
const sub = "text-[13px] text-zinc-500";

export function HostedProgressCard() {
  const { progress, dispatch } = useApp();
  useSyncExternalStore(hostedStore.subscribe, hostedStore.getVersion, hostedStore.getVersion);
  const fileName = hostedStore.fileName();
  const lastWrite = hostedStore.lastWriteAt();
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [snaps, setSnaps] = useState<Snapshot[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const refreshSnaps = async () => setSnaps(await listSnapshots());
  useEffect(() => {
    refreshSnaps();
  }, []);

  const act = (fn: () => Promise<string | void>) => async () => {
    setBusy(true);
    setMsg(null);
    try {
      const m = await fn();
      if (m) setMsg(m);
    } catch (e) {
      if (!isAbort(e)) setMsg((e as Error).message || "Something went wrong");
    } finally {
      setBusy(false);
      refreshSnaps();
    }
  };

  const canFile = hasFilePicker();

  return (
    <Card className="px-6">
      <div className={row}>
        <div>
          <div className={title}>Progress file</div>
          {fileName ? (
            <div className={sub}>
              <span className="font-mono text-[12px] text-zinc-700 dark:text-zinc-300">{fileName}</span> · last saved {relTime(lastWrite)}
            </div>
          ) : (
            <div className={sub}>
              {canFile ? "No file connected. Progress is kept in this browser only." : "Your browser can't save to a file automatically (use Chrome or Edge). Progress is kept in this browser; download backups regularly."}
            </div>
          )}
        </div>
        {canFile && (
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" disabled={busy} onClick={act(async () => ((await hostedStore.saveToNewFile()) ? "Now saving to the new file." : undefined))}>
              <FilePlus2 className="size-4" /> {fileName ? "Change file" : "Connect a file"}
            </Button>
            <Button
              variant="secondary"
              disabled={busy}
              onClick={act(async () => {
                const h = await pickOpenFile();
                if ((await permissionState(h, true)) !== "granted") return "Permission to use that file was not granted.";
                const data = await readFile(h);
                await hostedStore.attachExisting(h);
                await dispatch({ type: "import", data });
                return `Now using ${h.name}.`;
              })}
            >
              <FolderOpen className="size-4" /> Use an existing file
            </Button>
            {fileName && (
              <Button
                variant="ghost"
                disabled={busy}
                onClick={act(async () => {
                  if (!confirm("Disconnect the file? PyPath will keep your progress in this browser only until you connect a file again.")) return;
                  await hostedStore.disconnect();
                  return "Disconnected. Progress is now kept in this browser only.";
                })}
              >
                <Plug className="size-4" /> Disconnect file
              </Button>
            )}
          </div>
        )}
      </div>

      <div className={row}>
        <div>
          <div className={title}>Download backup</div>
          <div className={sub}>A copy of everything: progress, notes, code. Same format as local PyPath&apos;s data/progress.json.</div>
        </div>
        <Button
          variant="secondary"
          onClick={async () => {
            downloadBackup(progress);
            await putSetting("lastBackupAt", Date.now());
          }}
        >
          <Download className="size-4" /> Download backup
        </Button>
      </div>

      <div className={row}>
        <div>
          <div className={title}>Import</div>
          <div className={sub}>Replace your progress with an exported file. The current progress is saved as a browser snapshot first.</div>
        </div>
        <>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (!f) return;
              try {
                await dispatch({ type: "import", data: parseProgressText(await f.text()) });
                setMsg("Imported.");
                refreshSnaps();
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
          <div className={`${title} text-rose-600 dark:text-rose-400`}>Reset progress</div>
          <div className={sub}>Start over. A snapshot of the current progress is kept in this browser.</div>
        </div>
        <Button
          variant="secondary"
          className="border-rose-500/40 text-rose-600 hover:bg-rose-500/10 dark:text-rose-400"
          onClick={act(async () => {
            if (!confirm("Reset all progress? A snapshot is kept in this browser.")) return;
            await dispatch({ type: "reset" });
            location.href = "/";
          })}
        >
          <Trash2 className="size-4" /> Reset
        </Button>
      </div>

      <div className="border-t border-zinc-200 py-5 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <History className="size-4 text-zinc-500" />
          <div className={title}>Browser snapshots</div>
        </div>
        <p className={`${sub} mt-1`}>The last 5 copies taken before resets, imports and file changes, and at most once an hour.</p>
        {snaps.length === 0 ? (
          <p className="mt-3 text-[13px] text-zinc-400">No snapshots yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-zinc-100 rounded-xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
            {snaps.map((s) => (
              <li key={s.at} className="flex items-center justify-between gap-3 px-3 py-2 text-[13px]">
                <span className="min-w-0 text-zinc-700 dark:text-zinc-300">
                  {relTime(s.at)} <span className="text-zinc-400">· {s.reason} · {summarize(s.data)}</span>
                </span>
                <Button
                  variant="ghost"
                  className="h-8 px-2.5 text-[12px]"
                  disabled={busy}
                  onClick={act(async () => {
                    if (!confirm("Restore this snapshot? Your current progress is saved as a snapshot first.")) return;
                    await dispatch({ type: "import", data: s.data });
                    return "Snapshot restored.";
                  })}
                >
                  Restore
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {msg && <p className="pb-4 text-[13px] text-zinc-600 dark:text-zinc-400">{msg}</p>}
    </Card>
  );
}
