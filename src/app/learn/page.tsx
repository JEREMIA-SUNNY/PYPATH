import type { Metadata } from "next";
import { LearnGrid } from "@/components/learn-grid";
import { PageHeader } from "@/components/ui";
import { getIndex } from "@/lib/content";

export const metadata: Metadata = { title: "Learn" };

export default function LearnPage() {
  const index = getIndex();
  const lessons = index.reduce((a, m) => a + m.lessons.length, 0);
  return (
    <main className="mx-auto max-w-6xl px-4 pb-24 pt-28 sm:px-6 sm:pt-32">
      <PageHeader
        eyebrow={`${index.length} modules · ${lessons} lessons`}
        title="Learn"
        description="Short lessons with code you can run right on the page. Work through Foundations in order, then follow your career track."
      />
      <div className="mt-12">
        <LearnGrid />
      </div>
    </main>
  );
}
