"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  ChevronRight,
  Lightbulb,
  Loader2,
  Play,
  RefreshCw,
  Trophy,
  XCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CHALLENGES,
  DIFFICULTY_META,
  DIFFICULTY_ORDER,
  type Challenge,
  type Difficulty,
} from "@/lib/challenges";
import { executeWhenReady, useDatabase, type QueryResult } from "@/lib/db/sqlite";
import { cn } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import SqlEditor, { type SqlEditorHandle } from "@/components/sql/SqlEditor";
import ResultTable from "@/components/sql/ResultTable";

const STORAGE_KEY = "sqlsense-challenges-completed";

function compareRows(a: unknown[][], b: unknown[][]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i].length !== b[i].length) return false;
    for (let j = 0; j < a[i].length; j++) {
      const x = a[i][j];
      const y = b[i][j];
      if (String(x ?? "") !== String(y ?? "")) return false;
    }
  }
  return true;
}

function unorderedEqual(a: unknown[][], b: unknown[][]): boolean {
  if (a.length !== b.length) return false;
  const sa = a.map((r) => r.map((v) => String(v ?? "")).join("\u0001")).sort();
  const sb = b.map((r) => r.map((v) => String(v ?? "")).join("\u0001")).sort();
  return sa.join("\u0002") === sb.join("\u0002");
}

function validateChallenge(
  c: Challenge,
  user: QueryResult | { error: string },
  canonical: QueryResult | { error: string },
): { ok: boolean; reason: string } {
  if ("error" in user) return { ok: false, reason: user.error };
  if ("error" in canonical) return { ok: false, reason: "No se pudo validar (canon falló)." };

  switch (c.tolerance) {
    case "exactOrdered":
      return {
        ok: compareRows(user.rows, canonical.rows),
        reason: compareRows(user.rows, canonical.rows)
          ? "Resultado exacto (mismo orden)."
          : "El resultado no coincide en orden o valores.",
      };
    case "exactUnordered":
      return {
        ok: unorderedEqual(user.rows, canonical.rows),
        reason: unorderedEqual(user.rows, canonical.rows)
          ? "Resultado exacto (cualquier orden)."
          : "El contenido no coincide.",
      };
    case "rowsCount":
      return {
        ok: user.rows.length === canonical.rows.length && user.rows.length > 0,
        reason:
          user.rows.length === canonical.rows.length
            ? "Número de filas correcto."
            : `Esperabas ${canonical.rows.length} fila(s), obtuviste ${user.rows.length}.`,
      };
    case "rowsContain":
      return {
        ok: unorderedEqual(
          canonical.rows,
          user.rows.slice(0, canonical.rows.length),
        ),
        reason: "Faltan filas esperadas.",
      };
    default:
      return { ok: false, reason: "Tipo de validación no soportado." };
  }
}

function loadCompleted(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function saveCompleted(set: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
  } catch {
    /* ignore */
  }
}

