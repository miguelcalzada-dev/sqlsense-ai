"use client";

import { useEffect, useRef, useState } from "react";
import {
  Beaker,
  Database,
  Loader2,
  Play,
  RotateCcw,
  Sparkles,
  ListTree,
} from "lucide-react";
import { executeWhenReady, useDatabase, type QueryResult } from "@/lib/db/sqlite";
import { SCHEMA } from "@/lib/db/schema";
import Link from "next/link";
import SqlEditor, { type SqlEditorHandle } from "@/components/sql/SqlEditor";
import ResultTable from "@/components/sql/ResultTable";
import NLLabPanel from "@/components/sql/NLLabPanel";
import SqlExplainPanel from "@/components/sql/SqlExplainPanel";
import { cn, formatNumber } from "@/lib/utils";

const SNIPPETS = [
  { label: "SELECT *", sql: "SELECT * FROM coches LIMIT 10;" },
  {
    label: "JOIN",
    sql: "SELECT c.modelo, m.nombre AS marca FROM coches c JOIN marcas m ON c.marca_id = m.id LIMIT 10;",
  },
  {
    label: "GROUP BY",
    sql: "SELECT m.nombre, COUNT(v.id) AS ventas FROM marcas m JOIN coches c ON c.marca_id = m.id JOIN ventas v ON v.coche_id = c.id GROUP BY m.nombre ORDER BY ventas DESC;",
  },
  {
    label: "WINDOW",
    sql: "SELECT v.id, cl.nombre, v.precio_venta, ROW_NUMBER() OVER (ORDER BY v.precio_venta DESC) AS rk FROM ventas v JOIN clientes cl ON v.cliente_id = cl.id LIMIT 10;",
  },
];

