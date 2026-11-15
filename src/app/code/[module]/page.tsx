import { redirect } from "next/navigation";
import { getIndex } from "@/lib/content";

export function generateStaticParams() {
  return getIndex().map((m) => ({ module: m.id }));
}

export default async function CodeModuleRedirect({ params }: { params: Promise<{ module: string }> }) {
  const { module } = await params;
  redirect(`/learn/${module}`);
}
