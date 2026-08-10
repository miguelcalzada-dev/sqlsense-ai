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
      if (String(a[i][j] ?? "") !== String(b[i][j] ?? "")) return false;
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
  if ("error" in canonical) return { ok: false, reason: "No se pudo validar (canon fallo)." };
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
            ? "Numero de filas correcto."
            : `Esperabas ${canonical.rows.length} fila(s), obtuviste ${user.rows.length}.`,
      };
    case "rowsContain":
      return {
        ok: unorderedEqual(canonical.rows, user.rows.slice(0, canonical.rows.length)),
        reason: "Faltan filas esperadas.",
      };
    default:
      return { ok: false, reason: "Tipo de validacion no soportado." };
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
  } catch { /* ignore */ }
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

  useEffect(() => { setCompleted(loadCompleted()); }, []);
  useEffect(() => {
    if (status === "idle") void init().catch(() => undefined);
  }, [status, init]);

  const grouped = useMemo(() => {
    const acc: Record<Difficulty, Challenge[]> = {
      Principiante: [], Intermedio: [], Avanzado: [], Experto: [],
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
      setVerdict({ ok: false, reason: "No se pudo generar la solucion canonica." });
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
    <div className="mx-auto max-w-7xl px-4 py-8">
      <header className="mb-8 border-b-4 border-line pb-6">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center border-4 border-line bg-accent-5 shadow-brutal">
            <Trophy className="h-6 w-6 text-white" strokeWidth={2.5} />
          </span>
          <h1 className="font-heading text-4xl uppercase">Retos</h1>
        </div>
        <p className="mt-3 max-w-2xl font-mono text-xs uppercase tracking-wider text-sub">
          Practica SQL con <span className="font-bold text-ink">{CHALLENGES.length} retos</span> divididos en cuatro niveles. La validacion es automatica.
        </p>
        <div className="mt-3 font-mono text-xs uppercase tracking-wider">
          Completados: <span className="font-bold text-ink">{completed.size}</span> / {CHALLENGES.length}
        </div>
      </header>

      <div className="mb-6 flex flex-wrap gap-2">
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
                "inline-flex items-center gap-2 border-4 px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider shadow-brutal-sm transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal",
                activeDiff === d
                  ? "border-line bg-accent text-white"
                  : "border-line bg-surface",
              )}
            >
              <span>{meta.emoji}</span>
              {d}
              <span className="opacity-60">{done}/{count}</span>
            </button>
          );
        })}
      </div>

      <div className="grid min-w-0 gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="space-y-1">
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
                  "group flex w-full items-center gap-3 border-2 px-3 py-3 text-left transition-all",
                  isActive
                    ? "border-line bg-bg-soft shadow-brutal-sm"
                    : "border-line bg-surface hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal",
                )}
              >
                <span
                  className="grid h-9 w-9 shrink-0 place-items-center border-2 border-line text-sm"
                  style={{ background: `${hexToColor(meta.color)}25` }}
                >
                  {done ? (
                    <CheckCircle2 className="h-4 w-4" style={{ color: hexToColor(meta.color) }} />
                  ) : (
                    meta.emoji
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-body text-sm font-medium">{c.title}</span>
                  <span className="mt-0.5 flex flex-wrap gap-1">
                    {c.tags.slice(0, 2).map((t) => (
                      <span key={t} className="font-mono text-[10px] font-bold uppercase text-sub">
                        #{t.toLowerCase()}
                      </span>
                    ))}
                  </span>
                </span>
                <ChevronRight
                  className={cn(
                    "h-4 w-4 text-sub transition-transform",
                    isActive && "translate-x-0.5 text-ink",
                  )}
                />
              </button>
            );
          })}
        </aside>

        <section className="min-w-0 space-y-5">
          <div className="card p-6">
            <div className="flex flex-wrap items-start gap-2">
              <h2 className="font-heading text-2xl uppercase">{active.title}</h2>
              <span className="ml-auto">
                <Badge color={hexToColor(DIFFICULTY_META[active.difficulty].color)}>
                  {DIFFICULTY_META[active.difficulty].emoji} {active.difficulty}
                </Badge>
              </span>
            </div>
            <p className="mt-3 font-body text-sm leading-relaxed text-ink-soft">
              {active.prompt}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {active.tags.map((t) => (
                <span key={t} className="border-2 border-line bg-bg-soft px-2 py-0.5 font-mono text-[10px] font-bold uppercase">
                  #{t}
                </span>
              ))}
            </div>
          </div>

          <div className="card overflow-hidden p-0">
            <div className="flex items-center gap-1 border-b-4 border-line bg-bg-soft px-3 py-2">
              <span className="px-2 font-mono text-xs font-bold uppercase tracking-wider">
                Tu solucion
              </span>
              <div className="ml-auto flex items-center gap-2 pr-1">
                <button
                  type="button"
                  onClick={() => void run(sql)}
                  className="inline-flex h-10 items-center gap-2 border-4 border-line bg-surface px-4 font-mono text-xs font-bold uppercase tracking-wider shadow-brutal-sm transition-all hover:bg-bg-soft active:shadow-none active:translate-x-0.5 active:translate-y-0.5"
                >
                  <Play className="h-4 w-4" />
                  Probar
                </button>
                <button
                  type="button"
                  onClick={() => void validate()}
                  className="inline-flex h-10 items-center gap-2 border-4 border-line bg-accent px-4 font-mono text-xs font-bold uppercase tracking-wider text-white shadow-brutal-sm transition-all hover:bg-[#e63800] active:shadow-none active:translate-x-0.5 active:translate-y-0.5"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Validar
                </button>
                <button
                  type="button"
                  onClick={() => setShowHint((v) => !v)}
                  className="inline-flex h-10 items-center gap-2 border-4 border-line bg-accent-5 px-4 font-mono text-xs font-bold uppercase tracking-wider text-white shadow-brutal-sm transition-all hover:bg-accent-5/90 active:shadow-none active:translate-x-0.5 active:translate-y-0.5"
                  title="Ver pista"
                >
                  <Lightbulb className="h-4 w-4" />
                  Pista
                </button>
              </div>
            </div>
            <div className="p-4">
              <SqlEditor
                ref={editorRef}
                value={sql}
                onChange={setSql}
                onRun={() => run(sql)}
                minHeight={160}
              />
            </div>
            <AnimatePresence>
              {showHint && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-t-4 border-line"
                >
                  <div className="flex items-start gap-2 bg-accent-5/10 px-4 py-3 font-body text-sm text-ink-soft">
                    <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-accent-5" />
                    <span>{active.hint}</span>
                  </div>
                  <div className="border-t-2 border-accent-5/20 px-4 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setSql(active.starterCode);
                        setResult(null);
                        setVerdict(null);
                      }}
                      className="inline-flex items-center gap-1 font-mono text-xs font-bold uppercase tracking-wider text-sub hover:text-ink"
                    >
                      <RefreshCw className="h-3 w-3" /> Reiniciar codigo
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
                      "mb-3 flex items-center gap-2 border-4 px-4 py-3 font-mono text-xs font-bold uppercase tracking-wider shadow-brutal-sm",
                      verdict.ok
                        ? "border-line bg-accent-4 text-white"
                        : "border-line bg-accent-3 text-white",
                    )}
                  >
                    {verdict.ok ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 shrink-0" />
                    )}
                    <span>{verdict.reason}</span>
                    {verdict.ok && (
                      <span className="ml-auto font-body text-xs font-normal normal-case tracking-normal opacity-90">
                        {active.successMessage}
                      </span>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
              <ResultTable result={result} />
            </div>
          )}

          {!result && status !== "ready" && (
            <div className="grid h-40 place-items-center border-4 border-dashed border-line bg-bg-soft">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="mt-2 font-mono text-xs uppercase tracking-wider">Cargando SQLite...</span>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function hexToColor(input: string): string {
  const map: Record<string, string> = {
    "var(--accent-4)": "#00994d",
    "var(--accent)": "#ff3e00",
    "var(--accent-2)": "#2400ff",
    "var(--accent-3)": "#e60000",
    "var(--accent-5)": "#ffb800",
  };
  return map[input] ?? "#ff3e00";
}
