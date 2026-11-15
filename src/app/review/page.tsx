import type { Metadata } from "next";
import { ReviewClient } from "@/components/review-client";
import { getQuestionBank } from "@/lib/content";

export const metadata: Metadata = { title: "Review" };

export default function ReviewPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 pb-24 pt-28 sm:px-6 sm:pt-32">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-zinc-500">Spaced repetition</p>
      <h1 className="mb-8 mt-2 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">Review</h1>
      <ReviewClient bank={getQuestionBank()} />
    </main>
  );
}
