"use client";

import { useEffect, useMemo } from "react";
import { Boxes, ShoppingCart, Tags, TrendingUp } from "lucide-react";
import { useDatabase, type QueryResult } from "@/lib/db/sqlite";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { motion } from "framer-motion";

type Card = {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  rgb: string;
  isMoney?: boolean;
};

const CARDS: Card[] = [
  { key: "marcas", label: "Marcas", icon: Tags, rgb: "139,92,246" },
  { key: "coches", label: "Coches", icon: Boxes, rgb: "6,182,212" },
  { key: "clientes", label: "Clientes", icon: Boxes, rgb: "244,63,94" },
  { key: "ventas", label: "Ventas", icon: ShoppingCart, rgb: "16,185,129" },
  { key: "ingresos", label: "Ingresos totales", icon: TrendingUp, rgb: "245,158,11", isMoney: true },
];

export default function StatCards() {
  const { init, status, execute } = useDatabase();

  useEffect(() => {
    if (status === "idle") void init().catch(() => undefined);
  }, [status, init]);

  const ready = status === "ready";

  const data = useMemo(() => {
    if (!ready) return {};
    const out: Record<string, number> = {};
    for (const c of CARDS) {
      let r: QueryResult | { error: string };
      if (c.key === "ingresos") {
        r = execute("SELECT COALESCE(SUM(precio_venta), 0) FROM ventas;");
      } else {
        r = execute(`SELECT COUNT(*) FROM ${c.key};`);
      }
      if ("columns" in r && r.rows[0]) {
        out[c.key] = Number(r.rows[0][0]) || 0;
      } else {
        out[c.key] = 0;
      }
    }
    return out;
  }, [ready, execute]);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {CARDS.map((c, i) => {
        const Icon = c.icon;
        const value = data[c.key] ?? null;
        return (
          <motion.div
            key={c.key}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="card p-5 border-white/[0.06]"
          >
            <div
              className="grid h-10 w-10 place-items-center rounded-xl"
              style={{ background: `rgba(${c.rgb},0.12)`, color: `rgba(${c.rgb},1)` }}
            >
              <Icon className="h-5 w-5" />
            </div>
            <p className="mt-3 text-[11px] font-medium uppercase tracking-wider text-ink-sub">
              {c.label}
            </p>
            <p className="mt-1 font-mono text-[24px] font-bold tabular-nums text-ink">
              {value === null
                ? "---"
                : c.isMoney
                  ? formatCurrency(value)
                  : formatNumber(value)}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}