export default function ChallengesPage() {
  const { init, status } = useDatabase();
  const [activeDiff, setActiveDiff] = useState<Difficulty>("Principiante");
  const [active, setActive] = useState<Challenge>(CHALLENGES[0]);
  const [sql, setSql] = useState(CHALLENGES[0].starterCode);
  const [result, setResult] = useState<QueryResult | { error: string } | null>(null);
  const [, setCanonical] = useState<QueryResult | { error: string } | null>(null);
  const [verdict, setVerdict] = useState<{ ok: boolean; reason: string } | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const editorRef = useRef<SqlEditorHandle>(null);

  useEffect(() => {
    setCompleted(loadCompleted());
  }, []);

  useEffect(() => {
    if (status === "idle") void init().catch(() => undefined);
  }, [status, init]);

  const grouped = useMemo(() => {
    const acc: Record<Difficulty, Challenge[]> = {
      Principiante: [],
      Intermedio: [],
      Avanzado: [],
      Experto: [],
    };
    for (const c of CHALLENGES) acc[c.difficulty].push(c);
    return acc;
  }, []);

  const onSelect = (c: Challenge) => {
    setActive(c);
    setSql(c.starterCode);
    setResult(null);
    setCanonical(null);
    setVerdict(null);
    setShowHint(false);
  };

  const run = useCallback(async (code: string) => {
    setResult(await executeWhenReady(code));
  }, []);

  const validate = useCallback(async () => {
    const userRes = await executeWhenReady(sql.trim());
    setResult(userRes);
    const canonRes = await executeWhenReady(active.canonicalSQL);
    setCanonical(canonRes);
    if ("error" in canonRes) {
      setVerdict({ ok: false, reason: "No se pudo generar la solución canónica." });
      return;
    }
    const v = validateChallenge(active, userRes, canonRes);
    setVerdict(v);
    if (v.ok) {
      setCompleted((prev) => {
        const next = new Set(prev);
        next.add(active.id);
        saveCompleted(next);
        return next;
      });
    }
  }, [active, sql]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-6">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-accent3 to-accent5 shadow-md">
            <Trophy className="h-5 w-5 text-white" strokeWidth={2.4} />
          </span>
          <h1 className="text-[28px] font-semibold tracking-tight">Retos</h1>
        </div>
        <p className="mt-2 max-w-2xl text-[14px] text-ink-sub">
          Practica SQL con{" "}
          <span className="font-medium text-ink">{CHALLENGES.length} retos</span>{" "}
          divididos en cuatro niveles. La validación es automática: el sistema
          ejecuta tu consulta y la compara con la solución canónica.
        </p>
        <div className="mt-3 text-[12.5px] text-ink-sub">
          Completados: <span className="font-semibold text-ink">{completed.size}</span> / {CHALLENGES.length}
        </div>
      </header>

      <div className="mb-5 flex flex-wrap gap-1.5">
        {DIFFICULTY_ORDER.map((d) => {
          const meta = DIFFICULTY_META[d];
          const count = grouped[d].length;
          const done = grouped[d].filter((c) => completed.has(c.id)).length;
          return (
            <button
              key={d}
              type="button"
              onClick={() => setActiveDiff(d)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[12.5px] font-medium ring-focus transition-colors",
                activeDiff === d
                  ? "border-transparent text-ink shadow-sm"
                  : "border-line-soft bg-surface text-ink-sub hover:text-ink",
              )}
              style={
                activeDiff === d
                  ? {
                      background: `rgba(${hexToRgb(meta.color)},0.14)`,
                      borderColor: `rgba(${hexToRgb(meta.color)},0.3)`,
                    }
                  : undefined
              }
            >
              <span>{meta.emoji}</span>
              {d}
              <span className="text-[10.5px] opacity-60">
                {done}/{count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid min-w-0 gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="space-y-1.5">
          {grouped[activeDiff].map((c) => {
            const done = completed.has(c.id);
            const meta = DIFFICULTY_META[c.difficulty];
            const isActive = active.id === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onSelect(c)}
                className={cn(
                  "group flex w-full items-center gap-3 rounded-apple border bg-surface px-3 py-2.5 text-left ring-focus transition-all",
                  isActive
                    ? "border-line shadow-sm"
                    : "border-line-soft hover:border-line hover:bg-bg-soft/40",
                )}
              >
                <span
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-[13px]"
                  style={{ background: `rgba(${hexToRgb(meta.color)},0.12)` }}
                >
                  {done ? (
                    <CheckCircle2
                      className="h-4 w-4"
                      style={{ color: meta.color }}
                    />
                  ) : (
                    meta.emoji
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium">
                    {c.title}
                  </span>
                  <span className="mt-0.5 flex flex-wrap gap-1">
                    {c.tags.slice(0, 2).map((t) => (
                      <span
                        key={t}
                        className="font-mono text-[10px] text-ink-sub"
                      >
                        #{t.toLowerCase()}
                      </span>
                    ))}
                  </span>
                </span>
                <ChevronRight
                  className={cn(
                    "h-4 w-4 text-ink-sub transition-transform",
                    isActive && "translate-x-0.5 text-ink",
                  )}
                />
              </button>
            );
          })}
        </aside>

        <section className="min-w-0 space-y-3">
          <div className="card p-5">
            <div className="flex flex-wrap items-start gap-2">
              <h2 className="text-[20px] font-semibold">{active.title}</h2>
              <span className="ml-auto">
                <Badge color={`rgb(${DIFFICULTY_META[active.difficulty].color})`}>
                  {DIFFICULTY_META[active.difficulty].emoji} {active.difficulty}
                </Badge>
              </span>
            </div>
            <p className="mt-3 text-[14.5px] leading-relaxed text-ink-soft">
              {active.prompt}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {active.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-md bg-bg-soft px-2 py-0.5 font-mono text-[10.5px] text-ink-sub"
                >
                  #{t}
                </span>
              ))}
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="flex items-center gap-1 border-b border-line-soft bg-bg-soft/40 px-2 py-1.5">
              <span className="px-2 text-[12.5px] font-medium text-ink-soft">
                Tu solución
              </span>
              <div className="ml-auto flex items-center gap-1.5 pr-1">
                <button
                  type="button"
                  onClick={() => void run(sql)}
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line-soft bg-surface px-3 text-[12.5px] font-semibold text-ink ring-focus hover:bg-bg-soft"
                >
                  <Play className="h-3.5 w-3.5" />
                  Probar
                </button>
                <button
                  type="button"
                  onClick={() => void validate()}
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-ink px-3 text-[12.5px] font-semibold text-[rgb(var(--bg))] ring-focus hover:opacity-90"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Validar
                </button>
                <button
                  type="button"
                  onClick={() => setShowHint((v) => !v)}
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-accent5/30 bg-accent5/10 px-3 text-[12.5px] font-medium text-accent5 ring-focus hover:bg-accent5/15"
                  title="Ver pista"
                >
                  <Lightbulb className="h-3.5 w-3.5" />
                  Pista
                </button>
              </div>
            </div>
            <div className="p-3">
              <SqlEditor
                ref={editorRef}
                value={sql}
                onChange={setSql}
                onRun={() => run(sql)}
                minHeight={140}
              />
            </div>
            <AnimatePresence>
              {showHint && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-t border-line-soft"
                >
                  <div className="flex items-start gap-2 bg-accent5/5 px-4 py-3 text-[13px] text-ink-soft">
                    <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-accent5" />
                    <span>{active.hint}</span>
                  </div>
                  <div className="border-t border-accent5/15 px-4 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setSql(active.starterCode);
                        setResult(null);
                        setVerdict(null);
                      }}
                      className="inline-flex items-center gap-1 text-[11.5px] font-medium text-ink-sub ring-focus rounded-md hover:text-ink"
                    >
                      <RefreshCw className="h-3 w-3" /> Reiniciar código
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {result && (
            <div>
              <AnimatePresence>
                {verdict && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "mb-2 flex items-center gap-2 rounded-apple border px-4 py-3 text-[13.5px] font-medium",
                      verdict.ok
                        ? "border-accent4/30 bg-accent4/10 text-accent4"
                        : "border-accent3/25 bg-accent3/5 text-accent3",
                    )}
                  >
                    {verdict.ok ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 shrink-0" />
                    )}
                    <span>{verdict.reason}</span>
                    {verdict.ok && (
                      <span className="ml-auto text-[12px] font-normal opacity-80">
                        ✨ {active.successMessage}
                      </span>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
              <ResultTable result={result} />
            </div>
          )}

          {!result && status !== "ready" && (
            <div className="grid h-32 place-items-center rounded-apple border border-dashed border-line bg-bg-soft/40 text-[13px] text-ink-sub">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="mt-2">Cargando SQLite…</span>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function hexToRgb(input: string): string {
  const map: Record<string, string> = {
    "var(--accent-4)": "50,215,170",
    "var(--accent)": "0,113,227",
    "var(--accent-2)": "94,92,230",
    "var(--accent-3)": "255,90,95",
    "var(--accent-5)": "255,159,10",
  };
  return map[input] ?? "0,113,227";
}
