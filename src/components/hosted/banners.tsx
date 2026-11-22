"use client";

import { TriangleAlert, X } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { HOSTED } from "@/lib/mode";
import { downloadBackup, parseProgressText } from "@/lib/progress-backend/file-io";
import { hostedStore } from "@/lib/progress-backend/hosted-store";
import { getSetting, putSetting } from "@/lib/progress-backend/idb";
import { useApp } from "../providers";

const THREE_DAYS = 3 * 24 * 60 * 60 * 1000;

const bannerBtn = "rounded-lg border border-current/30 px-2.5 py-1 text-[12px] font-medium hover:bg-black/5 dark:hover:bg-white/10";

export function HostedBanners() {
  if (!HOSTED) return null;
  return <HostedBannersInner />;
}

function HostedBannersInner() {
  useSyncExternalStore(hostedStore.subscribe, hostedStore.getVersion, hostedStore.getVersion);
  const status = hostedStore.getStatus();
  const [busy, setBusy] = useState(false);
  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    try {
      await fn();
    } finally {
      setBusy(false);
    }
  };

  let body: React.ReactNode = null;
  if (status.kind === "file-missing") {
    body = (
      <Bar tone="red" text="Progress file missing, your progress is still saved in this browser.">
        <button className={bannerBtn} disabled={busy} onClick={() => run(() => hostedStore.findMyFile())}>Find my file</button>
        <button className={bannerBtn} disabled={busy} onClick={() => run(() => hostedStore.saveToNewFile())}>Save to a new file</button>
      </Bar>
    );
  } else if (status.kind === "permission") {
    body = (
      <Bar tone="red" text="PyPath lost permission to write your progress file. Your progress is still saved in this browser.">
        <button className={bannerBtn} disabled={busy} onClick={() => run(() => hostedStore.allowAgain())}>Allow again</button>
      </Bar>
    );
  } else if (status.kind === "error") {
    body = (
      <Bar tone="red" text={`Could not write your progress file (${status.message}). Your progress is still saved in this browser.`}>
        <button className={bannerBtn} disabled={busy} onClick={() => run(() => hostedStore.flush())}>Try again</button>
      </Bar>
    );
  }
  return (
    <>
      {body}
      {hostedStore.getChoice() === "browser" && status.kind !== "idle" && <BrowserOnlyBanner />}
    </>
  );
}

function Bar({ tone, text, children }: { tone: "red" | "amber"; text: React.ReactNode; children?: React.ReactNode }) {
  const color =
    tone === "red"
      ? "border-rose-500/40 bg-rose-50 text-rose-800 dark:bg-rose-950/80 dark:text-rose-200"
      : "border-amber-500/40 bg-amber-50 text-amber-900 dark:bg-amber-950/80 dark:text-amber-200";
  return (
    <div role="alert" className={`fixed inset-x-3 top-[64px] z-40 mx-auto flex max-h-[45dvh] max-w-3xl flex-wrap items-center gap-x-3 gap-y-2 overflow-y-auto rounded-xl border px-3 py-2.5 text-[12.5px] sm:px-4 sm:text-[13px] shadow-lg backdrop-blur sm:top-[76px] ${color}`}>
      <TriangleAlert className="size-4 shrink-0" />
      <span className="min-w-[12rem] flex-[1_1_12rem] leading-snug">{text}</span>
      <span className="flex flex-wrap items-center gap-2">{children}</span>
    </div>
  );
}

function BrowserOnlyBanner() {
  const { root, dispatch } = useApp();
  const [visible, setVisible] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const updatedAt = Date.parse(root.updatedAt) || 0;

  useEffect(() => {
    (async () => {
      const dismissed = (await getSetting<number>("bannerDismissedAt")) ?? 0;
      const backedUp = (await getSetting<number>("lastBackupAt")) ?? 0;
      const ref = Math.max(dismissed, backedUp);
      // Show on first visit, then again every 3 days if there is progress that was never backed up.
      setVisible(ref === 0 || (Date.now() - ref > THREE_DAYS && updatedAt > backedUp));
    })();
    // Only re-evaluate on mount: dismissing/backup updates visibility directly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!visible) return null;
  const hide = async (key: "bannerDismissedAt" | "lastBackupAt") => {
    await putSetting(key, Date.now());
    setVisible(false);
  };

  return (
    <Bar tone="amber" text={<>Your browser can&apos;t save progress to a file automatically, so it&apos;s kept inside this browser. Clearing browsing data will erase it. <strong>Download a backup</strong> regularly, or use Chrome or Edge for automatic saving.{msg && <span className="ml-2 text-rose-600">{msg}</span>}</>}>
      <button className={bannerBtn} onClick={async () => { downloadBackup(root); await hide("lastBackupAt"); }}>Download backup</button>
      <input
        ref={fileRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (!f) return;
          try {
            const data = parseProgressText(await f.text());
            await dispatch({ type: "import", data });
            setMsg(null);
            setVisible(false);
          } catch (err) {
            setMsg(`Restore failed: ${(err as Error).message}`);
          }
        }}
      />
      <button className={bannerBtn} onClick={() => fileRef.current?.click()}>Restore from file</button>
      <button aria-label="Dismiss" className="rounded p-1 hover:bg-black/5 dark:hover:bg-white/10" onClick={() => hide("bannerDismissedAt")}>
        <X className="size-4" />
      </button>
    </Bar>
  );
}
