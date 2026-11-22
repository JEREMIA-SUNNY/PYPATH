import type { Catalog, CurriculumIndex, Difficulty, ModuleIndex, Progress, ProgressEvent, Track } from "./types";

export const QUIZ_PASS_RATIO = 0.7;
export const XP = {
  lesson: 10,
  quizPerCorrect: 5,
  project: 150,
  exercise: { easy: 25, medium: 40, hard: 60 } as Record<Difficulty, number>,
};
/** Days until the next review for a question that just moved into box N. */
export const REVIEW_INTERVALS: Record<number, number> = { 1: 1, 2: 3, 3: 7, 4: 14, 5: 30 };

export function localDay(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function addDays(n: number, from = new Date()): string {
  const d = new Date(from);
  d.setDate(d.getDate() + n);
  return localDay(d);
}

export function emptyProgress(): Progress {
  const now = new Date().toISOString();
  return {
    version: 1,
    createdAt: now,
    updatedAt: now,
    settings: {},
    lessons: {},
    notes: {},
    quizzes: {},
    review: {},
    exercises: {},
    projects: {},
    playground: { code: 'print("Hello from PyPath!")\n', stdin: "" },
    activity: {},
  };
}

/** Fill in any missing fields so older or hand-edited files still load. */
export function normalizeProgress(raw: unknown): Progress {
  const base = emptyProgress();
  if (!raw || typeof raw !== "object") return base;
  const r = raw as Partial<Progress>;
  return {
    ...base,
    ...r,
    version: 1,
    settings: { ...base.settings, ...(r.settings ?? {}) },
    lessons: { ...(r.lessons ?? {}) },
    notes: { ...(r.notes ?? {}) },
    quizzes: { ...(r.quizzes ?? {}) },
    review: { ...(r.review ?? {}) },
    exercises: { ...(r.exercises ?? {}) },
    projects: { ...(r.projects ?? {}) },
    playground: { ...base.playground, ...(r.playground ?? {}) },
    activity: { ...(r.activity ?? {}) },
  };
}

function bump(p: Progress, n = 1) {
  const day = localDay();
  p.activity[day] = (p.activity[day] ?? 0) + n;
}

function answerReview(p: Progress, ref: string, correct: boolean) {
  const cur = p.review[ref];
  if (!correct) {
    p.review[ref] = { box: 1, due: addDays(REVIEW_INTERVALS[1]) };
    return;
  }
  if (!cur) return;
  const box = cur.box + 1;
  if (box > 5) delete p.review[ref];
  else p.review[ref] = { box, due: addDays(REVIEW_INTERVALS[box]) };
}

/** Pure reducer: returns a new Progress with the event applied. */
export function applyEvent(prev: Progress, event: ProgressEvent): Progress {
  if (event.type === "reset") return emptyProgress();
  if (event.type === "import") return normalizeProgress(event.data);

  const p: Progress = structuredClone(prev);
  const now = new Date().toISOString();
  const today = localDay();

  switch (event.type) {
    case "lesson.complete":
      if (!p.lessons[event.ref]) {
        p.lessons[event.ref] = { completedAt: now };
        bump(p);
      }
      break;
    case "lesson.uncomplete":
      delete p.lessons[event.ref];
      break;
    case "note.save":
      if (event.text.trim()) p.notes[event.ref] = event.text;
      else delete p.notes[event.ref];
      break;
    case "quiz.finish": {
      const old = p.quizzes[event.moduleId];
      p.quizzes[event.moduleId] = {
        best: Math.max(old?.best ?? 0, event.score),
        total: event.total,
        attempts: (old?.attempts ?? 0) + 1,
        lastScore: event.score,
        lastAt: now,
      };
      for (const ref of event.missed) answerReview(p, ref, false);
      for (const ref of event.correct) {
        const r = p.review[ref];
        if (r && r.due <= today) answerReview(p, ref, true);
      }
      bump(p);
      break;
    }
    case "review.answer":
      answerReview(p, event.ref, event.correct);
      bump(p);
      break;
    case "exercise.save": {
      const old = p.exercises[event.ref];
      p.exercises[event.ref] = {
        status: old?.status ?? "attempted",
        attempts: old?.attempts ?? 0,
        passedAt: old?.passedAt,
        code: event.code,
        updatedAt: now,
      };
      break;
    }
    case "exercise.result": {
      const old = p.exercises[event.ref];
      const passed = event.passed || old?.status === "passed";
      p.exercises[event.ref] = {
        status: passed ? "passed" : "attempted",
        attempts: (old?.attempts ?? 0) + 1,
        passedAt: event.passed && !old?.passedAt ? now : old?.passedAt,
        code: event.code,
        updatedAt: now,
      };
      bump(p);
      break;
    }
    case "exercise.reset": {
      const old = p.exercises[event.ref];
      if (old) p.exercises[event.ref] = { ...old, code: undefined, updatedAt: now };
      break;
    }
    case "project.toggle": {
      const cur = p.projects[event.id] ?? { done: [] };
      const done = cur.done.includes(event.step) ? cur.done.filter((s) => s !== event.step) : [...cur.done, event.step];
      const complete = done.length >= event.total;
      p.projects[event.id] = { ...cur, done, completedAt: complete ? (cur.completedAt ?? now) : undefined };
      bump(p);
      break;
    }
    case "project.repo":
      p.projects[event.id] = { ...(p.projects[event.id] ?? { done: [] }), repo: event.repo.trim() || undefined };
      break;
    case "mock.start":
      p.mock = { startedAt: now, refs: event.refs, minutes: event.minutes };
      break;
    case "mock.end":
      delete p.mock;
      break;
    case "daily.set":
      p.daily = { date: event.date, ref: event.ref };
      break;
    case "playground.save":
      p.playground = { code: event.code, stdin: event.stdin };
      break;
    case "visit":
      p.lastVisited = { href: event.href, title: event.title, at: now };
      break;
    case "settings":
      p.settings = {
        ...p.settings,
        ...("name" in event ? { name: event.name?.trim() || undefined } : {}),
        ...("trackId" in event ? { trackId: event.trackId || undefined } : {}),
        ...("profileId" in event ? { profileId: event.profileId || undefined } : {}),
      };
      break;
  }
  p.updatedAt = now;
  return p;
}

// ---------- Derived stats ----------

export interface ModuleStats {
  module: ModuleIndex;
  lessonsDone: number;
  lessonsTotal: number;
  exercisesPassed: number;
  exercisesTotal: number;
  quizBest: number | null;
  quizTotal: number;
  quizPassed: boolean;
  percent: number;
  started: boolean;
  complete: boolean;
}

export function moduleStats(m: ModuleIndex, p: Progress): ModuleStats {
  const lessonsDone = m.lessons.filter((l) => p.lessons[`${m.id}/${l.id}`]).length;
  const exercisesPassed = m.exercises.filter((e) => p.exercises[`${m.id}/${e.id}`]?.status === "passed").length;
  const q = p.quizzes[m.id];
  const quizPassed = m.quizCount > 0 && !!q && q.best >= Math.ceil(m.quizCount * QUIZ_PASS_RATIO);
  const units = m.lessons.length + m.exercises.length + (m.quizCount > 0 ? 1 : 0);
  const done = lessonsDone + exercisesPassed + (quizPassed ? 1 : 0);
  const percent = units === 0 ? 0 : Math.round((done / units) * 100);
  return {
    module: m,
    lessonsDone,
    lessonsTotal: m.lessons.length,
    exercisesPassed,
    exercisesTotal: m.exercises.length,
    quizBest: q ? q.best : null,
    quizTotal: m.quizCount,
    quizPassed,
    percent,
    started: done > 0 || !!q,
    complete: units > 0 && done === units,
  };
}

export function streakDays(activity: Record<string, number>): number {
  const d = new Date();
  if (!activity[localDay(d)]) d.setDate(d.getDate() - 1);
  let n = 0;
  while (activity[localDay(d)]) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

export function longestStreak(activity: Record<string, number>): number {
  const days = Object.keys(activity).filter((k) => activity[k] > 0).sort();
  let best = 0;
  let run = 0;
  let prev: string | null = null;
  for (const day of days) {
    run = prev && addDays(1, new Date(`${prev}T12:00:00`)) === day ? run + 1 : 1;
    best = Math.max(best, run);
    prev = day;
  }
  return best;
}

export function overallStats(index: CurriculumIndex, p: Progress, projectsTotal = 0) {
  const modules = index.map((m) => moduleStats(m, p));
  const sum = (f: (s: ModuleStats) => number) => modules.reduce((a, s) => a + f(s), 0);
  let xp = 0;
  for (const m of index) {
    for (const l of m.lessons) if (p.lessons[`${m.id}/${l.id}`]) xp += XP.lesson;
    for (const e of m.exercises) if (p.exercises[`${m.id}/${e.id}`]?.status === "passed") xp += XP.exercise[e.difficulty];
    const q = p.quizzes[m.id];
    if (q) xp += q.best * XP.quizPerCorrect;
  }
  const projectsDone = Object.values(p.projects).filter((x) => x.completedAt).length;
  xp += projectsDone * XP.project;
  const attempted = index.filter((m) => p.quizzes[m.id]);
  const quizBestSum = attempted.reduce((a, m) => a + (p.quizzes[m.id]?.best ?? 0), 0);
  const quizTotalSum = attempted.reduce((a, m) => a + (p.quizzes[m.id]?.total ?? 0), 0);
  const lessonsTotal = sum((s) => s.lessonsTotal);
  const exercisesTotal = sum((s) => s.exercisesTotal);
  const quizzesTotal = index.filter((m) => m.quizCount > 0).length;
  const lessonsDone = sum((s) => s.lessonsDone);
  const exercisesPassed = sum((s) => s.exercisesPassed);
  const quizzesPassed = modules.filter((s) => s.quizPassed).length;
  const units = lessonsTotal + exercisesTotal + quizzesTotal;
  const interviewSolved = modules.filter((s) => s.module.section === "interview").reduce((a, s) => a + s.exercisesPassed, 0);
  return {
    modules,
    xp,
    streak: streakDays(p.activity),
    longestStreak: longestStreak(p.activity),
    lessonsDone,
    lessonsTotal,
    exercisesPassed,
    exercisesTotal,
    quizzesPassed,
    quizzesTotal,
    quizzesTaken: attempted.length,
    quizAverage: quizTotalSum ? Math.round((quizBestSum / quizTotalSum) * 100) : null,
    percent: units ? Math.round(((lessonsDone + exercisesPassed + quizzesPassed) / units) * 100) : 0,
    modulesComplete: modules.filter((s) => s.complete).length,
    projectsDone,
    projectsTotal,
    interviewSolved,
    reviewDue: reviewDue(p).length,
  };
}

/** Modules to work through, in order: Foundations, then the chosen track (or everything else). */
export function learningPath(index: CurriculumIndex, track?: Track | null): ModuleIndex[] {
  const foundations = index.filter((m) => m.section === "foundations");
  if (!track) return [...foundations, ...index.filter((m) => m.section !== "foundations")];
  const rest = track.modules.map((id) => index.find((m) => m.id === id)).filter((m): m is ModuleIndex => !!m);
  return [...foundations, ...rest];
}

export interface NextStep {
  href: string;
  title: string;
  label: string;
  moduleTitle: string;
}

/** The first unfinished thing on the path: lesson, then quiz, then exercises. */
export function nextStep(path: ModuleIndex[], p: Progress): NextStep | null {
  for (const m of path) {
    const lesson = m.lessons.find((l) => !p.lessons[`${m.id}/${l.id}`]);
    if (lesson) return { href: `/learn/${m.id}/${lesson.id}`, title: lesson.title, label: "Lesson", moduleTitle: m.title };
    const st = moduleStats(m, p);
    if (m.quizCount > 0 && !st.quizPassed) return { href: `/quizzes/${m.id}`, title: `${m.title} quiz`, label: "Quiz", moduleTitle: m.title };
    const ex = m.exercises.find((e) => p.exercises[`${m.id}/${e.id}`]?.status !== "passed");
    if (ex) return { href: `/code/${m.id}/${ex.id}`, title: ex.title, label: "Exercise", moduleTitle: m.title };
  }
  return null;
}

export function reviewDue(p: Progress, today = localDay()): string[] {
  return Object.entries(p.review)
    .filter(([, r]) => r.due <= today)
    .map(([ref]) => ref);
}

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Picks a fresh daily challenge: an unsolved exercise from a module you have started. */
export function pickDaily(path: ModuleIndex[], p: Progress, day = localDay()): string | null {
  const refs = (mods: ModuleIndex[]) =>
    mods.flatMap((m) => m.exercises.map((e) => `${m.id}/${e.id}`)).filter((r) => p.exercises[r]?.status !== "passed");
  const started = path.filter((m) => moduleStats(m, p).started || m.lessons.some((l) => p.lessons[`${m.id}/${l.id}`]));
  let pool = refs(started);
  if (pool.length === 0) pool = refs(path).slice(0, 6);
  if (pool.length === 0) return null;
  return pool[hashString(day) % pool.length];
}

// ---------- Achievements ----------

export interface Achievement {
  id: string;
  title: string;
  description: string;
  earned: boolean;
  progress?: [number, number];
}

export function achievements(catalog: Catalog, p: Progress): Achievement[] {
  const st = overallStats(catalog.modules, p, catalog.projects.length);
  const foundations = st.modules.filter((s) => s.module.section === "foundations");
  const track = catalog.tracks.find((t) => t.id === p.settings.trackId);
  const trackMods = track ? st.modules.filter((s) => track.modules.includes(s.module.id)) : [];
  const perfect = catalog.modules.some((m) => {
    const q = p.quizzes[m.id];
    return q && q.best === q.total && q.total > 0;
  });
  const longest = st.longestStreak;
  const lessonCount = Object.keys(p.lessons).length;
  const list: Achievement[] = [
    { id: "first-lesson", title: "First steps", description: "Complete your first lesson", earned: lessonCount > 0 },
    { id: "first-pass", title: "Green tests", description: "Pass your first coding exercise", earned: st.exercisesPassed > 0 },
    { id: "perfect-quiz", title: "Perfect score", description: "Get every question right in a quiz", earned: perfect },
    { id: "streak-3", title: "On a roll", description: "Learn 3 days in a row", earned: longest >= 3, progress: [Math.min(longest, 3), 3] },
    { id: "streak-7", title: "Week warrior", description: "Learn 7 days in a row", earned: longest >= 7, progress: [Math.min(longest, 7), 7] },
    { id: "streak-30", title: "Unstoppable", description: "Learn 30 days in a row", earned: longest >= 30, progress: [Math.min(longest, 30), 30] },
    { id: "ex-10", title: "Bug squasher", description: "Pass 10 exercises", earned: st.exercisesPassed >= 10, progress: [Math.min(st.exercisesPassed, 10), 10] },
    { id: "ex-50", title: "Code machine", description: "Pass 50 exercises", earned: st.exercisesPassed >= 50, progress: [Math.min(st.exercisesPassed, 50), 50] },
    {
      id: "foundations",
      title: "Solid foundations",
      description: "Complete every Foundations module",
      earned: foundations.length > 0 && foundations.every((s) => s.complete),
      progress: [foundations.filter((s) => s.complete).length, foundations.length],
    },
    {
      id: "track",
      title: "Track complete",
      description: track ? `Finish every module on the ${track.title} track` : "Pick a career track and finish it",
      earned: trackMods.length > 0 && trackMods.every((s) => s.complete),
      progress: track ? [trackMods.filter((s) => s.complete).length, trackMods.length] : undefined,
    },
    { id: "project", title: "Shipped it", description: "Finish a portfolio project", earned: st.projectsDone > 0 },
    {
      id: "interview-25",
      title: "Interview ready",
      description: "Solve 25 interview problems",
      earned: st.interviewSolved >= 25,
      progress: [Math.min(st.interviewSolved, 25), 25],
    },
    { id: "xp-1000", title: "Four digits", description: "Earn 1,000 XP", earned: st.xp >= 1000, progress: [Math.min(st.xp, 1000), 1000] },
  ];
  return list;
}
