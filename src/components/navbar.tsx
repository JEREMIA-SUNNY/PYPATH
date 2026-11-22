"use client";

import { BookOpen, Briefcase, Code2, LayoutDashboard, ListChecks, Search, Settings, Swords, Terminal } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { HOSTED } from "@/lib/mode";
import { relTime } from "@/lib/rel-time";
import { useApp } from "./providers";
import { ThemeToggle } from "./theme-toggle";

const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/learn", label: "Learn", icon: BookOpen },
  { href: "/quizzes", label: "Quizzes", icon: ListChecks },
  { href: "/code", label: "Code", icon: Code2 },
  { href: "/interview", label: "Interview", icon: Swords },
  { href: "/career", label: "Career", icon: Briefcase },
  { href: "/playground", label: "Playground", icon: Terminal },
];

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2 font-semibold tracking-tight", className)}>
      <span className="relative grid size-6 place-items-center overflow-hidden rounded-lg bg-zinc-900 dark:bg-white">
        <span className="absolute -left-1 -top-1 size-4 rounded-full bg-py-blue blur-[3px]" />
        <span className="absolute -bottom-1 -right-1 size-4 rounded-full bg-py-yellow blur-[3px]" />
        <span className="relative font-mono text-[11px] font-bold text-white dark:text-zinc-900">py</span>
      </span>
      <span className="text-zinc-900 dark:text-white">PyPath</span>
    </span>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const { saveError, saveStatus, catalog, progress } = useApp();
  const profile = catalog.profiles.find((p) => p.id === progress.settings.profileId);
  const [, tick] = useState(0);
  useEffect(() => {
    if (!HOSTED) return;
    const t = setInterval(() => tick((n) => n + 1), 30_000);
    return () => clearInterval(t);
  }, []);
  const [scrolled, setScrolled] = useState(false);
  const [mod, setMod] = useState("Ctrl");
  useEffect(() => {
    if (/mac|iphone|ipad/i.test(navigator.platform)) setMod("⌘");
  }, []);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const active = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3 sm:pt-4">
      <motion.nav
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "pointer-events-auto flex w-full max-w-[28rem] items-center justify-between gap-1 rounded-full border px-2 py-1.5 backdrop-blur-xl transition-all duration-300 md:w-auto md:max-w-none md:justify-start",
          scrolled
            ? "border-zinc-200/80 bg-white/80 shadow-lg shadow-zinc-900/5 dark:border-zinc-800 dark:bg-zinc-950/75 dark:shadow-black/40"
            : "border-zinc-200/60 bg-white/60 dark:border-zinc-800/60 dark:bg-zinc-950/40",
        )}
      >
        <Link href="/" className="rounded-full px-2 py-1 md:mr-1" aria-label="PyPath home">
          <Logo className="text-sm" />
        </Link>
        <div className="mx-1 hidden h-5 w-px bg-zinc-200 md:block dark:bg-zinc-800" />
        <div className="hidden items-center gap-1 md:flex">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            aria-current={active(href) ? "page" : undefined}
            className={cn(
              "relative flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors",
              active(href) ? "text-zinc-900 dark:text-white" : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white",
            )}
          >
            {active(href) && (
              <motion.span
                layoutId="nav-pill"
                className="absolute inset-0 rounded-full bg-zinc-100 dark:bg-zinc-800/80"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            <Icon className="relative size-4 lg:hidden" />
            <span className="relative hidden lg:inline">{label}</span>
          </Link>
        ))}
        </div>
        <div className="mx-1 hidden h-5 w-px bg-zinc-200 md:block dark:bg-zinc-800" />
        <div className="flex items-center gap-1">
        {HOSTED ? <SavePill status={saveStatus} /> : saveError && (
          <span title={saveError} className="mr-1 rounded-full bg-rose-500/10 px-2 py-0.5 text-[11px] font-medium text-rose-600 dark:text-rose-400">
            Not saved
          </span>
        )}
        <button
          onClick={() => window.dispatchEvent(new Event("pypath:palette"))}
          aria-label={`Search (${mod}+K)`}
          className="flex size-8 items-center justify-center gap-2 rounded-full text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 xl:w-auto xl:border xl:border-zinc-200 xl:bg-zinc-50/60 xl:pl-3 xl:pr-1.5 xl:hover:border-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white xl:dark:border-zinc-800 xl:dark:bg-zinc-900/40 xl:dark:hover:border-zinc-700"
        >
          <Search className="size-4 shrink-0" />
          <span className="hidden text-[13px] xl:inline">Search</span>
          <kbd className="hidden rounded-md border border-zinc-200 bg-white px-1.5 py-0.5 font-mono text-[10px] leading-none text-zinc-500 xl:inline dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
            {mod} K
          </kbd>
        </button>
        <ThemeToggle />
        {profile && (
          <button
            onClick={() => window.dispatchEvent(new Event("pypath:profiles"))}
            aria-label={`Profile: ${profile.title}. Switch profile`}
            title={`${profile.title} profile. Switch profile`}
            className="grid size-8 place-items-center rounded-full text-[15px] transition-transform hover:scale-110"
            style={{ background: `linear-gradient(135deg, ${profile.from}, ${profile.to})` }}
          >
            <span aria-hidden>{profile.emoji}</span>
          </button>
        )}
        <Link
          href="/settings"
          aria-label="Settings"
          className={cn(
            "grid size-8 place-items-center rounded-full transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800",
            active("/settings") ? "text-zinc-900 dark:text-white" : "text-zinc-500",
          )}
        >
          <Settings className="size-4" />
        </Link>
        </div>
      </motion.nav>
      <BottomNav active={active} />
    </div>
  );
}

