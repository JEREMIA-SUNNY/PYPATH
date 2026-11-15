import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { QuizPlayer } from "@/components/quiz-player";
import { getCurriculum, getModule } from "@/lib/content";

type Props = { params: Promise<{ module: string }> };

export function generateStaticParams() {
  return getCurriculum().filter((m) => m.quiz.length > 0).map((m) => ({ module: m.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { module } = await params;
  const m = getModule(module);
  return { title: m ? `${m.title} quiz` : "Quiz" };
}

export default async function QuizPage({ params }: Props) {
  const { module } = await params;
  const m = getModule(module);
  if (!m || m.quiz.length === 0) notFound();
  const questions = m.quiz.map((q) => ({ ...q, ref: `${m.id}/${q.id}` }));
  return (
    <main className="mx-auto max-w-2xl px-4 pb-24 pt-28 sm:px-6 sm:pt-32">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-zinc-500">Module {m.order} quiz</p>
      <h1 className="mb-8 mt-2 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">{m.title}</h1>
      <QuizPlayer key={m.id} questions={questions} mode="quiz" moduleId={m.id} title={m.title} backHref="/quizzes" />
    </main>
  );
}
