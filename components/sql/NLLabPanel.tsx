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
import { executeWhenReady, useDatabase, type QueryResult } from "@/lib/db/sqlite";
import type { TranslateResponse } from "@/lib/ai/types";
import Button from "@/components/ui/Button";
import ResultTable from "./ResultTable";
import CopyButton from "@/components/ui/CopyButton";
import { cn } from "@/lib/utils";

const EXAMPLES = [
  "Cuantos coches rojos hay?",
  "Precio medio de los BMW",
  "Ventas en 2022",
  "Marca mas vendida",
  "Los 5 coches mas caros",
  "Clientes de Madrid",
];

type Props = {
  onUseSQL?: (sql: string) => void;
};

export default function NLLabPanel({ onUseSQL }: Props) {
  const { init, status } = useDatabase();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TranslateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<QueryResult | { error: string } | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (status === "idle") void init().catch(() => undefined);
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
          const exec = await executeWhenReady(data.sql);
          setPreview(exec);
        }
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
        setError(e instanceof Error ? e.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          <h3 className="font-heading text-lg uppercase">Pregunta en lenguaje natural</h3>
          <span className="ml-auto font-mono text-xs font-bold uppercase tracking-wider text-sub">
            IA &harr; SQL
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
          placeholder="Ej. Cuantos coches rojos se vendieron en 2019?"
          className="input-base w-full resize-none font-body text-base"
        />

        <div className="flex max-w-full flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => {
                setQuery(ex);
                void runTranslate(ex);
              }}
              className="chip shrink-0"
            >
              {ex}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
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
        <p className="font-mono text-xs uppercase tracking-wider text-sub">
          Ctrl + Enter para ejecutar
        </p>
      </div>

      <div className="flex flex-col gap-4 border-4 border-line bg-bg-soft p-5 shadow-brutal">
        <div className="flex items-center gap-2">
          <Wand2 className="h-4 w-4" />
          <h3 className="font-heading text-lg uppercase">Resultado IA</h3>
          {result && (
            <span
              className={cn(
                "ml-auto pill",
                result.source === "openai"
                  ? "!bg-accent-2 !text-white"
                  : "",
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
              className="grid place-items-center gap-3 py-12"
            >
              <Loader2 className="h-6 w-6 animate-spin" />
              <p className="font-mono text-xs uppercase tracking-wider">Pensando...</p>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="border-4 border-accent-3 bg-accent-3/10 p-4 font-mono text-xs uppercase tracking-wider text-accent-3 shadow-brutal-sm"
            >
              {error}
            </motion.div>
          ) : result ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-4"
            >
              <p className="font-body text-sm leading-relaxed text-ink-soft">
                {result.summary}
              </p>

              <div className="border-4 border-line bg-bg p-4 font-mono text-sm leading-relaxed shadow-brutal-sm">
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-sub">
                    SQL generado
                  </span>
                  <CopyButton text={result.sql} />
                </div>
                <pre className="overflow-x-auto whitespace-pre text-ink">
                  {result.sql || "---"}
                </pre>
              </div>

              {result.steps.length > 0 && (
                <ol className="space-y-2">
                  {result.steps.map((s, i) => (
                    <li key={i} className="flex items-start gap-3 font-body text-sm">
                      <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center border-2 border-line bg-bg-soft font-mono text-xs font-bold">
                        {i + 1}
                      </span>
                      <span>
                        <code className="font-mono text-xs font-bold text-accent-2">
                          {s.clause}
                        </code>{" "}
                        <span className="text-sub">{s.note}</span>
                      </span>
                    </li>
                  ))}
                </ol>
              )}

              {preview && (
                <div className="mt-2">
                  <div className="mb-2 flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider">
                    <Play className="h-3.5 w-3.5" />
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
              className="grid place-items-center gap-3 py-12"
            >
              <Lightbulb className="h-8 w-8 text-sub/40" />
              <p className="text-center font-mono text-xs uppercase tracking-wider text-sub">
                Escribe tu pregunta o pulsa un ejemplo para ver la magia.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
