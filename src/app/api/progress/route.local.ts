import { rejectUnlessLocal } from "@/lib/guard";
import { readProgress, updateProgress } from "@/lib/progress-store";
import type { ProgressEvent } from "@/lib/types";

export const dynamic = "force-dynamic";

const EVENT_TYPES = new Set([
  "lesson.complete", "lesson.uncomplete", "note.save", "quiz.finish", "review.answer", "exercise.save",
  "exercise.result", "exercise.reset", "project.toggle", "project.repo", "mock.start", "mock.end",
  "daily.set", "playground.save", "visit", "settings", "import", "reset",
]);

export async function GET(req: Request) {
  const denied = rejectUnlessLocal(req, { write: false });
  if (denied) return denied;
  const progress = await readProgress();
  const download = new URL(req.url).searchParams.has("download");
  return new Response(JSON.stringify(progress, null, 2), {
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
      ...(download ? { "content-disposition": `attachment; filename="pypath-progress-${new Date().toISOString().slice(0, 10)}.json"` } : {}),
    },
  });
}

export async function POST(req: Request) {
  const denied = rejectUnlessLocal(req, { write: true });
  if (denied) return denied;
  let event: ProgressEvent;
  try {
    event = (await req.json()) as ProgressEvent;
  } catch {
    return Response.json({ error: "Body must be JSON." }, { status: 400 });
  }
  if (!event || !EVENT_TYPES.has(event.type)) {
    return Response.json({ error: "Unknown event type." }, { status: 400 });
  }
  if (event.type === "import") {
    const d = event.data as unknown as Record<string, unknown> | undefined;
    if (!d || typeof d !== "object" || d.version !== 1 || typeof d.lessons !== "object") {
      return Response.json({ error: "That file is not a PyPath progress export." }, { status: 400 });
    }
  }
  const progress = await updateProgress(event);
  return Response.json(progress, { headers: { "cache-control": "no-store" } });
}
