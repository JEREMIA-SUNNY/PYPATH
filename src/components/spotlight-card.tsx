"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

/** A card whose border lights up where the cursor is. */
export function SpotlightCard({ className, children }: { className?: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        el.style.setProperty("--x", `${e.clientX - rect.left}px`);
        el.style.setProperty("--y", `${e.clientY - rect.top}px`);
      }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800/80 dark:bg-zinc-900/40",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(420px circle at var(--x, 50%) var(--y, 50%), oklch(0.6 0.2 268 / 0.10), transparent 45%)",
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}
