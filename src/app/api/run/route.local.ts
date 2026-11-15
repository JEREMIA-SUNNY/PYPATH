import { getExercise } from "@/lib/content";
import { rejectUnlessLocal } from "@/lib/guard";
import { runPython } from "@/lib/python";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const denied = rejectUnlessLocal(req, { write: true });
  if (denied) return denied;
  let body: { code?: unknown; stdin?: unknown; mode?: unknown; exercise?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Body must be JSON." }, { status: 400 });
  }
  if (typeof body.code !== "string" || body.code.length > 200_000) {
    return Response.json({ error: "code must be a string under 200 KB." }, { status: 400 });
  }
  const stdin = typeof body.stdin === "string" ? body.stdin : "";
  if (body.mode === "test") {
    const exercise = typeof body.exercise === "string" ? getExercise(body.exercise) : null;
    if (!exercise) return Response.json({ error: "Unknown exercise." }, { status: 404 });
    return Response.json(await runPython({ code: body.code, stdin: exercise.stdin ?? stdin, tests: exercise.tests }));
  }
  return Response.json(await runPython({ code: body.code, stdin }));
}
