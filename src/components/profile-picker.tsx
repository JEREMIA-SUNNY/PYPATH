"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { emptyProgress, moduleStats } from "@/lib/progress";
import { scopeModules } from "@/lib/profiles";
import type { Profile, ProgressRoot } from "@/lib/types";
import { Logo } from "./navbar";
import { useApp } from "./providers";

const SESSION_KEY = "pypath:profile-picked";

function pickedThisSession() {
  try {
    return sessionStorage.getItem(SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

/** Shows "Who's learning?" once per browser session, and again whenever the navbar avatar is pressed. */
export function ProfileGate({ children }: { children: React.ReactNode }) {
  const { fullCatalog, root, dispatch } = useApp();
  const profiles = fullCatalog.profiles;
  // Gate mounts only after progress has loaded in the browser, so reading sessionStorage here is safe.
  const [open, setOpen] = useState(() => profiles.length > 0 && !pickedThisSession());

  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener("pypath:profiles", show);
    return () => window.removeEventListener("pypath:profiles", show);
  }, []);

  const choose = useCallback(
    (p: Profile) => {
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        // private mode: the picker will simply show again next load
      }
      if (root.settings.profileId !== p.id) dispatch({ type: "settings", profileId: p.id, trackId: p.trackId });
      setOpen(false);
    },
    [dispatch, root.settings.profileId],
  );

  return (
    <>
      {children}
      <AnimatePresence>
        {open && profiles.length > 0 && <Picker key="picker" onChoose={choose} onClose={root.settings.profileId ? () => setOpen(false) : undefined} />}
      </AnimatePresence>
    </>
  );
}

/** How far through ITS OWN syllabus this profile is, using ITS OWN progress record. */
function pathPercent(profile: Profile, root: ProgressRoot, catalog: ReturnType<typeof useApp>["fullCatalog"]) {
  const path = scopeModules(catalog.modules, profile);
  if (path.length === 0) return 0;
  const mine = root.profiles[profile.id] ?? emptyProgress();
  const stats = path.map((m) => moduleStats(m, mine));
  return Math.round(stats.reduce((a, s) => a + s.percent, 0) / stats.length);
}

function Picker({ onChoose, onClose }: { onChoose: (p: Profile) => void; onClose?: () => void }) {
  const { fullCatalog: catalog, root } = useApp();
  const current = root.settings.profileId;
  const percents = useMemo(() => Object.fromEntries(catalog.profiles.map((p) => [p.id, pathPercent(p, root, catalog)])), [catalog, root]);
  const name = root.settings.name;

  useEffect(() => {
    if (!onClose) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Choose a profile"
      className="fixed inset-0 z-[200] overflow-y-auto bg-zinc-950 text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(99,102,241,0.22),transparent_70%)]" />
      <div className="relative mx-auto flex min-h-full max-w-4xl flex-col items-center px-5 pb-16 pt-10 sm:pt-16">
        <Logo className="text-lg" />
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-10 text-center text-3xl font-medium tracking-tight sm:mt-14 sm:text-5xl"
        >
          Who&apos;s learning{name ? `, ${name}` : ""}?
        </motion.h1>
        <p className="mt-3 text-center text-sm text-zinc-400">Each profile has its own syllabus and its own progress.</p>

        <ul className="mt-10 grid w-full grid-cols-2 gap-x-4 gap-y-8 sm:mt-14 sm:grid-cols-3 sm:gap-x-8">
          {catalog.profiles.map((p, i) => (
            <motion.li
              key={p.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="flex justify-center"
            >
              <button onClick={() => onChoose(p)} className="group flex w-full max-w-[200px] flex-col items-center text-center outline-none" aria-label={`${p.title}: ${p.tagline}`}>
                <span
                  className="relative grid aspect-square w-full place-items-center overflow-hidden rounded-2xl text-6xl shadow-lg transition duration-200 group-hover:scale-105 group-hover:shadow-2xl group-focus-visible:scale-105 group-focus-visible:ring-4 group-focus-visible:ring-white sm:text-7xl"
                  style={{ background: `linear-gradient(135deg, ${p.from}, ${p.to})`, boxShadow: current === p.id ? `0 0 0 3px #fff` : undefined }}
                >
                  <span aria-hidden className="drop-shadow-md">{p.emoji}</span>
                  <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
                  {percents[p.id] > 0 && (
                    <span className="absolute inset-x-3 bottom-3 h-1 overflow-hidden rounded-full bg-black/35">
                      <span className="block h-full rounded-full bg-white" style={{ width: `${percents[p.id]}%` }} />
                    </span>
                  )}
                </span>
                <span className="mt-3 text-base font-medium text-zinc-200 transition group-hover:text-white">{p.title}</span>
                <span className="mt-0.5 text-[12.5px] leading-snug text-zinc-500 group-hover:text-zinc-400">{p.tagline}</span>
                {percents[p.id] > 0 && <span className="mt-1 text-[11px] tabular-nums text-zinc-500">{percents[p.id]}% of path</span>}
              </button>
            </motion.li>
          ))}
        </ul>

        {onClose && (
          <button onClick={onClose} className="mt-12 rounded-md border border-zinc-700 px-5 py-2 text-sm text-zinc-400 transition hover:border-white hover:text-white">
            Cancel
          </button>
        )}
      </div>
    </motion.div>
  );
}
