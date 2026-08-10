"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Lightbulb,
  Loader2,
  Play,
  RotateCcw,
  Sparkles,
  Wand2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDatabase, type QueryResult } from "@/lib/db/sqlite";
import type { TranslateResponse } from "@/lib/ai/types";
import Button from "@/components/ui/Button";
import ResultTable from "./ResultTable";
import CopyButton from "@/components/ui/CopyButton";
import { cn } from "@/lib/utils";

const EXAMPLES = [
  "¿Cuántos coches rojos hay?",
  "Precio medio de los BMW",
  "Ventas en 2022",
  "Marca más vendida",
  "Los 5 coches más caros",
  "Clientes de Madrid",
];

type Props = {
  onUseSQL?: (sql: string) => void;
};

export default function NLLabPanel({ onUseSQL }: Props) {
  const { init, status, execute } = useDatabase();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TranslateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<QueryResult | { error: string } | null>(
    null,
  );
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (status === "idle") void init();
  }, [status, init]);

  const runTranslate = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      setLoading(true);
      setError(null);
      setResult(null);
      setPreview(null);
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      try {
        const res = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: trimmed }),
          signal: ctrl.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as TranslateResponse;
        setResult(data);
        if (data.sql) {
          const exec = execute(data.sql);
          setPreview(exec);
        }
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
        setError(e instanceof Error ? e.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    },
    [execute],
  );

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
      <div className="card flex flex-col gap-3 p-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-accent" />
          <h3 className="text-[14px] font-semibold">Pregunta en lenguaje natural</h3>
          <span className="ml-auto text-[11.5px] text-ink-sub">
            IA ⇄ SQL
          </span>
        </div>

        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              void runTranslate(query);
            }
          }}
          rows={4}
          placeholder="Ej. ¿Cuántos coches rojos se vendieron en 2019?"
          className="input-base w-full resize-none px-3.5 py-3 text-[14px] leading-relaxed"
        />

        <div className="flex flex-wrap gap-1.5">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => {
                setQuery(ex);
                void runTranslate(ex);
              }}
              className="chip transition-transform hover:scale-105 active:scale-95"
            >
              {ex}
            </button>
          ))}
        </div>

        <div className="mt-auto flex items-center gap-2">
          <Button
            size="lg"
            loading={loading}
            onClick={() => void runTranslate(query)}
            disabled={!query.trim()}
            className="flex-1"
            iconRight={<ArrowRight className="h-4 w-4" />}
          >
            Generar SQL
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => {
              setQuery("");
              setResult(null);
              setPreview(null);
              setError(null);
            }}
            aria-label="Limpiar"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-[11.5px] text-ink-sub">
          ⌘/Ctrl + Enter para ejecutar
        </p>
      </div>

      <div className="card flex flex-col gap-3 p-4">
        <div className="flex items-center gap-2">
          <Wand2 className="h-4 w-4 text-accent2" />
          <h3 className="text-[14px] font-semibold">Resultado IA</h3>
          {result && (
            <span
              className={cn(
                "ml-auto rounded-full px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider",
                result.source === "openai"
                  ? "bg-accent2/10 text-accent2"
                  : "bg-bg-soft text-ink-sub",
              )}
            >
              {result.source === "openai" ? "OpenAI" : "Local"}
            </span>
          )}
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid flex-1 place-items-center gap-2 py-10"
            >
              <Loader2 className="h-5 w-5 animate-spin text-accent" />
              <p className="text-[12.5px] text-ink-sub">Pensando…</p>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-apple border border-accent3/20 bg-accent3/5 p-4 text-[13px] text-accent3"
            >
              {error}
            </motion.div>
          ) : result ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-1 flex-col gap-3"
            >
              <p className="text-[13.5px] leading-relaxed text-ink-soft">
                {result.summary}
              </p>

              <div className="rounded-apple border border-line-soft bg-[#0c0c0f] p-3 font-mono text-[12.5px] leading-relaxed text-[rgb(245,245,248)]">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider text-white/40">
                    SQL generado
                  </span>
                  <CopyButton
                    text={result.sql}
                    className="border-white/10 bg-white/5 text-white/70 hover:text-white hover:border-white/20"
                  />
                </div>
                <pre className="overflow-x-auto whitespace-pre">
                  {result.sql || "—"}
                </pre>
              </div>

              {result.steps.length > 0 && (
                <ol className="space-y-1.5">
                  {result.steps.map((s, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-[12.5px]"
                    >
                      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md bg-bg-soft font-mono text-[10.5px] font-semibold text-ink-sub">
                        {i + 1}
                      </span>
                      <span>
                        <code className="font-mono text-[11.5px] font-semibold text-accent2">
                          {s.clause}
                        </code>{" "}
                        <span className="text-ink-soft">{s.note}</span>
                      </span>
                    </li>
                  ))}
                </ol>
              )}

              {preview && (
                <div className="mt-1">
                  <div className="mb-1.5 flex items-center gap-2 text-[11.5px] text-ink-sub">
                    <Play className="h-3 w-3 text-accent4" />
                    Ejecutado en laboratorio
                  </div>
                  <ResultTable result={preview} />
                </div>
              )}

              {result.sql && onUseSQL && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="self-start"
                  iconRight={<ArrowRight className="h-3.5 w-3.5" />}
                  onClick={() => onUseSQL(result.sql)}
                >
                  Usar en el editor
                </Button>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid flex-1 place-items-center gap-2 py-10"
            >
              <Lightbulb className="h-6 w-6 text-ink-sub/50" />
              <p className="text-center text-[12.5px] text-ink-sub">
                Escribe tu pregunta o pulsa un ejemplo para ver la magia.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}