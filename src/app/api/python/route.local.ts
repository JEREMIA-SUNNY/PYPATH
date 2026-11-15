import { rejectUnlessLocal } from "@/lib/guard";
import { findPython } from "@/lib/python";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const denied = rejectUnlessLocal(req, { write: false });
  if (denied) return denied;
  const recheck = new URL(req.url).searchParams.has("recheck");
  return Response.json(findPython(recheck));
}
