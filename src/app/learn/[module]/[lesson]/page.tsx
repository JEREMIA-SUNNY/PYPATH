import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LessonFooter, LessonSidebar, NotesPanel } from "@/components/lesson-client";
import { Markdown } from "@/components/markdown";
import { getCurriculum, getIndex, getModule } from "@/lib/content";

type Props = { params: Promise<{ module: string; lesson: string }> };

export function generateStaticParams() {
  return getCurriculum().flatMap((m) => m.lessons.map((l) => ({ module: m.id, lesson: l.id })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { module, lesson } = await params;
  return { title: getModule(module)?.lessons.find((l) => l.id === lesson)?.title ?? "Lesson" };
}

export default async function LessonPage({ params }: Props) {
  const { module, lesson } = await params;
  const full = getModule(module);
  const l = full?.lessons.find((x) => x.id === lesson);
  const m = getIndex().find((x) => x.id === module);
  if (!full || !l || !m) notFound();
  const idx = full.lessons.findIndex((x) => x.id === lesson);

  return (
    <main className="mx-auto max-w-6xl px-4 pb-24 pt-28 sm:px-6 sm:pt-32">
      <div className="grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)_240px]">
        <aside className="hidden lg:block">
          <div className="sticky top-28">
            <LessonSidebar m={m} current={l.id} />
          </div>
        </aside>
        <article className="min-w-0 max-w-[720px]">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-zinc-500">
            {m.title} · Lesson {idx + 1} of {full.lessons.length} · {l.minutes} min
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl dark:text-white">{l.title}</h1>
          <div className="prose-py mt-8">
            <Markdown>{l.body}</Markdown>
          </div>
          <LessonFooter m={m} lessonId={l.id} title={l.title} />
        </article>
        <aside className="hidden lg:block">
          <div className="sticky top-28">
            <NotesPanel refKey={`${m.id}/${l.id}`} />
          </div>
        </aside>
      </div>
      <div className="mt-10 lg:hidden">
        <NotesPanel refKey={`${m.id}/${l.id}`} />
      </div>
    </main>
  );
}
