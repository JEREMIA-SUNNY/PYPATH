"use client";

import { FileJson, TriangleAlert } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { HOSTED } from "@/lib/mode";
import { emptyRoot } from "@/lib/profiles";
import type { FSFileHandle } from "@/lib/progress-backend/fs-types";
import {
  DEFAULT_FILE_NAME, hasFilePicker, isAbort, permissionState, pickOpenFile, pickSaveFile, ProgressFileError, readFile, writeFile,
} from "@/lib/progress-backend/file-io";
import { addSnapshot, clearHandle, getHandle, getMirror, getSetting } from "@/lib/progress-backend/idb";
import { hostedStore } from "@/lib/progress-backend/hosted-store";
import { relTime, summarize } from "@/lib/rel-time";
import type { ProgressRoot } from "@/lib/types";
import { Button, Card } from "../ui";

type Step =
  | { id: "checking" }
  | { id: "ready" }
  | { id: "setup" }
  | { id: "welcome"; handle: FSFileHandle; denied: boolean }
  | { id: "missing"; reason: "missing" | "corrupt" | "error"; message: string };

export function ProgressGate({ children }: { children: React.ReactNode }) {
  // Local mode: the Node server owns progress, nothing to gate.
  if (!HOSTED) return <>{children}</>;
  return <HostedGate>{children}</HostedGate>;
}

