"use client";

import { ArrowLeft, ArrowRight, CircleCheck, Circle, Code2, ListChecks, NotebookPen } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { ModuleIndex } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useApp } from "./providers";
import { Button, ButtonLink } from "./ui";

export function LessonSidebar({ m, current }: { m: ModuleIndex; current: string }) {
  const { progress } = useApp();
  return (
    <nav className="space-y-6 text-sm">
      <div>
        <Link href={`/learn/${m.id}`} className="text-[12px] font-medium uppercase tracking-wider text-zinc-500 hover:text-zinc-900 dark:hover:text-white">
          {m.title}
        </Link>
        <ul className="mt-3 space-y-0.5">
          {m.lessons.map((l) => {
            const done = !!progress.lessons[`${m.id}/${l.id}`];
            const active = l.id === current;
            return (
              <li key={l.id}>
                <Link
                  href={`/learn/${m.id}/${l.id}`}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 transition-colors",
                    active
                      ? "bg-zinc-100 font-medium text-zinc-900 dark:bg-zinc-800/70 dark:text-white"
                      : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white",
                  )}
                >
                  {done ? <CircleCheck className="size-4 shrink-0 text-emerald-500" /> : <Circle className="size-4 shrink-0 text-zinc-300 dark:text-zinc-700" />}
                  <span className="truncate">{l.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="space-y-0.5 border-t border-zinc-200 pt-4 dark:border-zinc-800">
        {m.quizCount > 0 && (
          <Link href={`/quizzes/${m.id}`} className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
            <ListChecks className="size-4" /> Take the quiz
          </Link>
        )}
        {m.exercises.length > 0 && (
          <Link
            href={`/code/${m.id}/${m.exercises[0].id}`}
            className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          >
            <Code2 className="size-4" /> Practice ({m.exercises.length})
          </Link>
        )}
      </div>
    </nav>
  );
}

export function LessonFooter({ m, lessonId, title }: { m: ModuleIndex; lessonId: string; title: string }) {
  const { progress, dispatch } = useApp();
  const router = useRouter();
  const ref = `${m.id}/${lessonId}`;
  const done = !!progress.lessons[ref];
  const idx = m.lessons.findIndex((l) => l.id === lessonId);
  const prev = m.lessons[idx - 1];
  const next = m.lessons[idx + 1];
  const after = next
    ? { href: `/learn/${m.id}/${next.id}`, label: next.title }
    : m.quizCount
      ? { href: `/quizzes/${m.id}`, label: "Module quiz" }
      : m.exercises.length
        ? { href: `/code/${m.id}/${m.exercises[0].id}`, label: "Exercises" }
        : { href: `/learn/${m.id}`, label: "Module overview" };

  useEffect(() => {
    dispatch({ type: "visit", href: `/learn/${ref}`, title });
  }, [ref, title, dispatch]);

  return (
    <div className="mt-14 border-t border-zinc-200 pt-8 dark:border-zinc-800">
      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        {prev ? (
          <ButtonLink href={`/learn/${m.id}/${prev.id}`} variant="ghost">
            <ArrowLeft className="size-4" /> {prev.title}
          </ButtonLink>
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          {done ? (
            <Button variant="secondary" onClick={() => dispatch({ type: "lesson.uncomplete", ref })}>
              <CircleCheck className="size-4 text-emerald-500" /> Completed
            </Button>
          ) : null}
          <Button
            onClick={() => {
              if (!done) dispatch({ type: "lesson.complete", ref });
              router.push(after.href);
            }}
          >
            {done ? "Next" : "Complete and continue"}: {after.label} <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function NotesPanel({ refKey }: { refKey: string }) {
  const { progress, dispatch } = useApp();
  const [text, setText] = useState(progress.notes[refKey] ?? "");
  const [saved, setSaved] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setText(progress.notes[refKey] ?? "");
    // only when switching lessons
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refKey]);

  const onChange = (v: string) => {
    setText(v);
    setSaved(false);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      dispatch({ type: "note.save", ref: refKey, text: v });
      setSaved(true);
    }, 800);
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
      <div className="mb-2 flex items-center justify-between text-[12px]">
        <span className="flex items-center gap-1.5 font-medium text-zinc-700 dark:text-zinc-300">
          <NotebookPen className="size-3.5" /> My notes
        </span>
        <span className="text-zinc-400">{saved ? "Saved" : "Saving…"}</span>
      </div>
      <textarea
        value={text}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Jot down what clicked, or what to revisit…"
        rows={6}
        className="w-full resize-y rounded-lg bg-zinc-50 p-2.5 text-[13px] leading-relaxed text-zinc-800 outline-none placeholder:text-zinc-400 focus:ring-2 focus:ring-indigo-500/30 dark:bg-zinc-950/60 dark:text-zinc-200"
      />
    </div>
  );
}
