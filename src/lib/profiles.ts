import { applyEvent, emptyProgress, normalizeProgress } from "./progress";
import type { CurriculumIndex, Profile, Progress, ProgressEvent, ProgressRoot } from "./types";

/** Profile that owns progress made before profiles existed, and events before one is chosen. */
export const DEFAULT_PROFILE = "python";

export function emptyRoot(): ProgressRoot {
  const now = new Date().toISOString();
  return { version: 2, createdAt: now, updatedAt: now, settings: {}, profiles: {} };
}

export function isRoot(raw: unknown): raw is ProgressRoot {
  const r = raw as { version?: unknown; profiles?: unknown } | null;
  return !!r && typeof r === "object" && r.version === 2 && !!r.profiles && typeof r.profiles === "object";
}

/** True for anything that looks like a PyPath progress file (version 1 or 2). */
export function looksLikeProgressFile(raw: unknown): boolean {
  const r = raw as { version?: unknown; lessons?: unknown } | null;
  if (!r || typeof r !== "object") return false;
  return isRoot(raw) || (r.version === 1 && !!r.lessons && typeof r.lessons === "object");
}

/** Accepts the current file format and the old single-profile one (which becomes the Python profile). */
export function normalizeRoot(raw: unknown): ProgressRoot {
  const base = emptyRoot();
  if (!raw || typeof raw !== "object") return base;
  if (isRoot(raw)) {
    const profiles: Record<string, Progress> = {};
    for (const [id, p] of Object.entries(raw.profiles)) profiles[id] = normalizeProgress(p);
    return {
      version: 2,
      createdAt: raw.createdAt ?? base.createdAt,
      updatedAt: raw.updatedAt ?? base.updatedAt,
      settings: { name: raw.settings?.name, profileId: raw.settings?.profileId },
      profiles,
    };
  }
  const legacy = normalizeProgress(raw);
  return {
    ...base,
    createdAt: legacy.createdAt,
    updatedAt: legacy.updatedAt,
    settings: { name: legacy.settings.name },
    profiles: { [DEFAULT_PROFILE]: legacy },
  };
}

export const activeProfileId = (root: ProgressRoot) => root.settings.profileId ?? DEFAULT_PROFILE;

/** The active profile's own progress record. */
export const sliceOf = (root: ProgressRoot): Progress => root.profiles[activeProfileId(root)] ?? emptyProgress();

/** The active slice with the shared settings (name, profile) overlaid, so UI code reads one object. */
export function viewOf(root: ProgressRoot): Progress {
  const s = sliceOf(root);
  return { ...s, settings: { ...s.settings, name: root.settings.name, profileId: root.settings.profileId } };
}

/** Reducer for the whole file. Profile-specific events only touch the active profile's record. */
export function applyRootEvent(root: ProgressRoot, event: ProgressEvent): ProgressRoot {
  const now = new Date().toISOString();
  const id = activeProfileId(root);

  if (event.type === "import") {
    if (isRoot(event.data)) {
      const next = normalizeRoot(event.data);
      return { ...next, settings: { ...next.settings, profileId: next.settings.profileId ?? root.settings.profileId }, updatedAt: now };
    }
    return { ...root, profiles: { ...root.profiles, [id]: normalizeProgress(event.data) }, updatedAt: now };
  }
  if (event.type === "reset") {
    return { ...root, profiles: { ...root.profiles, [id]: emptyProgress() }, updatedAt: now };
  }
  if (event.type === "settings") {
    let next: ProgressRoot = { ...root, settings: { ...root.settings }, profiles: { ...root.profiles }, updatedAt: now };
    if ("name" in event) next.settings.name = event.name?.trim() || undefined;
    if ("profileId" in event && event.profileId) {
      next.settings.profileId = event.profileId;
      next.profiles[event.profileId] ??= emptyProgress();
    }
    if ("trackId" in event) {
      const pid = activeProfileId(next);
      next = { ...next, profiles: { ...next.profiles, [pid]: applyEvent(next.profiles[pid] ?? emptyProgress(), { type: "settings", trackId: event.trackId }) } };
    }
    return next;
  }
  const slice = applyEvent(root.profiles[id] ?? emptyProgress(), event);
  return { ...root, profiles: { ...root.profiles, [id]: slice }, updatedAt: slice.updatedAt };
}

/** The modules in a profile's syllabus, in its own order and numbered from 1. All modules if no profile. */
export function scopeModules(all: CurriculumIndex, profile?: Profile | null): CurriculumIndex {
  if (!profile || profile.modules.length === 0) return all;
  const byId = new Map(all.map((m) => [m.id, m]));
  return profile.modules.flatMap((id, i) => {
    const m = byId.get(id);
    return m ? [{ ...m, order: i + 1 }] : [];
  });
}