export default function LabPage() {
  const { init, status, error, reset, statementsRun } = useDatabase();
  const [sql, setSql] = useState(
    "SELECT c.modelo, m.nombre AS marca, c.color, c.precio\nFROM coches c JOIN marcas m ON c.marca_id = m.id\nORDER BY c.precio DESC LIMIT 10;",
  );
  const [result, setResult] = useState<QueryResult | { error: string } | null>(null);
  const [running, setRunning] = useState(false);
  const editorRef = useRef<SqlEditorHandle>(null);
  const [tab, setTab] = useState<"editor" | "ai">("editor");

  useEffect(() => {
    if (status === "idle") void init().catch(() => undefined);
  }, [status, init]);

  const run = async (code = sql) => {
    setRunning(true);
    try {
      const r = await executeWhenReady(code.trim());
      setResult(r);
    } finally {
      setTimeout(() => setRunning(false), 120);
    }
  };

  const setEditorSQL = (code: string) => {
    setSql(code);
    setTab("editor");
    void run(code);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <header className="mb-8 border-b-4 border-line pb-6">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center border-4 border-line bg-accent shadow-brutal">
            <Beaker className="h-6 w-6 text-white" strokeWidth={2.5} />
          </span>
          <h1 className="font-heading text-4xl uppercase">Laboratorio</h1>
        </div>
        <p className="mt-3 max-w-2xl font-mono text-xs uppercase tracking-wider text-sub">
          Escribe SQL y ejecútalo contra la base de datos del concesionario. La
          base de datos vive en tu navegador: reiníciala cuando quieras.
        </p>
        <div className="mt-4">
          <StatusBadges status={status} error={error} statementsRun={statementsRun} />
        </div>
      </header>

      <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <section className="min-w-0 space-y-6">
          <div className="card p-0 overflow-hidden">
            <div className="flex items-center gap-1 border-b-4 border-line bg-bg-soft px-3 py-2">
              <TabButton
                active={tab === "editor"}
                onClick={() => setTab("editor")}
                icon={<Beaker className="h-4 w-4" />}
              >
                Editor SQL
              </TabButton>
              <TabButton
                active={tab === "ai"}
                onClick={() => setTab("ai")}
                icon={<Sparkles className="h-4 w-4" />}
              >
                Generar con IA
              </TabButton>
              <div className="ml-auto flex items-center gap-2 pr-1">
                <button
                  type="button"
                  onClick={() => void run()}
                  disabled={status !== "ready" || running}
                  className="inline-flex h-10 items-center gap-2 border-4 border-line bg-accent px-4 font-mono text-xs font-bold uppercase tracking-wider text-white shadow-brutal-sm transition-all hover:bg-[#e63800] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-50"
                >
                  {running ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4" fill="currentColor" />
                  )}
                  Ejecutar
                </button>
                <button
                  type="button"
                  onClick={() => void reset().catch(() => undefined)}
                  className="inline-flex h-10 items-center gap-2 border-4 border-line bg-surface px-3 font-mono text-xs font-bold uppercase tracking-wider shadow-brutal-sm transition-all hover:bg-bg-soft active:shadow-none active:translate-x-0.5 active:translate-y-0.5"
                  aria-label="Reiniciar base de datos"
                  title="Reiniciar base de datos"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>
            </div>

            {tab === "editor" ? (
              <div className="p-5">
                {status === "error" && error && (
                  <div className="mb-4 border-4 border-accent-3 bg-accent-3/10 px-4 py-3 font-mono text-xs uppercase tracking-wider text-accent-3 shadow-brutal-sm">
                    SQLite no pudo iniciarse: {error}
                  </div>
                )}
                <SqlEditor
                  ref={editorRef}
                  value={sql}
                  onChange={setSql}
                  onRun={() => void run()}
                  minHeight={220}
                />
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold uppercase tracking-wider">Snippets:</span>
                  {SNIPPETS.map((s) => (
                    <button
                      key={s.label}
                      type="button"
                      onClick={() => {
                        setSql(s.sql);
                        void run(s.sql);
                      }}
                      className="chip"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
                <p className="mt-3 font-mono text-xs uppercase tracking-wider text-sub">
                  Ctrl + Enter para ejecutar
                </p>
              </div>
            ) : (
              <div className="p-5">
                <NLLabPanel onUseSQL={setEditorSQL} />
              </div>
            )}
          </div>

          <div>
            <div className="mb-3 flex items-center gap-2 font-mono text-sm font-bold uppercase tracking-wider">
              <Database className="h-4 w-4" />
              Resultado
            </div>
            {!result ? (
              <div className="grid h-40 place-items-center border-4 border-dashed border-line bg-bg-soft font-mono text-xs uppercase tracking-wider text-sub">
                Ejecuta una consulta para ver el resultado aquí.
              </div>
            ) : (
              <ResultTable result={result} />
            )}
          </div>
        </section>

        <aside className="min-w-0 space-y-6">
          <SqlExplainPanel sql={sql} />

          <div className="card p-5">
            <div className="flex items-center gap-2">
              <ListTree className="h-4 w-4" />
              <h3 className="font-heading text-lg uppercase">Esquema rápido</h3>
              <Link
                href="/data"
                className="ml-auto font-mono text-xs font-bold uppercase tracking-wider text-accent hover:underline"
              >
                Ver completo →
              </Link>
            </div>
            <ul className="mt-4 space-y-2">
              {SCHEMA.map((t) => (
                <li
                  key={t.name}
                  className="flex items-center gap-3 border-2 border-line bg-bg-soft px-3 py-2.5 shadow-brutal-sm transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal"
                >
                  <span
                    className="grid h-9 w-9 shrink-0 place-items-center border-2 border-line text-lg"
                    style={{ background: `${t.color}30` }}
                  >
                    {t.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="font-mono text-sm font-bold uppercase">
                      {t.name}
                    </div>
                    <div className="truncate font-mono text-xs text-sub">
                      {t.columns
                        .map((c) => c.name)
                        .slice(0, 4)
                        .join(", ")}
                      {t.columns.length > 4 ? ", ..." : ""}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-10 items-center gap-2 border-2 px-4 font-mono text-xs font-bold uppercase tracking-wider transition-all",
        active
          ? "border-line bg-surface shadow-brutal-sm"
          : "border-transparent hover:border-line hover:bg-surface/50",
      )}
    >
      {icon}
      {children}
    </button>
  );
}

function StatusBadges({
  status,
  error,
  statementsRun,
}: {
  status: string;
  error: string | null;
  statementsRun: number;
}) {
  const ready = status === "ready";
  return (
    <div className="flex items-center gap-3">
      <span
        className={cn(
          "inline-flex items-center gap-2 border-2 px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wider shadow-brutal-sm",
          ready
            ? "border-line bg-accent-4 text-white"
            : "border-line bg-bg-soft",
        )}
      >
        <span
          className={cn(
            "h-2 w-2",
            ready ? "bg-white" : "bg-sub animate-pulse",
          )}
        />
        {ready ? "SQLite WASM listo" : status === "error" ? "SQLite no disponible" : "Cargando..."}
      </span>
      {status === "error" && error && (
        <span className="max-w-[240px] truncate font-mono text-xs text-accent-3" title={error}>
          {error}
        </span>
      )}
      {ready && (
        <span className="pill">
          {formatNumber(statementsRun)} consultas
        </span>
      )}
    </div>
  );
}
