import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ModuleIcon } from "@/components/module-icon";
import { ModuleOverview } from "@/components/module-overview";
import { getIndex } from "@/lib/content";

type Props = { params: Promise<{ module: string }> };

export function generateStaticParams() {
  return getIndex().map((m) => ({ module: m.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { module } = await params;
  return { title: getIndex().find((m) => m.id === module)?.title ?? "Module" };
}

export default async function ModulePage({ params }: Props) {
  const { module } = await params;
  const m = getIndex().find((x) => x.id === module);
  if (!m) notFound();
  const section = { foundations: "Foundations", career: "Career module", interview: "Interview prep" }[m.section];
  return (
    <main className="mx-auto max-w-6xl px-4 pb-24 pt-28 sm:px-6 sm:pt-32">
      <Link href="/learn" className="text-[13px] text-zinc-500 hover:text-zinc-900 dark:hover:text-white">
        ← All modules
      </Link>
      <div className="mt-6 flex items-start gap-5">
        <span className="grid size-14 shrink-0 place-items-center rounded-2xl border border-zinc-200 bg-white text-zinc-700 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
          <ModuleIcon name={m.icon} className="size-6" />
        </span>
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-zinc-500">
            {section} · Module {m.order}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl dark:text-white">{m.title}</h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-zinc-600 dark:text-zinc-400">{m.summary}</p>
        </div>
      </div>
      <ModuleOverview m={m} />
    </main>
  );
}
