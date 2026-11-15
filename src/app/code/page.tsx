import type { Metadata } from "next";
import { CodeHub } from "@/components/code-hub";
import { PageHeader } from "@/components/ui";

export const metadata: Metadata = { title: "Code" };

export default function CodePage() {
  return (
    <main className="mx-auto max-w-6xl px-4 pb-24 pt-28 sm:px-6 sm:pt-32">
      <PageHeader
        eyebrow="Practice"
        title="Coding exercises"
        description="Write real Python in a real editor. Run it as often as you like, then submit to check it against hidden tests on your own interpreter."
      />
      <CodeHub />
    </main>
  );
}