type Status = ReturnType<typeof useApp>["saveStatus"];

function SavePill({ status }: { status: Status }) {
  let label = "";
  let title = "";
  let tone: "ok" | "warn" | "bad" = "ok";
  switch (status.kind) {
    case "saved-file":
      label = "Saved";
      title = `Saved to ${status.fileName} · ${relTime(status.at)}`;
      break;
    case "saving":
      label = "Saving…";
      title = "Writing your progress file";
      break;
    case "browser-only":
      label = "Browser only";
      title = "Saved in this browser only";
      tone = "warn";
      break;
    case "file-missing":
      label = "File missing";
      title = "Progress file missing, your progress is still saved in this browser";
      tone = "bad";
      break;
    case "permission":
      label = "Allow file";
      title = "PyPath needs permission to write your progress file";
      tone = "bad";
      break;
    case "error":
      label = "Not saved";
      title = status.message;
      tone = "bad";
      break;
    default:
      return null;
  }
  const color = {
    ok: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    warn: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    bad: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  }[tone];
  const dot = { ok: "bg-emerald-500", warn: "bg-amber-500", bad: "bg-rose-500" }[tone];
  return (
    <>
      <span title={title} className={cn("mr-1 hidden rounded-full px-2 py-0.5 text-[11px] font-medium sm:inline", color)}>
        {label}
      </span>
      <span title={`${label}: ${title}`} aria-label={label} className={cn("mx-1.5 size-2 rounded-full sm:hidden", dot)} />
    </>
  );
}

/** Phone navigation: a bottom tab bar (thumb reach), shown below the md breakpoint. */
function BottomNav({ active }: { active: (href: string) => boolean }) {
  return (
    <nav
      aria-label="Main"
      className="pointer-events-auto fixed inset-x-0 bottom-0 z-50 grid grid-cols-7 border-t border-zinc-200 bg-white/90 px-1 pt-1 backdrop-blur-xl md:hidden dark:border-zinc-800 dark:bg-zinc-950/90"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 4px)" }}
    >
      {links.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          aria-current={active(href) ? "page" : undefined}
          className={cn(
            "flex min-w-0 flex-col items-center gap-0.5 rounded-lg py-1.5 text-[10px] font-medium transition-colors",
            active(href) ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-500 dark:text-zinc-400",
          )}
        >
          <Icon className="size-[18px]" />
          <span className="max-w-full truncate">{label}</span>
        </Link>
      ))}
    </nav>
  );
}
