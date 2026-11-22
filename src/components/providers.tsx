"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { applyRootEvent, scopeModules, viewOf } from "@/lib/profiles";
import { createFileBackend } from "@/lib/progress-backend/hosted-store";
import { createServerBackend } from "@/lib/progress-backend/server";
import type { ProgressBackend, SaveStatus } from "@/lib/progress-backend/types";
import { HOSTED } from "@/lib/mode";
import type { Catalog, CurriculumIndex, Profile, Progress, ProgressEvent, ProgressRoot } from "@/lib/types";

interface AppState {
  /** The catalog scoped to the active profile's syllabus (its modules only, in its order). */
  catalog: Catalog;
  /** The unscoped catalog (every module), for the profile picker. */
  fullCatalog: Catalog;
  /** The active profile's syllabus. */
  index: CurriculumIndex;
  profile: Profile | null;
  /** The whole progress file: every profile's own record. */
  root: ProgressRoot;
  /** The ACTIVE profile's progress (with the shared name and profile id overlaid). */
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
  const backend = useMemo<ProgressBackend>(() => (HOSTED ? createFileBackend() : createServerBackend()), []);
  const [root, setRoot] = useState<ProgressRoot | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const latest = useRef<ProgressRoot | null>(null);
  const pending = useRef(0);
  const status = useSyncExternalStore(backend.subscribe, backend.status, backend.status);

  useEffect(() => {
    let live = true;
    backend
      .load()
      .then((p) => {
        if (!live) return;
        latest.current = p;
        setRoot(p);
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
      const next = applyRootEvent(latest.current, event);
      latest.current = next;
      setRoot(next);
      pending.current++;
      try {
        const saved = await backend.save(next, event);
        pending.current--;
        // Server mode: adopt the server's copy once every in-flight write has landed.
        if (saved && pending.current === 0) {
          latest.current = saved;
          setRoot(saved);
        }
      } catch {
        pending.current--; // the backend status already carries the error
      }
    },
    [backend],
  );

  const saveError = status.kind === "error" ? status.message : null;
  const value = useMemo<AppState | null>(() => {
    if (!root) return null;
    const profile = catalog.profiles.find((p) => p.id === root.settings.profileId) ?? null;
    const index = scopeModules(catalog.modules, profile);
    return {
      catalog: { ...catalog, modules: index },
      fullCatalog: catalog,
      index,
      profile,
      root,
      progress: viewOf(root),
      dispatch,
      saveError,
      saveStatus: status,
    };
  }, [catalog, root, dispatch, saveError, status]);
  if (!value) return <LoadingSkeleton error={loadError} />;
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
