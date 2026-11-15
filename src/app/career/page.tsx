import type { Metadata } from "next";
import { CareerClient } from "@/components/career-client";
import { PageHeader } from "@/components/ui";

export const metadata: Metadata = { title: "Career" };

export default function CareerPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 pb-24 pt-28 sm:px-6 sm:pt-32">
      <PageHeader
        eyebrow="Get hired"
        title="Career"
        description="Pick the role you're aiming for, follow its roadmap, and turn what you learn into skills and portfolio projects an employer can see."
      />
      <CareerClient />
    </main>
  );
}
