import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Workspace } from "@/components/workspace";
import { getCurriculum, getIndex, getModule } from "@/lib/content";

type Props = { params: Promise<{ module: string; exercise: string }> };

export function generateStaticParams() {
  return getCurriculum().flatMap((m) => m.exercises.map((e) => ({ module: m.id, exercise: e.id })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { module, exercise } = await params;
  return { title: getModule(module)?.exercises.find((e) => e.id === exercise)?.title ?? "Exercise" };
}

export default async function ExercisePage({ params }: Props) {
  const { module, exercise } = await params;
  const ex = getModule(module)?.exercises.find((e) => e.id === exercise);
  const m = getIndex().find((x) => x.id === module);
  if (!ex || !m) notFound();
  return <Workspace key={`${module}/${exercise}`} exercise={ex} module={m} />;
}
