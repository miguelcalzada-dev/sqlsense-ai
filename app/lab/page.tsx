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
    <div className="mx-auto max-w-7xl px-4 py-10">
      <header className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-accent to-accent2 shadow-lg shadow-accent/20">
              <Beaker className="h-5 w-5 text-white" strokeWidth={2.4} />
            </span>
            <h1 className="text-[32px] font-bold tracking-tight">Laboratorio</h1>
          </div>
          <p className="mt-3 max-w-xl text-[15px] text-ink-sub">
            Escribe SQL y ejecútalo contra la base de datos del concesionario. La
            base de datos vive en tu navegador: reiníciala cuando quieras.
          </p>
        </div>
        <StatusBadges status={status} error={error} statementsRun={statementsRun} />
      </header>

      <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <section className="min-w-0 space-y-4">
          <div className="card overflow-hidden border-white/[0.06]">
            <div className="flex items-center gap-1 border-b border-white/[0.06] bg-white/[0.02] px-3 py-2">
              <TabButton
                active={tab === "editor"}
                onClick={() => setTab("editor")}
                icon={<Beaker className="h-3.5 w-3.5" />}
              >
                Editor SQL
              </TabButton>
              <TabButton
                active={tab === "ai"}
                onClick={() => setTab("ai")}
                icon={<Sparkles className="h-3.5 w-3.5" />}
              >
                Generar con IA
              </TabButton>
              <div className="ml-auto flex items-center gap-2 pr-1">
                <button
                  type="button"
                  onClick={() => void run()}
                  disabled={status !== "ready" || running}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-gradient-to-r from-accent to-accent2 px-4 text-[13px] font-semibold text-white ring-focus transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                >
                  {running ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Play className="h-3.5 w-3.5" fill="currentColor" />
                  )}
                  Ejecutar
                </button>
                <button
                  type="button"
                  onClick={() => void reset().catch(() => undefined)}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 text-[12px] font-medium text-ink-soft ring-focus hover:text-ink hover:border-white/20 transition-colors"
                  aria-label="Reiniciar base de datos"
                  title="Reiniciar base de datos"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {tab === "editor" ? (
              <div className="p-4">
                {status === "error" && error && (
                  <div className="mb-3 rounded-xl border border-accent3/20 bg-accent3/5 px-3 py-2 text-[13px] text-accent3">
                    SQLite no pudo iniciarse: {error}. Comprueba la conexión y pulsa reiniciar.
                  </div>
                )}
                <SqlEditor
                  ref={editorRef}
                  value={sql}
                  onChange={setSql}
                  onRun={() => void run()}
                  minHeight={220}
                />
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="text-[12px] text-ink-sub">Snippets:</span>
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
                <p className="mt-2 text-[12px] text-ink-sub">
                  Ctrl + Enter para ejecutar
                </p>
              </div>
            ) : (
              <div className="p-4">
                <NLLabPanel onUseSQL={setEditorSQL} />
              </div>
            )}
          </div>

          <div>
            <div className="mb-3 flex items-center gap-2 text-[14px] font-semibold text-ink-soft">
              <Database className="h-4 w-4" />
              Resultado
            </div>
            {!result ? (
              <div className="grid h-36 place-items-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] text-[14px] text-ink-sub">
                Ejecuta una consulta para ver el resultado aquí.
              </div>
            ) : (
              <ResultTable result={result} />
            )}
          </div>
        </section>

        <aside className="min-w-0 space-y-4">
          <SqlExplainPanel sql={sql} />

          <div className="card p-5 border-white/[0.06]">
            <div className="flex items-center gap-2">
              <ListTree className="h-4 w-4 text-accent2" />
              <h3 className="text-[15px] font-semibold">Esquema rápido</h3>
              <Link
                href="/data"
                className="ml-auto text-[12px] font-medium text-accent ring-focus rounded-md hover:underline"
              >
                Ver completo
              </Link>
            </div>
            <ul className="mt-4 space-y-2">
              {SCHEMA.map((t) => (
                <li
                  key={t.name}
                  className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 hover:border-white/10 transition-colors"
                >
                  <span
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[15px]"
                    style={{ background: `${t.color}1a` }}
                  >
                    {t.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="font-mono text-[13px] font-semibold">
                      {t.name}
                    </div>
                    <div className="truncate text-[12px] text-ink-sub">
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
        "inline-flex h-9 items-center gap-1.5 rounded-lg px-4 text-[13px] font-medium ring-focus transition-colors",
        active
          ? "bg-white/[0.08] text-ink border border-white/[0.08]"
          : "text-ink-sub hover:text-ink",
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
    <div className="flex items-center gap-2">
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium",
          ready
            ? "border-accent4/30 bg-accent4/10 text-accent4"
            : "border-white/10 bg-white/5 text-ink-sub",
        )}
      >
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            ready ? "bg-accent4" : "bg-ink-sub animate-pulse",
          )}
        />
        {ready ? "SQLite WASM listo" : status === "error" ? "SQLite no disponible" : "Cargando..."}
      </span>
      {status === "error" && error && (
        <span className="max-w-[240px] truncate text-[11px] text-accent3" title={error}>
          {error}
        </span>
      )}
      {ready && (
        <span className="pill text-ink-sub">
          {formatNumber(statementsRun)} consultas
        </span>
      )}
    </div>
  );
}
