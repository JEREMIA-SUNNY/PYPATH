import "server-only";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import YAML from "yaml";
import type {
  Catalog, CourseModule, CurriculumIndex, Difficulty, Exercise, Lesson, ModuleKind, PortfolioProject, QuizQuestion, Section, Track,
} from "./types";

const CONTENT_DIR = path.join(/* turbopackIgnore: true */ process.cwd(), "content");
const stripOrder = (name: string) => name.replace(/^\d+[-_]/, "").replace(/\.md$/, "");

function readYaml<T>(file: string, fallback: T): T {
  if (!existsSync(file)) return fallback;
  const parsed = YAML.parse(readFileSync(file, "utf8"));
  return (parsed ?? fallback) as T;
}

function loadModule(dirName: string): CourseModule {
  const dir = path.join(CONTENT_DIR, dirName);
  const id = stripOrder(dirName);
  const order = Number.parseInt(dirName, 10) || 0;
  const meta = readYaml<{
    title: string; summary: string; kind?: ModuleKind; section?: Section; icon?: string; skills?: string[]; packages?: string[];
  }>(
    path.join(dir, "module.yaml"),
    { title: id, summary: "" },
  );

  const lessons: Lesson[] = readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .sort()
    .map((file) => {
      const { data, content } = matter(readFileSync(path.join(dir, file), "utf8"));
      return {
        id: stripOrder(file),
        moduleId: id,
        title: String(data.title ?? stripOrder(file)),
        minutes: Number(data.minutes ?? 5),
        body: content.trim(),
      };
    });

  type RawQ = { id?: string; q: string; code?: string; options: string[]; answer: number; explain: string };
  const quiz: QuizQuestion[] = readYaml<RawQ[]>(path.join(dir, "quiz.yaml"), []).map((q, i) => ({
    id: q.id ?? `q${i + 1}`,
    question: q.q,
    code: q.code?.replace(/\n$/, ""),
    options: q.options.map(String),
    answer: q.answer,
    explanation: q.explain,
  }));

  type RawE = Omit<Exercise, "moduleId" | "hints" | "difficulty"> & { hints?: string[]; difficulty?: Difficulty };
  const exercises: Exercise[] = readYaml<RawE[]>(path.join(dir, "exercises.yaml"), []).map((e) => ({
    ...e,
    moduleId: id,
    difficulty: e.difficulty ?? "easy",
    hints: e.hints ?? [],
    tests: e.tests ?? [],
    starter: e.starter ?? "",
    solution: e.solution ?? "",
  }));

  return {
    id,
    order,
    title: meta.title,
    summary: meta.summary,
    kind: meta.kind ?? "module",
    section: meta.section ?? "foundations",
    icon: meta.icon ?? "book",
    skills: meta.skills ?? [],
    packages: meta.packages ?? [],
    lessons,
    quiz,
    exercises,
  };
}

let cache: CourseModule[] | null = null;

/** Loads every module under /content. Re-read on each call in dev so content edits show up live. */
export function getCurriculum(): CourseModule[] {
  if (cache && process.env.NODE_ENV === "production") return cache;
  const dirs = readdirSync(CONTENT_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && /^\d+[-_]/.test(d.name))
    .map((d) => d.name)
    .sort();
  cache = dirs.map(loadModule);
  return cache;
}

export function getIndex(): CurriculumIndex {
  return getCurriculum().map((m) => ({
    id: m.id,
    order: m.order,
    title: m.title,
    summary: m.summary,
    kind: m.kind,
    section: m.section,
    icon: m.icon,
    skills: m.skills,
    packages: m.packages,
    lessons: m.lessons.map((l) => ({ id: l.id, title: l.title, minutes: l.minutes })),
    quizCount: m.quiz.length,
    exercises: m.exercises.map((e) => ({ id: e.id, title: e.title, difficulty: e.difficulty })),
  }));
}

export function getModule(id: string) {
  return getCurriculum().find((m) => m.id === id) ?? null;
}

export function getExercise(ref: string) {
  const [moduleId, exerciseId] = ref.split("/");
  return getModule(moduleId)?.exercises.find((e) => e.id === exerciseId) ?? null;
}

export function getCatalog(): Catalog {
  const tracks = readYaml<Track[]>(path.join(CONTENT_DIR, "tracks.yaml"), []);
  type RawP = Omit<PortfolioProject, "steps"> & { steps: (string | { id: string; text: string })[] };
  const projects = readYaml<RawP[]>(path.join(CONTENT_DIR, "projects.yaml"), []).map((p) => ({
    ...p,
    stretch: p.stretch ?? [],
    steps: p.steps.map((s, i) => (typeof s === "string" ? { id: `s${i + 1}`, text: s } : s)),
  }));
  return { modules: getIndex(), tracks, projects };
}

/** Every quiz question keyed by "moduleId/questionId", for the review queue. */
export function getQuestionBank() {
  const bank: Record<string, QuizQuestion & { moduleId: string; moduleTitle: string }> = {};
  for (const m of getCurriculum()) for (const q of m.quiz) bank[`${m.id}/${q.id}`] = { ...q, moduleId: m.id, moduleTitle: m.title };
  return bank;
}
