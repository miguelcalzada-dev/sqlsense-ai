"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Database,
  Key,
  Link2,
  RefreshCw,
  Search,
  Table2,
} from "lucide-react";
import { SCHEMA, type Table } from "@/lib/db/schema";
import { useDatabase, type QueryResult } from "@/lib/db/sqlite";
import { cn, formatNumber } from "@/lib/utils";
import ResultTable from "./ResultTable";

export default function SchemaViewer() {
  const [active, setActive] = useState<string>(SCHEMA[0].name);
  const [rows, setRows] = useState<QueryResult | { error: string } | null>(null);
  const [query, setQuery] = useState("");
  const { init, status, db, execute } = useDatabase();

  useEffect(() => {
    if (status === "idle") void init().catch(() => undefined);
  }, [status, init]);

  const activeTable = useMemo(
    () => SCHEMA.find((t) => t.name === active) ?? SCHEMA[0],
    [active],
  );

  useEffect(() => {
    if (status !== "ready" || !db) return;
    setRows(execute(`SELECT COUNT(*) AS count FROM ${activeTable.name};`));
    setQuery("");
  }, [activeTable, status, db, execute]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SCHEMA;
    return SCHEMA.filter(
      (t) =>
        t.name.includes(q) ||
        t.label.toLowerCase().includes(q) ||
        t.columns.some((c) => c.name.toLowerCase().includes(q)),
    );
  }, [query]);

  const count = rows && "columns" in rows ? Number(rows.rows[0]?.[0] ?? 0) : null;

  return (
    <div className="grid min-w-0 gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="card p-3 border-white/[0.06]">
        <div className="flex items-center gap-2 px-2 py-2">
          <Database className="h-4 w-4 text-accent" />
          <span className="text-[14px] font-semibold">Tablas</span>
        </div>
        <div className="relative mt-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-sub" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filtrar tablas..."
            className="input-base w-full pl-9 pr-3 py-2.5 text-[13px]"
          />
        </div>
        <ul className="mt-2 space-y-1">
          {filtered.map((t) => (
            <li key={t.name}>
              <button
                type="button"
                onClick={() => setActive(t.name)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-left text-[13px] ring-focus transition-colors",
                  active === t.name
                    ? "bg-white/[0.06] text-ink"
                    : "text-ink-soft hover:bg-white/[0.04] hover:text-ink",
                )}
              >
                <span
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[15px]"
                  style={{ background: `${t.color}1a` }}
                >
                  {t.emoji}
                </span>
                <span className="flex-1">
                  <span className="block font-mono text-[13px] font-medium">{t.name}</span>
                  <span className="block text-[11px] text-ink-sub">{t.columns.length} columnas</span>
                </span>
                <ChevronRight className="h-3.5 w-3.5 opacity-40" />
              </button>
            </li>
          ))}
          {!filtered.length && (
            <li className="px-2 py-3 text-center text-[13px] text-ink-sub">
              Sin coincidencias
            </li>
          )}
        </ul>
      </aside>

      <TableDetail table={activeTable} count={count} runSQL={execute} status={status} />
    </div>
  );
}

function TableDetail({
  table,
  count,
  runSQL,
  status,
}: {
  table: Table;
  count: number | null;
  runSQL: (sql: string) => QueryResult | { error: string };
  status: string;
}) {
  const [preview, setPreview] = useState<QueryResult | { error: string } | null>(null);

  useEffect(() => {
    if (status !== "ready") return;
    setPreview(runSQL(`SELECT * FROM ${table.name} LIMIT 50;`));
  }, [table.name, status, runSQL]);

  return (
    <div className="space-y-5">
      <div className="card overflow-hidden border-white/[0.06]">
        <div className="flex items-start gap-3 border-b border-white/[0.06] p-5">
          <span
            className="grid h-12 w-12 shrink-0 place-items-center rounded-xl text-[22px]"
            style={{ background: `${table.color}1a` }}
          >
            {table.emoji}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-[16px] font-semibold">{table.label}</h3>
              <code className="rounded-md bg-white/[0.06] px-2 py-0.5 font-mono text-[12px] text-ink-sub">
                {table.name}
              </code>
            </div>
            <p className="mt-1 text-[13px] text-ink-sub">{table.desc}</p>
          </div>
          <div className="text-right">
            <div className="text-[11px] uppercase tracking-wider text-ink-sub">
              Filas
            </div>
            <div className="font-mono text-[20px] font-bold tabular-nums text-ink">
              {count === null ? "---" : formatNumber(count)}
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3">
          {table.columns.map((c, i) => (
            <div
              key={c.name}
              className={cn(
                "border-b border-white/[0.06] p-4",
                (i + 1) % 3 !== 0 && "lg:border-r",
                (i + 1) % 2 !== 0 && "sm:border-r lg:border-r-0",
              )}
            >
              <div className="flex items-center gap-2">
                {c.pk ? (
                  <Key className="h-3.5 w-3.5 text-accent5" />
                ) : c.fk ? (
                  <Link2 className="h-3.5 w-3.5 text-accent2" />
                ) : (
                  <span className="ml-1 h-1.5 w-1.5 rounded-full bg-ink-sub/40" />
                )}
                <code className="font-mono text-[13px] font-semibold text-ink">
                  {c.name}
                </code>
                <span className="ml-auto font-mono text-[11px] uppercase text-ink-sub">
                  {c.type}
                </span>
              </div>
              <p className="mt-2 text-[12px] leading-snug text-ink-sub">
                {c.desc}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {c.pk && (
                  <span className="chip border-accent5/20 bg-accent5/10 text-accent5">
                    PRIMARY KEY
                  </span>
                )}
                {c.fk && (
                  <span className="chip border-accent2/20 bg-accent2/10 text-accent2">
                    {c.fk.table}.{c.fk.column}
                  </span>
                )}
                {c.notNull && !c.pk && (
                  <span className="pill text-[10px] text-ink-sub">NOT NULL</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden border-white/[0.06]">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
          <div className="flex items-center gap-2">
            <Table2 className="h-4 w-4 text-accent" />
            <span className="text-[14px] font-semibold">Vista previa</span>
            <span className="text-[12px] text-ink-sub">50 primeras filas</span>
          </div>
          <Link
            href="/lab"
            className="inline-flex items-center gap-1 text-[13px] font-medium text-accent ring-focus rounded-md hover:underline"
          >
            Abrir en Laboratorio
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="p-4">
          {!preview ? (
            <div className="grid h-28 place-items-center">
              <RefreshCw className="h-4 w-4 animate-spin text-ink-sub" />
            </div>
          ) : (
            <ResultTable result={preview} />
          )}
        </div>
      </div>
    </div>
  );
}
