"use client";

import { motion } from "motion/react";
import { useMemo } from "react";

const COLORS = ["#6366f1", "#0ea5e9", "#8b5cf6", "#10b981", "#f59e0b", "#3776ab", "#ffd43b"];

/** A short, dependency-free confetti burst. Render it when something is completed. */
export function Confetti({ count = 36 }: { count?: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 520,
        y: -(Math.random() * 260 + 80),
        r: Math.random() * 540 - 270,
        c: COLORS[i % COLORS.length],
        d: 0.9 + Math.random() * 0.6,
      })),
    [count],
  );
  return (
    <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 z-10">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          className="absolute block h-2.5 w-1.5 rounded-[2px]"
          style={{ background: p.c }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
          animate={{ x: p.x, y: [0, p.y, p.y + 260], opacity: [1, 1, 0], rotate: p.r }}
          transition={{ duration: p.d * 1.6, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}
