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
  const [result, setResult] = useState<QueryResult | { error: string } | null>(
    null,
  );
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
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-accent to-accent2 shadow-md">
              <Beaker className="h-5 w-5 text-white" strokeWidth={2.4} />
            </span>
            <h1 className="text-[28px] font-semibold tracking-tight">Laboratorio</h1>
          </div>
          <p className="mt-2 max-w-xl text-[14px] text-ink-sub">
            Escribe SQL y ejecútalo contra la base de datos del concesionario. La
            base de datos vive en tu navegador: reiníciala cuando quieras.
          </p>
        </div>
         <StatusBadges status={status} error={error} statementsRun={statementsRun} />
      </header>

      <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <section className="min-w-0 space-y-3">
          <div className="card overflow-hidden">
            <div className="flex items-center gap-1 border-b border-line-soft bg-bg-soft/40 px-2 py-1.5">
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
              <div className="ml-auto flex items-center gap-1.5 pr-1">
                <button
                  type="button"
                  onClick={() => void run()}
                  disabled={status !== "ready" || running}
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-ink px-3 text-[12.5px] font-semibold text-[rgb(var(--bg))] ring-focus transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-50"
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
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line-soft bg-surface px-2.5 text-[12px] font-medium text-ink-soft ring-focus hover:text-ink hover:border-line"
                  aria-label="Reiniciar base de datos"
                  title="Reiniciar base de datos"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

              {tab === "editor" ? (
              <div className="p-3">
                {status === "error" && error && (
                  <div className="mb-3 rounded-xl border border-accent3/20 bg-accent3/5 px-3 py-2 text-[12px] text-accent3">
                    SQLite no pudo iniciarse: {error}. Comprueba la conexión y pulsa reiniciar.
                  </div>
                )}
                <SqlEditor
                  ref={editorRef}
                  value={sql}
                  onChange={setSql}
                  onRun={() => void run()}
                  minHeight={200}
                />
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] text-ink-sub">Snippets:</span>
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
                <p className="mt-2 text-[11.5px] text-ink-sub">
                  ⌘/Ctrl + Enter para ejecutar
                </p>
              </div>
            ) : (
              <div className="p-3">
                <NLLabPanel onUseSQL={setEditorSQL} />
              </div>
            )}
          </div>

          <div>
            <div className="mb-2 flex items-center gap-2 text-[13px] font-medium text-ink-soft">
              <Database className="h-3.5 w-3.5" />
              Resultado
            </div>
            {!result ? (
              <div className="grid h-32 place-items-center rounded-apple border border-dashed border-line bg-bg-soft/40 text-[13px] text-ink-sub">
                Ejecuta una consulta para ver el resultado aquí.
              </div>
            ) : (
              <ResultTable result={result} />
            )}
          </div>
        </section>

        <aside className="min-w-0 space-y-3">
          <SqlExplainPanel sql={sql} />

          <div className="card p-4">
            <div className="flex items-center gap-2">
              <ListTree className="h-4 w-4 text-accent2" />
              <h3 className="text-[14px] font-semibold">Esquema rápido</h3>
              <Link
                href="/data"
                className="ml-auto text-[12px] font-medium text-accent ring-focus rounded-md"
              >
                Ver completo
              </Link>
            </div>
            <ul className="mt-3 space-y-2">
              {SCHEMA.map((t) => (
                <li
                  key={t.name}
                  className="flex items-center gap-2.5 rounded-xl border border-line-soft bg-bg-soft/40 px-3 py-2"
                >
                  <span
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-[14px]"
                    style={{ background: `${t.color}1a` }}
                  >
                    {t.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="font-mono text-[12.5px] font-semibold">
                      {t.name}
                    </div>
                    <div className="truncate text-[11.5px] text-ink-sub">
                      {t.columns
                        .map((c) => c.name)
                        .slice(0, 4)
                        .join(", ")}
                      {t.columns.length > 4 ? ", …" : ""}
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
        "inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-[12.5px] font-medium ring-focus transition-colors",
        active
          ? "bg-surface text-ink shadow-sm border border-line-soft"
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
          "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11.5px] font-medium",
          ready
            ? "border-accent4/30 bg-accent4/10 text-accent4"
            : "border-line bg-bg-soft text-ink-sub",
        )}
      >
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            ready ? "bg-accent4" : "bg-ink-sub animate-pulse",
          )}
        />
        {ready ? "SQLite WASM listo" : status === "error" ? "SQLite no disponible" : "Cargando…"}
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
