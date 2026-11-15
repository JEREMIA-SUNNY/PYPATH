"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { applyEvent } from "@/lib/progress";
import { createFileBackend } from "@/lib/progress-backend/hosted-store";
import { createServerBackend } from "@/lib/progress-backend/server";
import type { ProgressBackend, SaveStatus } from "@/lib/progress-backend/types";
import { HOSTED } from "@/lib/mode";
import type { Catalog, CurriculumIndex, Progress, ProgressEvent } from "@/lib/types";

interface AppState {
  catalog: Catalog;
  index: CurriculumIndex;
  progress: Progress;
  dispatch: (event: ProgressEvent) => Promise<void>;
  saveError: string | null;
  saveStatus: SaveStatus;
}

const AppContext = createContext<AppState | null>(null);

function LoadingSkeleton({ error }: { error: string | null }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col gap-4 px-6 pt-32" aria-busy={!error}>
      {error ? (
        <p className="text-sm text-rose-600 dark:text-rose-400">Could not load your progress: {error}</p>
      ) : (
        <>
          <div className="h-8 w-48 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-4 w-80 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="mt-6 h-40 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-900" />
          <div className="h-40 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-900" />
        </>
      )}
    </div>
  );
}

export function AppProvider({ catalog, children }: { catalog: Catalog; children: React.ReactNode }) {
  const index = catalog.modules;
  const backend = useMemo<ProgressBackend>(() => (HOSTED ? createFileBackend() : createServerBackend()), []);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const latest = useRef<Progress | null>(null);
  const pending = useRef(0);
  const status = useSyncExternalStore(backend.subscribe, backend.status, backend.status);

  useEffect(() => {
    let live = true;
    backend
      .load()
      .then((p) => {
        if (!live) return;
        latest.current = p;
        setProgress(p);
      })
      .catch((e) => live && setLoadError((e as Error).message));
    return () => {
      live = false;
    };
  }, [backend]);

  const dispatch = useCallback(
    async (event: ProgressEvent) => {
      if (!latest.current) return;
      // Optimistic: update the screen now, then persist.
      const next = applyEvent(latest.current, event);
      latest.current = next;
      setProgress(next);
      pending.current++;
      try {
        const saved = await backend.save(next, event);
        pending.current--;
        // Server mode: adopt the server's copy once every in-flight write has landed.
        if (saved && pending.current === 0) {
          latest.current = saved;
          setProgress(saved);
        }
      } catch {
        pending.current--; // the backend status already carries the error
      }
    },
    [backend],
  );

  const saveError = status.kind === "error" ? status.message : null;
  const value = useMemo(
    () => (progress ? { catalog, index, progress, dispatch, saveError, saveStatus: status } : null),
    [catalog, index, progress, dispatch, saveError, status],
  );
  if (!value) return <LoadingSkeleton error={loadError} />;
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
