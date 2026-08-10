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
  color: string;
  isMoney?: boolean;
};

const CARDS: Card[] = [
  { key: "marcas", label: "Marcas", icon: Tags, color: "#2400ff" },
  { key: "coches", label: "Coches", icon: Boxes, color: "#ff3e00" },
  { key: "clientes", label: "Clientes", icon: Boxes, color: "#e60000" },
  { key: "ventas", label: "Ventas", icon: ShoppingCart, color: "#00994d" },
  { key: "ingresos", label: "Ingresos totales", icon: TrendingUp, color: "#ffb800", isMoney: true },
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
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {CARDS.map((c, i) => {
        const Icon = c.icon;
        const value = data[c.key] ?? null;
        return (
          <motion.div
            key={c.key}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="card p-5"
          >
            <div
              className="grid h-11 w-11 place-items-center border-2 border-line shadow-brutal-sm"
              style={{ background: `${c.color}25` }}
            >
              <Icon className="h-5 w-5" style={{ color: c.color }} />
            </div>
            <p className="mt-3 font-mono text-xs font-bold uppercase tracking-wider text-sub">
              {c.label}
            </p>
            <p className="mt-1 font-heading text-3xl tabular-nums">
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
