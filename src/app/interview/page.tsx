import type { Metadata } from "next";
import { InterviewClient } from "@/components/interview-client";
import { PageHeader } from "@/components/ui";

export const metadata: Metadata = { title: "Interview prep" };

export default function InterviewPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 pb-24 pt-28 sm:px-6 sm:pt-32">
      <PageHeader
        eyebrow="Get hired"
        title="Interview prep"
        description="The data-structure and algorithm patterns that show up again and again in Python interviews, with problems checked by tests and a timed mock round."
      />
      <InterviewClient />
    </main>
  );
}
