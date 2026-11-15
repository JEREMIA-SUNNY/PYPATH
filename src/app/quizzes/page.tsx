import type { Metadata } from "next";
import { QuizHub } from "@/components/quiz-hub";
import { PageHeader } from "@/components/ui";

export const metadata: Metadata = { title: "Quizzes" };

export default function QuizzesPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 pb-24 pt-28 sm:px-6 sm:pt-32">
      <PageHeader
        eyebrow="Practice"
        title="Quizzes"
        description="Check what stuck. Every answer comes with an explanation, and anything you miss comes back for review on a schedule."
      />
      <QuizHub />
    </main>
  );
}
