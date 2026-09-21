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
    <div className="grid min-w-0 gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="card p-3">
        <div className="flex items-center gap-2 px-2 py-2">
          <Database className="h-4 w-4" />
          <span className="font-mono text-sm font-bold uppercase tracking-wider">Tablas</span>
        </div>
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sub" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filtrar tablas..."
            className="input-base w-full pl-10 pr-3 py-2.5 font-mono text-xs"
          />
        </div>
        <ul className="mt-3 space-y-1">
          {filtered.map((t) => (
            <li key={t.name}>
              <button
                type="button"
                onClick={() => setActive(t.name)}
                className={cn(
                  "flex w-full items-center gap-2.5 border-2 px-2.5 py-2.5 text-left font-mono text-xs font-bold uppercase tracking-wider transition-all",
                  active === t.name
                    ? "border-line bg-bg-soft shadow-brutal-sm"
                    : "border-transparent hover:border-line hover:bg-bg-soft/50",
                )}
              >
                <span
                  className="grid h-8 w-8 shrink-0 place-items-center border-2 border-line text-sm"
                  style={{ background: `${t.color}30` }}
                >
                  {t.emoji}
                </span>
                <span className="flex-1">
                  <span className="block font-bold">{t.name}</span>
                  <span className="block text-sub font-normal normal-case tracking-normal">{t.columns.length} columnas</span>
                </span>
                <ChevronRight className="h-3.5 w-3.5 opacity-40" />
              </button>
            </li>
          ))}
          {!filtered.length && (
            <li className="px-2 py-3 text-center font-mono text-xs uppercase tracking-wider text-sub">
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
    <div className="space-y-6">
      <div className="card overflow-hidden">
        <div className="flex items-start gap-4 border-b-4 border-line p-5">
          <span
            className="grid h-14 w-14 shrink-0 place-items-center border-4 border-line text-2xl shadow-brutal-sm"
            style={{ background: `${table.color}30` }}
          >
            {table.emoji}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-heading text-xl uppercase">{table.label}</h3>
              <code className="border-2 border-line bg-bg-soft px-2 py-0.5 font-mono text-xs font-bold">
                {table.name}
              </code>
            </div>
            <p className="mt-1 font-body text-sm text-sub">{table.desc}</p>
          </div>
          <div className="text-right">
            <div className="font-mono text-xs font-bold uppercase tracking-wider text-sub">
              Filas
            </div>
            <div className="font-heading text-3xl tabular-nums">
              {count === null ? "---" : formatNumber(count)}
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3">
          {table.columns.map((c, i) => (
            <div
              key={c.name}
              className={cn(
                "border-b-2 border-line p-4",
                (i + 1) % 3 !== 0 && "lg:border-r-2",
                (i + 1) % 2 !== 0 && "sm:border-r-2 lg:border-r-0",
              )}
            >
              <div className="flex items-center gap-2">
                {c.pk ? (
                  <Key className="h-3.5 w-3.5 text-accent-5" />
                ) : c.fk ? (
                  <Link2 className="h-3.5 w-3.5 text-accent-2" />
                ) : (
                  <span className="ml-1 h-2 w-2 bg-sub/40" />
                )}
                <code className="font-mono text-sm font-bold">
                  {c.name}
                </code>
                <span className="ml-auto font-mono text-xs font-bold uppercase text-sub">
                  {c.type}
                </span>
              </div>
              <p className="mt-2 font-body text-xs leading-snug text-sub">
                {c.desc}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {c.pk && (
                  <span className="pill !bg-accent-5 !text-white !border-line">
                    PRIMARY KEY
                  </span>
                )}
                {c.fk && (
                  <span className="pill !bg-accent-2 !text-white !border-line">
                    {c.fk.table}.{c.fk.column}
                  </span>
                )}
                {c.notNull && !c.pk && (
                  <span className="pill">NOT NULL</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b-4 border-line px-4 py-3 bg-bg-soft">
          <div className="flex items-center gap-2">
            <Table2 className="h-4 w-4" />
            <span className="font-mono text-sm font-bold uppercase tracking-wider">Vista previa</span>
            <span className="font-mono text-xs text-sub">50 primeras filas</span>
          </div>
          <Link prefetch={false}
            href="/lab"
            className="font-mono text-xs font-bold uppercase tracking-wider text-accent hover:underline"
          >
            Abrir en Laboratorio →
          </Link>
        </div>
        <div className="p-4">
          {!preview ? (
            <div className="grid h-28 place-items-center">
              <RefreshCw className="h-5 w-5 animate-spin text-sub" />
            </div>
          ) : (
            <ResultTable result={preview} />
          )}
        </div>
      </div>
    </div>
  );
}
