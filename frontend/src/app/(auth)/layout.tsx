"use client";

import React from "react";
import Link from "next/link";
import { Terminal } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme, setTheme } = useTheme();

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-x-hidden bg-background">
      {/* Background Gradient Mesh */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40 dark:opacity-75">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-violet-600/30 blur-[120px] dark:bg-violet-600/15" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/30 blur-[120px] dark:bg-indigo-600/15" />
      </div>

      {/* Header Bar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group select-none">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-violet-500/25 group-hover:scale-105 transition-transform">
            <Terminal className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-violet-600 via-indigo-600 to-fuchsia-600 bg-clip-text text-transparent dark:from-violet-400 dark:via-indigo-400 dark:to-fuchsia-400">
            AI Workspace
          </span>
        </Link>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="rounded-xl border hover:bg-muted"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-violet-400" />
        </Button>
      </header>

      {/* Children Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-6 my-4">
        <div className="w-full max-w-md animate-slide-up">
          {children}
        </div>
      </main>

      {/* Footer Bar */}
      <footer className="relative z-10 w-full text-center py-6 text-xs text-muted-foreground border-t bg-card/10 dark:bg-transparent">
        <p>© 2026 AI Workspace Platform. Built with Next.js 15. All rights reserved.</p>
      </footer>
    </div>
  );
}
