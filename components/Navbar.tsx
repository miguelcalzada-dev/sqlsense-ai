"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Beaker, BookOpen, Database, Trophy, Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import BrandMark from "./BrandMark";

const NAV = [
  { href: "/lab", label: "Laboratorio", icon: Beaker },
  { href: "/data", label: "Datos", icon: Database },
  { href: "/challenges", label: "Retos", icon: Trophy },
  { href: "/guide", label: "Guía", icon: BookOpen },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b-4 border-line bg-bg">
      <div className="mx-auto max-w-7xl px-4">
        <nav className="flex h-16 items-center justify-between">
          <Link prefetch={false} href="/" className="flex items-center gap-3 ring-focus">
            <BrandMark />
            <span className="font-heading text-2xl uppercase tracking-tight">
              SQLSense<span className="text-gradient">.</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {NAV.map((item) => {
              const active = pathname?.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link prefetch={false}
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 border-2 px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wider transition-all",
                    active
                      ? "border-line bg-surface shadow-brutal-sm"
                      : "border-transparent hover:border-line hover:bg-surface",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" strokeWidth={2.5} />
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <Link prefetch={false}
              href="/lab"
              className="hidden sm:inline-flex brutal-btn brutal-btn-primary !py-2 !px-4 !text-xs"
            >
              Abrir laboratorio
            </Link>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label="Menú"
              className="md:hidden grid h-10 w-10 place-items-center border-2 border-line bg-surface shadow-brutal-sm"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </nav>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t-2 border-line pb-3"
            >
              {NAV.map((item) => {
                const Icon = item.icon;
                const active = pathname?.startsWith(item.href);
                return (
                  <Link prefetch={false}
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 font-mono text-sm font-bold uppercase tracking-wider border-b border-line/20",
                      active ? "bg-surface" : "hover:bg-surface/50",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
              <Link prefetch={false}
                href="/lab"
                onClick={() => setOpen(false)}
                className="mt-3 flex items-center justify-center brutal-btn brutal-btn-primary !text-xs"
              >
                Abrir laboratorio
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
