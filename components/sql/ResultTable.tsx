"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowDownUp, ArrowUp, TriangleAlert } from "lucide-react";
import { formatDateTime, formatNumber, cn } from "@/lib/utils";
import type { QueryResult } from "@/lib/db/sqlite";

type Props = {
  result: QueryResult | { error: string };
  className?: string;
};

type SortDir = "asc" | "desc";

function renderCell(value: unknown): React.ReactNode {
  if (value === null) return <span className="text-sub/60 italic">NULL</span>;
  if (value === undefined) return <span className="text-sub/60">---</span>;
  if (typeof value === "number") {
    if (Number.isInteger(value)) return formatNumber(value);
    return value.toLocaleString("es-ES", { maximumFractionDigits: 4 });
  }
  if (typeof value === "string") {
    if (/^\d{4}-\d{2}-\d{2}/.test(value) && value.length <= 10) {
      return formatDateTime(value);
    }
    if (/^\d{4}-\d{2}-\d{2}T/.test(value)) {
      const d = new Date(value);
      if (!Number.isNaN(d.getTime())) return formatDateTime(d);
    }
    if (/^\d+\.\d+$/.test(value)) return formatNumber(Number(value));
    if (/^-?\d+$/.test(value) && value.length < 12) return formatNumber(Number(value));
    return value;
  }
  if (typeof value === "bigint") return formatNumber(Number(value));
  if (value instanceof Uint8Array) return `[BLOB ${value.length} B]`;
  return String(value);
}

function isNumericColumn(rows: unknown[][], colIndex: number): boolean {
  let numeric = 0;
  let total = 0;
  for (const r of rows) {
    if (r[colIndex] === null || r[colIndex] === undefined) continue;
    total++;
    if (typeof r[colIndex] === "number") numeric++;
  }
  return total > 0 && numeric / total > 0.6;
}

export default function ResultTable({ result, className }: Props) {
  const [sort, setSort] = useState<{ idx: number; dir: SortDir } | null>(null);

  const sortedRows = useMemo(() => {
    if ("error" in result) return [];
    if (!sort) return result.rows;
    const numeric = isNumericColumn(result.rows, sort.idx);
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...result.rows].sort((a, b) => {
      const av = a[sort.idx];
      const bv = b[sort.idx];
      if (av === null) return 1;
      if (bv === null) return -1;
      if (numeric) return ((av as number) - (bv as number)) * dir;
      return String(av).localeCompare(String(bv), "es") * dir;
    });
  }, [result, sort]);

  if ("error" in result) {
    return (
      <div className="border-4 border-accent-3 bg-accent-3/10 px-4 py-3 shadow-brutal-sm">
        <div className="flex items-center gap-2">
          <TriangleAlert className="h-4 w-4 shrink-0" />
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-accent-3">Error SQL</span>
        </div>
        <pre className="mt-2 whitespace-pre-wrap font-mono text-xs text-accent-3/90">
          {result.error}
        </pre>
      </div>
    );
  }

  if (!result.columns.length) {
    return (
      <div className="grid place-items-center border-4 border-dashed border-line bg-bg-soft px-4 py-10 text-center shadow-brutal-sm">
        <p className="font-mono text-xs uppercase tracking-wider text-sub">
          Consulta ejecutada --- sin filas que mostrar
        </p>
        {result.rowsAffected > 0 && (
          <p className="mt-1 font-mono text-xs text-sub/70">
            {formatNumber(result.rowsAffected)} fila(s) afectada(s)
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "overflow-hidden border-4 border-line bg-surface shadow-brutal",
        className,
      )}
    >
      <div className="max-h-[460px] overflow-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="sticky top-0 z-10 bg-bg-soft border-b-4 border-line">
            <tr>
              {result.columns.map((c, i) => {
                const active = sort?.idx === i;
                const numeric = isNumericColumn(result.rows, i);
                return (
                  <th
                    key={i}
                    onClick={() =>
                      setSort((s) => {
                        if (s?.idx !== i) return { idx: i, dir: "asc" };
                        if (s.dir === "asc") return { idx: i, dir: "desc" };
                        return null;
                      })
                    }
                    className={cn(
                      "group cursor-pointer select-none border-r-2 border-line px-3 py-2.5 font-mono text-xs font-bold uppercase tracking-wider transition-colors hover:bg-bg-tertiary",
                      numeric ? "text-right" : "text-left",
                      i === 0 && "pl-4",
                      i === result.columns.length - 1 && "border-r-0",
                    )}
                  >
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5",
                        numeric && "flex-row-reverse",
                      )}
                    >
                      <span>{c}</span>
                      {active ? (
                        sort?.dir === "asc" ? (
                          <ArrowUp className="h-3 w-3 text-accent" />
                        ) : (
                          <ArrowDown className="h-3 w-3 text-accent" />
                        )
                      ) : (
                        <ArrowDownUp className="h-3 w-3 text-sub/30 opacity-0 transition-opacity group-hover:opacity-100" />
                      )}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row, ri) => (
              <tr
                key={ri}
                className={cn(
                  "transition-colors hover:bg-bg-soft border-b-2 border-line/30",
                  ri % 2 === 1 && "bg-bg-soft/50",
                )}
              >
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    className={cn(
                      "border-r-2 border-line/20 px-3 py-2 align-top font-body text-sm",
                      ci === 0 && "pl-4",
                      ci === row.length - 1 && "border-r-0",
                      isNumericColumn(result.rows, ci) && "text-right font-mono tabular-nums",
                    )}
                  >
                    {renderCell(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between gap-2 border-t-4 border-line bg-bg-soft px-4 py-2 font-mono text-xs uppercase tracking-wider">
        <span>
          {formatNumber(result.rows.length)} fila(s) ---{" "}
          {result.columns.length} columna(s)
        </span>
        <span className="tabular-nums">{result.ms.toFixed(2)} ms</span>
      </div>
    </div>
  );
}