function HostedGate({ children }: { children: React.ReactNode }) {
  const [step, setStep] = useState<Step>({ id: "checking" });
  const [mirror, setMirror] = useState<ProgressRoot | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const booted = useRef(false);

  const refreshMirror = useCallback(async () => setMirror((await getMirror()) ?? null), []);

  const toBrowserOnly = useCallback(async () => {
    const p = (await getMirror()) ?? emptyRoot();
    await hostedStore.connect(p, null);
    setStep({ id: "ready" });
  }, []);

  /** Reads `handle` and connects it. `preferFile`: the user picked this file on purpose, so it wins over the browser copy. */
  const loadFromHandle = useCallback(
    async (handle: FSFileHandle, preferFile: boolean) => {
      let fileProgress: ProgressRoot;
      try {
        fileProgress = await readFile(handle);
      } catch (e) {
        await refreshMirror();
        if (e instanceof ProgressFileError) {
          if (e.code === "permission") return setStep({ id: "welcome", handle, denied: true });
          return setStep({ id: "missing", reason: e.code === "missing" ? "missing" : "corrupt", message: e.message });
        }
        return setStep({ id: "missing", reason: "error", message: (e as Error).message || "Could not read the file" });
      }
      const m = await getMirror();
      let use = fileProgress;
      if (m && !preferFile && Date.parse(m.updatedAt) > Date.parse(fileProgress.updatedAt)) {
        // The last file write didn't land: the browser copy is newer. Keep the old file content as a snapshot.
        await addSnapshot(fileProgress, "reconcile");
        use = m;
      } else if (m && preferFile && m.updatedAt !== fileProgress.updatedAt) {
        await addSnapshot(m, "file-switch");
      }
      await hostedStore.connect(use, handle);
      if (use !== fileProgress) await hostedStore.flush();
      setToast(`Progress restored from ${handle.name} · last saved ${relTime(use.updatedAt)}`);
      setStep({ id: "ready" });
    },
    [refreshMirror],
  );

  useEffect(() => {
    if (booted.current) return;
    booted.current = true;
    (async () => {
      await refreshMirror();
      if (!hasFilePicker()) return toBrowserOnly();
      const choice = await getSetting<string>("storageChoice");
      if (choice === "browser") return toBrowserOnly();
      const handle = await getHandle();
      if (!handle) return setStep({ id: "setup" });
      let perm: PermissionState = "prompt";
      try {
        perm = await permissionState(handle, false);
      } catch {
        // fall through to the welcome screen
      }
      if (perm === "granted") return loadFromHandle(handle, false);
      setStep({ id: "welcome", handle, denied: perm === "denied" });
    })();
  }, [loadFromHandle, refreshMirror, toBrowserOnly]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 6000);
    return () => clearTimeout(t);
  }, [toast]);

  /** Wraps a click handler: busy state, and picker cancellation (AbortError) is not an error. */
  const act = (fn: () => Promise<void>) => async () => {
    setBusy(true);
    try {
      await fn();
    } catch (e) {
      if (!isAbort(e)) setStep({ id: "missing", reason: "error", message: (e as Error).message || "Something went wrong" });
    } finally {
      setBusy(false);
    }
  };

  const chooseExisting = act(async () => {
    const h = await pickOpenFile();
    if ((await permissionState(h, true)) !== "granted") throw new Error("Permission to use that file was not granted.");
    await loadFromHandle(h, true);
  });

  const createFile = act(async () => {
    const h = await pickSaveFile();
    const data = mirror ?? emptyRoot();
    await writeFile(h, data);
    await hostedStore.connect(data, h);
    setStep({ id: "ready" });
  });

  if (step.id === "ready")
    return (
      <>
        {children}
        {toast && (
          <div role="status" className="fixed bottom-4 left-1/2 z-[120] -translate-x-1/2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-[13px] text-zinc-700 shadow-lg dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
            {toast}
          </div>
        )}
      </>
    );

  if (step.id === "checking") return <div className="min-h-screen" aria-busy />;

  return (
    <Shell>
      {step.id === "setup" && <Setup mirror={mirror} busy={busy} onCreate={createFile} onExisting={chooseExisting} onSkip={act(toBrowserOnly)} />}
      {step.id === "welcome" && (
        <Welcome
          name={step.handle.name}
          denied={step.denied}
          busy={busy}
          hasMirror={!!mirror}
          onContinue={act(async () => {
            const perm = await permissionState(step.handle, true);
            if (perm === "granted") await loadFromHandle(step.handle, false);
            else setStep({ id: "welcome", handle: step.handle, denied: true });
          })}
          onDifferent={chooseExisting}
          onBackup={act(async () => {
            await clearHandle();
            await toBrowserOnly();
          })}
        />
      )}
      {step.id === "missing" && (
        <Missing
          reason={step.reason}
          message={step.message}
          mirror={mirror}
          busy={busy}
          onFind={chooseExisting}
          onRestore={act(async () => {
            if (!mirror) return;
            const h = await pickSaveFile();
            await writeFile(h, mirror);
            await hostedStore.connect(mirror, h);
            setStep({ id: "ready" });
          })}
          onFresh={act(async () => {
            if (!confirm("This starts with empty progress. Your browser backup is kept.")) return;
            if (mirror) await addSnapshot(mirror, "start-fresh");
            const h = await pickSaveFile();
            const fresh = emptyRoot();
            await writeFile(h, fresh);
            await hostedStore.connect(fresh, h);
            setStep({ id: "ready" });
          })}
        />
      )}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute -top-40 left-1/2 size-[520px] -translate-x-1/2 rounded-full bg-gradient-to-br from-py-blue/25 to-py-yellow/20 blur-3xl" />
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} className="relative w-full max-w-lg">
        <Card className="p-7 shadow-xl shadow-zinc-900/5 sm:p-8">{children}</Card>
      </motion.div>
    </main>
  );
}

const linkBtn = "text-[13px] text-zinc-500 underline-offset-2 hover:text-zinc-900 hover:underline disabled:opacity-50 dark:hover:text-white";

