// Shared types used by both the server and the browser.

export type ModuleKind = "module" | "project" | "capstone";
export type Section = "foundations" | "career" | "interview";
export type Difficulty = "easy" | "medium" | "hard";

export interface QuizQuestion {
  id: string;
  question: string;
  code?: string;
  options: string[];
  answer: number;
  explanation: string;
}

export interface ExerciseTest {
  name: string;
  code: string;
}

export interface Exercise {
  id: string;
  moduleId: string;
  title: string;
  difficulty: Difficulty;
  prompt: string;
  starter: string;
  hints: string[];
  tests: ExerciseTest[];
  solution: string;
  stdin?: string;
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  minutes: number;
  body: string;
}

export interface CourseModule {
  id: string;
  order: number;
  title: string;
  summary: string;
  kind: ModuleKind;
  section: Section;
  icon: string;
  skills: string[];
  packages: string[];
  lessons: Lesson[];
  quiz: QuizQuestion[];
  exercises: Exercise[];
}

/** Light-weight curriculum shape that is safe and cheap to send to every page. */
export interface ModuleIndex {
  id: string;
  order: number;
  title: string;
  summary: string;
  kind: ModuleKind;
  section: Section;
  icon: string;
  skills: string[];
  packages: string[];
  lessons: { id: string; title: string; minutes: number }[];
  quizCount: number;
  exercises: { id: string; title: string; difficulty: Difficulty }[];
}

export type CurriculumIndex = ModuleIndex[];

export interface Track {
  id: string;
  title: string;
  roles: string;
  summary: string;
  icon: string;
  modules: string[];
  project?: string;
}

export interface PortfolioProject {
  id: string;
  title: string;
  track: string;
  summary: string;
  skills: string[];
  steps: { id: string; text: string }[];
  stretch: string[];
  bullet: string;
}

/** A "who is learning" lens shown in the profile picker. Shares one progress file with every other profile. */
export interface Profile {
  id: string;
  title: string;
  tagline: string;
  emoji: string;
  from: string;
  to: string;
  trackId: string;
  summary: string;
  /** This profile's own syllabus: module ids, in the order they are taught. */
  modules: string[];
  focus: string[];
}

export interface Catalog {
  modules: CurriculumIndex;
  tracks: Track[];
  profiles: Profile[];
  projects: PortfolioProject[];
}

// ---------- Progress ----------

export interface QuizRecord {
  best: number;
  total: number;
  attempts: number;
  lastScore: number;
  lastAt: string;
}

export interface ExerciseRecord {
  status: "attempted" | "passed";
  code?: string;
  attempts: number;
  passedAt?: string;
  updatedAt: string;
}

export interface Progress {
  version: 1;
  createdAt: string;
  updatedAt: string;
  settings: { name?: string; trackId?: string; profileId?: string };
  lessons: Record<string, { completedAt: string }>;
  notes: Record<string, string>;
  review: Record<string, { box: number; due: string }>;
  projects: Record<string, { done: string[]; repo?: string; completedAt?: string }>;
  mock?: { startedAt: string; refs: string[]; minutes: number };
  daily?: { date: string; ref: string };
  quizzes: Record<string, QuizRecord>;
  exercises: Record<string, ExerciseRecord>;
  playground: { code: string; stdin: string };
  activity: Record<string, number>;
  lastVisited?: { href: string; title: string; at: string };
}

/**
 * The progress file. Every profile (AI Engineer, Python, ...) has its OWN progress record, so each
 * syllabus is tracked separately. Only the learner's name and the active profile are shared.
 */
export interface ProgressRoot {
  version: 2;
  createdAt: string;
  updatedAt: string;
  settings: { name?: string; profileId?: string };
  profiles: Record<string, Progress>;
}

export type ProgressEvent =
  | { type: "lesson.complete"; ref: string }
  | { type: "lesson.uncomplete"; ref: string }
  | { type: "note.save"; ref: string; text: string }
  | { type: "quiz.finish"; moduleId: string; score: number; total: number; missed: string[]; correct: string[] }
  | { type: "review.answer"; ref: string; correct: boolean }
  | { type: "exercise.save"; ref: string; code: string }
  | { type: "exercise.result"; ref: string; code: string; passed: boolean }
  | { type: "exercise.reset"; ref: string }
  | { type: "playground.save"; code: string; stdin: string }
  | { type: "project.toggle"; id: string; step: string; total: number }
  | { type: "project.repo"; id: string; repo: string }
  | { type: "mock.start"; refs: string[]; minutes: number }
  | { type: "mock.end" }
  | { type: "daily.set"; date: string; ref: string }
  | { type: "visit"; href: string; title: string }
  | { type: "settings"; name?: string; trackId?: string; profileId?: string }
  | { type: "import"; data: ProgressRoot | Progress }
  | { type: "reset" };

// ---------- Runner ----------

export interface TestResult {
  name: string;
  passed: boolean;
  message: string;
}

export interface RunResult {
  ok: boolean;
  stdout: string;
  stderr: string;
  error: string | null;
  tests: TestResult[];
  durationMs: number;
  timedOut?: boolean;
  pythonMissing?: boolean;
  truncated?: boolean;
}
