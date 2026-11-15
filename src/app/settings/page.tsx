import type { Metadata } from "next";
import { SettingsClient } from "@/components/settings-client";
import { PageHeader } from "@/components/ui";
import { HOSTED } from "@/lib/mode";
import { PROGRESS_FILE } from "@/lib/progress-store";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 pb-24 pt-28 sm:px-6 sm:pt-32">
      <PageHeader title="Settings" description={HOSTED ? "Everything PyPath knows lives in one JSON file you choose, plus a backup in this browser." : "Everything PyPath knows lives in one JSON file on this computer."} />
      <SettingsClient dataFile={HOSTED ? "" : PROGRESS_FILE} />
    </main>
  );
}
