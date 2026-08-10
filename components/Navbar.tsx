"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Beaker,
  BookOpen,
  Database,
  Trophy,
  Menu,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled ? "py-2" : "py-3",
      )}
    >
      <div className="mx-auto max-w-7xl px-4">
        <nav
          className={cn(
            "flex items-center justify-between rounded-2xl px-4 py-2.5 transition-all duration-300",
            scrolled
              ? "glass shadow-lg"
              : "border border-white/5 bg-surface/50 backdrop-blur-sm",
          )}
        >
          <Link href="/" className="group flex items-center gap-2.5 ring-focus rounded-full">
            <BrandMark />
            <span className="text-[15px] font-bold tracking-tight text-ink">
              SQLSense
              <span className="text-gradient">.</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {NAV.map((item) => {
              const active = pathname?.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors ring-focus",
                    active
                      ? "text-ink"
                      : "text-ink-sub hover:text-ink",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 -z-10 rounded-full bg-white/[0.06] border border-white/[0.08]"
                      transition={{ type: "spring", bounce: 0.18, duration: 0.5 }}
                    />
                  )}
                  <Icon className="h-3.5 w-3.5 opacity-70" strokeWidth={2.2} />
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/lab"
              className="hidden sm:inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-accent to-accent2 px-4 py-2 text-[13px] font-semibold text-white ring-focus hover:opacity-90 transition-opacity"
            >
              Abrir laboratorio
            </Link>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label="Menú"
              className="md:hidden grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/5 ring-focus"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </nav>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="md:hidden mt-2 card p-2"
            >
              {NAV.map((item) => {
                const Icon = item.icon;
                const active = pathname?.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ring-focus",
                      active ? "bg-white/[0.06] text-ink" : "text-ink-soft",
                    )}
                  >
                    <Icon className="h-4 w-4 opacity-80" />
                    {item.label}
                  </Link>
                );
              })}
              <Link
                href="/lab"
                className="mt-1 flex items-center justify-center rounded-xl bg-gradient-to-r from-accent to-accent2 px-3 py-2.5 text-sm font-semibold text-white"
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
