"use client";

import { BookOpen, Code2, FileText, ListChecks, Search, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useApp } from "./providers";

type Item = { href: string; title: string; group: string; hint?: string };

const PAGES: Item[] = [
  { href: "/", title: "Dashboard", group: "Pages" },
  { href: "/learn", title: "Learn: all modules", group: "Pages" },
  { href: "/quizzes", title: "Quizzes", group: "Pages" },
  { href: "/review", title: "Review missed questions", group: "Pages" },
  { href: "/code", title: "Coding exercises", group: "Pages" },
  { href: "/interview", title: "Interview prep", group: "Pages" },
  { href: "/career", title: "Career: tracks, skills, projects", group: "Pages" },
  { href: "/playground", title: "Playground", group: "Pages" },
  { href: "/settings", title: "Settings", group: "Pages" },
];

const groupIcon: Record<string, typeof BookOpen> = { Pages: Sparkles, Modules: BookOpen, Lessons: FileText, Exercises: Code2, Quizzes: ListChecks };

export function CommandPalette() {
  const { index } = useApp();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const all = useMemo<Item[]>(() => {
    const items = [...PAGES];
    for (const m of index) {
      items.push({ href: `/learn/${m.id}`, title: m.title, group: "Modules", hint: `Module ${m.order}` });
      for (const l of m.lessons) items.push({ href: `/learn/${m.id}/${l.id}`, title: l.title, group: "Lessons", hint: m.title });
      if (m.quizCount) items.push({ href: `/quizzes/${m.id}`, title: `${m.title} quiz`, group: "Quizzes", hint: `${m.quizCount} questions` });
      for (const e of m.exercises) items.push({ href: `/code/${m.id}/${e.id}`, title: e.title, group: "Exercises", hint: m.title });
    }
    return items;
  }, [index]);

  const results = useMemo(() => {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    const list = words.length
      ? all.filter((it) => words.every((w) => `${it.title} ${it.hint ?? ""} ${it.group}`.toLowerCase().includes(w)))
      : all.filter((it) => it.group === "Pages" || it.group === "Modules");
    return list.slice(0, 40);
  }, [q, all]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("pypath:palette", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pypath:palette", onOpen);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setQ("");
      setSel(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  const go = (it?: Item) => {
    if (!it) return;
    setOpen(false);
    router.push(it.href);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-start justify-center bg-zinc-950/40 px-4 pt-[14vh] backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={() => setOpen(false)}
        >
          <motion.div
            role="dialog"
            aria-label="Search PyPath"
            initial={{ y: -12, scale: 0.98, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: -8, scale: 0.98, opacity: 0 }}
            transition={{ duration: 0.16 }}
            onMouseDown={(e) => e.stopPropagation()}
            className="w-full max-w-xl overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950"
          >
            <div className="flex items-center gap-3 border-b border-zinc-200 px-4 dark:border-zinc-800">
              <Search className="size-4 text-zinc-400" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setSel(0);
                }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setSel((s) => Math.min(s + 1, results.length - 1));
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setSel((s) => Math.max(s - 1, 0));
                  } else if (e.key === "Enter") {
                    go(results[sel]);
                  }
                }}
                placeholder="Search lessons, exercises, quizzes…"
                // Inline: the unlayered global :focus-visible rule beats Tailwind's layered outline-none.
                style={{ outline: "none" }}
                className="h-12 w-full bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 dark:text-white"
              />
            </div>
            <div className="max-h-[50vh] overflow-y-auto p-2">
              {results.length === 0 && <p className="px-3 py-8 text-center text-sm text-zinc-500">Nothing matches “{q}”.</p>}
              {results.map((it, i) => {
                const Icon = groupIcon[it.group] ?? FileText;
                return (
                  <button
                    key={`${it.group}-${it.href}`}
                    onMouseEnter={() => setSel(i)}
                    onClick={() => go(it)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm",
                      i === sel ? "bg-zinc-100 dark:bg-zinc-900" : "",
                    )}
                  >
                    <Icon className="size-4 shrink-0 text-zinc-400" />
                    <span className="flex-1 truncate text-zinc-800 dark:text-zinc-200">{it.title}</span>
                    <span className="truncate text-[11px] text-zinc-400">{it.hint ?? it.group}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
