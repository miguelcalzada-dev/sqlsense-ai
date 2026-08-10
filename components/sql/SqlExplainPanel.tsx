"use client";

import { useCallback, useRef, useState } from "react";
import { Loader2, MessageSquareQuote, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { ExplainResponse } from "@/lib/ai/types";
import Button from "@/components/ui/Button";
import CopyButton from "@/components/ui/CopyButton";

type Props = { sql: string };

export default function SqlExplainPanel({ sql }: Props) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExplainResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const explain = useCallback(async () => {
    if (!sql.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sql }),
        signal: ctrl.signal,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setResult((await res.json()) as ExplainResponse);
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, [sql]);

  return (
    <div className="card flex flex-col gap-3 p-4">
      <div className="flex items-center gap-2">
        <MessageSquareQuote className="h-4 w-4 text-accent2" />
        <h3 className="text-[14px] font-semibold">Explicar este SQL</h3>
        <Button
          size="sm"
          variant="secondary"
          className="ml-auto"
          loading={loading}
          disabled={!sql.trim()}
          onClick={() => void explain()}
        >
          Explicar
        </Button>
      </div>

      {!result && !loading && !error && (
        <div className="rounded-apple border border-line-soft bg-bg-soft p-4 text-[12.5px] text-ink-sub">
          Pulsa <span className="font-medium text-ink">Explicar</span> para que la
          IA te devuelva el equivalente en lenguaje natural, paso a paso.
        </div>
      )}

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="l"
            className="grid place-items-center gap-2 py-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Loader2 className="h-5 w-5 animate-spin text-accent" />
            <p className="text-[12px] text-ink-sub">Interpretando…</p>
          </motion.div>
        ) : error ? (
          <motion.div
            key="e"
            className="text-[13px] text-accent3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {error}
          </motion.div>
        ) : result ? (
          <motion.div
            key="r"
            className="space-y-3"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-[13.5px] leading-relaxed text-ink-soft">
              <Sparkles className="mr-1 inline h-3.5 w-3.5 text-accent" />
              {result.naturalLanguage}
            </p>

            {result.tables.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {result.tables.map((t) => (
                  <span key={t} className="chip">
                    {t}
                  </span>
                ))}
              </div>
            )}

            {result.steps.length > 0 && (
              <ol className="space-y-1.5">
                {result.steps.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-[12.5px]">
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

            {result.citations.length > 0 && (
              <details className="rounded-apple border border-line-soft bg-bg-soft p-3 text-[12px]">
                <summary className="cursor-pointer font-medium text-ink-soft">
                  Citas del SQL ({result.citations.length})
                </summary>
                <ul className="mt-2 space-y-1.5">
                  {result.citations.map((c, i) => (
                    <li key={i} className="text-ink-sub">
                      <code className="font-mono text-[11px] text-accent">
                        {c.clause}
                      </code>{" "}
                      — {c.what}
                    </li>
                  ))}
                </ul>
              </details>
            )}

            <div className="flex justify-end">
              <CopyButton text={JSON.stringify(result, null, 2)} label="Copiar JSON" />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}