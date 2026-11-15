/** "just now", "5 minutes ago", "2 hours ago", "3 days ago". Accepts a timestamp (ms) or ISO string. */
export function relTime(when: number | string | null | undefined, now = Date.now()): string {
  const t = typeof when === "string" ? Date.parse(when) : when;
  if (!t || Number.isNaN(t)) return "a while ago";
  const s = Math.max(0, Math.round((now - t) / 1000));
  if (s < 10) return "just now";
  if (s < 60) return `${s} seconds ago`;
  const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? "" : "s"} ago`;
  const m = Math.round(s / 60);
  if (m < 60) return plural(m, "minute");
  const h = Math.round(m / 60);
  if (h < 24) return plural(h, "hour");
  return plural(Math.round(h / 24), "day");
}

export function summarize(p: { lessons: Record<string, unknown>; exercises: Record<string, { status: string }> }): string {
  const lessons = Object.keys(p.lessons).length;
  const exercises = Object.values(p.exercises).filter((e) => e.status === "passed").length;
  return `${lessons} lesson${lessons === 1 ? "" : "s"} · ${exercises} exercise${exercises === 1 ? "" : "s"}`;
}
