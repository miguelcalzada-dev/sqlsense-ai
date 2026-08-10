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
  { key: "marcas", label: "Marcas", icon: Tags, rgb: "94,92,230" },
  { key: "coches", label: "Coches", icon: Boxes, rgb: "0,113,227" },
  { key: "clientes", label: "Clientes", icon: Boxes, rgb: "255,90,95" },
  { key: "ventas", label: "Ventas", icon: ShoppingCart, rgb: "50,215,170" },
  { key: "ingresos", label: "Ingresos totales", icon: TrendingUp, rgb: "255,159,10", isMoney: true },
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
            className="card p-4"
          >
            <div
              className="grid h-9 w-9 place-items-center rounded-xl"
              style={{ background: `rgba(${c.rgb},0.12)`, color: `rgba(${c.rgb},1)` }}
            >
              <Icon className="h-4.5 w-4.5" />
            </div>
            <p className="mt-3 text-[11px] font-medium uppercase tracking-wider text-ink-sub">
              {c.label}
            </p>
            <p className="mt-1 font-mono text-[22px] font-semibold tabular-nums text-ink">
              {value === null
                ? "—"
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