function Setup({ mirror, busy, onCreate, onExisting, onSkip }: { mirror: ProgressRoot | null; busy: boolean; onCreate: () => void; onExisting: () => void; onSkip: () => void }) {
  const [ok, setOk] = useState(false);
  return (
    <>
      <FileJson className="size-7 text-zinc-700 dark:text-zinc-300" />
      <h1 className="mt-4 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">Save your progress on your computer</h1>
      <p className="mt-3 text-[14px] leading-relaxed text-zinc-600 dark:text-zinc-400">
        PyPath has no accounts and no server. Your progress is saved in one file on your computer:{" "}
        <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[12px] dark:bg-zinc-800">{DEFAULT_FILE_NAME}</code>.
      </p>
      <div className="mt-4 flex gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-[13px] leading-relaxed text-amber-900 dark:text-amber-200">
        <TriangleAlert className="mt-0.5 size-4 shrink-0" />
        <p>
          <strong>If this file is deleted, renamed or moved, PyPath can&apos;t find it and your progress is lost.</strong> Keep it somewhere safe, like Documents, or a OneDrive or Google Drive folder so it&apos;s backed up
          automatically.
        </p>
      </div>
      <label className="mt-5 flex cursor-pointer items-start gap-2.5 text-[14px] text-zinc-800 dark:text-zinc-200">
        <input type="checkbox" checked={ok} onChange={(e) => setOk(e.target.checked)} className="mt-1 size-4 accent-indigo-600" />I understand that this file is my progress.
      </label>
      {mirror && <p className="mt-3 text-[12.5px] text-zinc-500">Your existing progress in this browser ({summarize(mirror)}) will be written into the new file.</p>}
      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <Button onClick={onCreate} disabled={!ok || busy}>
          Create progress file
        </Button>
        <Button variant="secondary" onClick={onExisting} disabled={!ok || busy}>
          I already have a progress file
        </Button>
      </div>
      <button onClick={onSkip} disabled={busy} className={`${linkBtn} mt-5`}>
        Skip, and keep progress in this browser only (not recommended)
      </button>
    </>
  );
}

function Welcome({
  name, denied, busy, hasMirror, onContinue, onDifferent, onBackup,
}: { name: string; denied: boolean; busy: boolean; hasMirror: boolean; onContinue: () => void; onDifferent: () => void; onBackup: () => void }) {
  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">Welcome back!</h1>
      {denied && <p className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-[13px] text-amber-900 dark:text-amber-200">Access to your progress file was blocked. Allow it again below, or choose the file again.</p>}
      <Button className="mt-5 w-full" onClick={onContinue} disabled={busy}>
        Continue with {name}
      </Button>
      <p className="mt-3 text-[12.5px] text-zinc-500">Tip: when Chrome asks, choose <strong>&quot;Allow on every visit&quot;</strong> so you won&apos;t need this click next time.</p>
      <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1">
        <button onClick={onDifferent} disabled={busy} className={linkBtn}>
          {denied ? "Choose the file again" : "Use a different file"}
        </button>
        {hasMirror && (
          <>
            <span className="text-zinc-300 dark:text-zinc-700">·</span>
            <button onClick={onBackup} disabled={busy} className={linkBtn}>
              Use the browser backup instead
            </button>
          </>
        )}
      </div>
    </>
  );
}

function Missing({
  reason, message, mirror, busy, onFind, onRestore, onFresh,
}: { reason: "missing" | "corrupt" | "error"; message: string; mirror: ProgressRoot | null; busy: boolean; onFind: () => void; onRestore: () => void; onFresh: () => void }) {
  const corrupt = reason === "corrupt";
  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">{corrupt ? "Your progress file is damaged" : reason === "error" ? "Something went wrong" : "We can’t find your progress file"}</h1>
      <p className="mt-3 text-[14px] text-zinc-600 dark:text-zinc-400">
        {corrupt ? "PyPath didn’t touch it, so you can still open it in a text editor. " : reason === "error" ? `${message}. ` : "It may have been moved, renamed or deleted. "}
        {corrupt && message !== "Your progress file is damaged" ? message + "." : ""}
      </p>
      <div className="mt-5 space-y-2.5">
        <Button className="w-full" onClick={onFind} disabled={busy}>
          {corrupt ? "Choose another file" : "Find my file"}
        </Button>
        {mirror && (
          <Button variant="secondary" className="h-auto w-full flex-col gap-0.5 py-2" onClick={onRestore} disabled={busy}>
            <span>Restore from browser backup</span>
            <span className="text-[12px] font-normal text-zinc-500">
              saved {relTime(mirror.updatedAt)} · {summarize(mirror)}
            </span>
          </Button>
        )}
        <Button variant="ghost" className="w-full" onClick={onFresh} disabled={busy}>
          Start fresh
        </Button>
      </div>
      {mirror && corrupt && <p className="mt-3 text-[12px] text-zinc-500">Restoring writes your browser backup to a new file you pick. The damaged file is never overwritten.</p>}
    </>
  );
}
