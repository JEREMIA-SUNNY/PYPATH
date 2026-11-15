"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState<boolean | null>(null);
  useEffect(() => setDark(document.documentElement.classList.contains("dark")), []);
  const toggle = () => {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("pypath-theme", next ? "dark" : "light");
    } catch {}
    setDark(next);
  };
  return (
    <button
      onClick={toggle}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      className="grid size-8 place-items-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white"
    >
      {dark === false ? <Moon className="size-4" /> : <Sun className="size-4" />}
    </button>
  );
}

export const themeScript = `(function(){try{var t=localStorage.getItem('pypath-theme');if(!t){t=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'}if(t==='dark'){document.documentElement.classList.add('dark')}}catch(e){document.documentElement.classList.add('dark')}})();`;
