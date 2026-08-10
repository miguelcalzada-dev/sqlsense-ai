"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  Database,
  Filter,
  GitBranch,
  Group,
  Hash,
  Layers,
  Lightbulb,
  Loader2,
  ListOrdered,
  Play,
  Sparkles,
  TerminalSquare,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import type { TeachResponse } from "@/lib/ai/types";
import { useDatabase } from "@/lib/db/sqlite";
import Button from "@/components/ui/Button";
import CodeBlock from "@/components/ui/CodeBlock";
import ResultTable from "@/components/sql/ResultTable";
import type { QueryResult } from "@/lib/db/sqlite";
import { cn } from "@/lib/utils";

type Topic = {
  id: string;
  title: string;
  emoji: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  topic: string;
};

const TOPICS: Topic[] = [
  {
    id: "intro",
    title: "Empezando",
    emoji: "🌱",
    desc: "Qué es SQL, cómo se organiza y por dónde empezar.",
    icon: BookOpen,
    topic: "intro",
  },
  {
    id: "select",
    title: "SELECT & FROM",
    emoji: "📥",
    desc: "Leer datos. La base de todo.",
    icon: Layers,
    topic: "select",
  },
  {
    id: "where",
    title: "WHERE & filtros",
    emoji: "🎯",
    desc: "Quedarte solo con las filas que interesan.",
    icon: Filter,
    topic: "where",
  },
  {
    id: "join",
    title: "JOIN",
    emoji: "🔗",
    desc: "Combinar varias tablas en un solo resultado.",
    icon: GitBranch,
    topic: "join",
  },
  {
    id: "group",
    title: "GROUP BY & HAVING",
    emoji: "🧮",
    desc: "Agrupar y agregar: contar, sumar, promediar.",
    icon: Group,
    topic: "group by",
  },
  {
    id: "order",
    title: "ORDER BY & LIMIT",
    emoji: "↕️",
    desc: "Ordenar y limitar los resultados.",
    icon: ListOrdered,
    topic: "order by",
  },
  {
    id: "aggregates",
    title: "Agregaciones",
    emoji: "∑",
    desc: "COUNT, SUM, AVG, MIN, MAX en detalle.",
    icon: Hash,
    topic: "aggregates",
  },
  {
    id: "window",
    title: "Window functions",
    emoji: "🪟",
    desc: "Rankings, medias móviles y particiones.",
    icon: TrendingUp,
    topic: "window",
  },
];

const STATIC_CONTENT: Record<string, { summary: string; sql: string; desc: string }[]> = {
  intro: [
    {
      summary:
        "SQL (Structured Query Language) es el lenguaje para hablar con bases de datos relacionales. Sus tablas son como hojas de cálculo con filas y columnas, pero conectadas entre sí por claves.",
      sql: "SELECT 'Hola SQL' AS saludo;",
      desc: "Tu primera consulta. Devuelve una fila construida al vuelo.",
    },
    {
      summary:
        "El esquema del laboratorio es un concesionario: marcas, coches, clientes y ventas. Cada venta conecta un coche y un cliente mediante claves foráneas.",
      sql: "SELECT name FROM sqlite_master WHERE type='table';",
      desc: "Inspecciona las tablas que existen en la base de datos.",
    },
  ],
  select: [
    {
      summary:
        "SELECT elige qué columnas mostrar; FROM indica de qué tabla. El asterisco (*) trae todas las columnas.",
      sql: "SELECT modelo, precio FROM coches LIMIT 5;",
      desc: "Proyección: solo las columnas que te interesan.",
    },
    {
      summary:
        "Puedes renombrar columnas con AS, calcular expresiones y formatear salidas.",
      sql: "SELECT modelo, precio, ROUND(precio/1000, 1) AS miles FROM coches LIMIT 5;",
      desc: "Columnas calculadas y alias.",
    },
  ],
  where: [
    {
      summary:
        "WHERE filtra filas según una condición. Soporta =, <>, <, >, <=, >=, AND, OR, NOT, BETWEEN, IN, LIKE e IS NULL.",
      sql: "SELECT * FROM coches WHERE color = 'Rojo' AND anio >= 2022;",
      desc: "Combina condiciones con AND/OR.",
    },
    {
      summary:
        "LIKE busca por patrón: % cualquier secuencia, _ un carácter concreto.",
      sql: "SELECT * FROM coches WHERE modelo LIKE 'M%';",
      desc: "Modelos que empiezan por 'M'.",
    },
  ],
  join: [
    {
      summary:
        "INNER JOIN devuelve solo filas que coinciden en ambas tablas, según una condición de cruce (normalmente igualdad entre claves).",
      sql: "SELECT c.modelo, m.nombre AS marca FROM coches c JOIN marcas m ON c.marca_id = m.id LIMIT 8;",
      desc: "Cada coche con el nombre de su marca.",
    },
    {
      summary:
        "LEFT JOIN conserva todas las filas de la tabla izquierda y rellena con NULL cuando no hay coincidencia en la derecha. Es el patrón para encontrar 'ausencias'.",
      sql: "SELECT c.id, c.modelo, v.id AS venta_id FROM coches c LEFT JOIN ventas v ON v.coche_id = c.id WHERE v.id IS NULL;",
      desc: "Coches que nunca se han vendido.",
    },
  ],
  group: [
    {
      summary:
        "GROUP BY agrupa filas con el mismo valor en una o varias columnas. Se combina con funciones de agregación (COUNT, SUM, AVG…).",
      sql: "SELECT m.nombre, COUNT(v.id) AS ventas FROM marcas m JOIN coches c ON c.marca_id = m.id JOIN ventas v ON v.coche_id = c.id GROUP BY m.nombre ORDER BY ventas DESC;",
      desc: "Ventas por marca.",
    },
    {
      summary:
        "HAVING filtra grupos después de agrupar. WHERE filtra filas antes; HAVING filtra grupos después.",
      sql: "SELECT m.nombre, COUNT(v.id) AS ventas FROM marcas m JOIN coches c ON c.marca_id = m.id JOIN ventas v ON v.coche_id = c.id GROUP BY m.nombre HAVING COUNT(v.id) > 5;",
      desc: "Solo marcas con más de 5 ventas.",
    },
  ],
  order: [
    {
      summary:
        "ORDER BY ordena por una o varias columnas, ASC (por defecto) o DESC.",
      sql: "SELECT * FROM coches ORDER BY precio DESC LIMIT 5;",
      desc: "Los 5 coches más caros.",
    },
    {
      summary:
        "LIMIT restringe el número de filas; OFFSET salta las primeras N. Útil para paginación.",
      sql: "SELECT * FROM ventas ORDER BY fecha DESC LIMIT 10 OFFSET 0;",
      desc: "Las 10 ventas más recientes (página 1).",
    },
  ],
  aggregates: [
    {
      summary:
        "COUNT cuenta filas. COUNT(*) cuenta todo; COUNT(col) ignora NULL en col.",
      sql: "SELECT COUNT(*) AS total, COUNT(DISTINCT color) AS colores FROM coches;",
      desc: "Total de coches y cuántos colores distintos hay.",
    },
    {
      summary:
        "SUM suma, AVG promedia, MAX/MIN devuelven extremos. Se pueden combinar en una sola consulta.",
      sql: "SELECT AVG(precio) AS media, MIN(precio) AS minimo, MAX(precio) AS maximo FROM coches;",
      desc: "Estadísticas de precios.",
    },
  ],
  window: [
    {
      summary:
        "ROW_NUMBER() OVER (...) numeriza filas según un orden, sin agrupar. PARTITION BY reinicia el contador por grupo.",
      sql: "SELECT v.id, cl.nombre, v.precio_venta, ROW_NUMBER() OVER (PARTITION BY v.cliente_id ORDER BY v.fecha) AS n FROM ventas v JOIN clientes cl ON v.cliente_id = cl.id LIMIT 12;",
      desc: "Número de venta de cada cliente por orden cronológico.",
    },
    {
      summary:
        "ROWS BETWEEN … PRECEDING AND … FOLLOWING define ventanas deslizantes para medias móviles.",
      sql: "SELECT v.id, v.precio_venta, ROUND(AVG(v.precio_venta) OVER (ORDER BY v.id ROWS 2 PRECEDING), 1) AS media_movil FROM ventas v LIMIT 15;",
      desc: "Media móvil de las últimas 3 ventas.",
    },
  ],
};

export default function GuidePage() {
  const [activeTopic, setActiveTopic] = useState<Topic>(TOPICS[1]);
  const [aiContent, setAiContent] = useState<TeachResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { init, status, execute } = useDatabase();
  const [preview, setPreview] = useState<QueryResult | { error: string } | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (status === "idle") void init().catch(() => undefined);
  }, [status, init]);

  const fetchTeach = useCallback(
    async (topic: Topic) => {
      setLoading(true);
      setError(null);
      setAiContent(null);
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      try {
        const res = await fetch("/api/teach", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic: topic.topic }),
          signal: ctrl.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setAiContent((await res.json()) as TeachResponse);
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
        setError(e instanceof Error ? e.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    void fetchTeach(activeTopic);
  }, [activeTopic, fetchTeach]);

  const staticContent = STATIC_CONTENT[activeTopic.id] ?? [];

  const runExample = (sql: string) => {
    if (status !== "ready") return;
    setPreview(execute(sql));
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-6">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-accent4 to-accent shadow-md">
            <BookOpen className="h-5 w-5 text-white" strokeWidth={2.4} />
          </span>
          <h1 className="text-[28px] font-semibold tracking-tight">Guía</h1>
        </div>
        <p className="mt-2 max-w-2xl text-[14px] text-ink-sub">
          Aprende SQL de forma visual: cada concepto se explica con ejemplos
          ejecutables que puedes lanzar contra la base de datos del laboratorio.
          La IA amplía cada tema al instante.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
        <aside className="card p-3 lg:sticky lg:top-24 lg:self-start">
          <div className="px-2 py-2 text-[11px] font-semibold uppercase tracking-wider text-ink-sub">
            Temas
          </div>
          <ul className="space-y-1">
            {TOPICS.map((t) => {
              const Icon = t.icon;
              const isActive = activeTopic.id === t.id;
              return (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => setActiveTopic(t)}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left ring-focus transition-colors",
                      isActive
                        ? "bg-bg-soft text-ink"
                        : "text-ink-soft hover:bg-bg-soft/60 hover:text-ink",
                    )}
                  >
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-bg-soft text-[14px]">
                      {t.emoji}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12.5px] font-medium">
                        {t.title}
                      </span>
                    </span>
                    <Icon className="h-3.5 w-3.5 opacity-40" />
                  </button>
                </li>
              );
            })}
          </ul>
          <Link
            href="/lab"
            className="mt-3 flex items-center justify-center gap-1.5 rounded-xl bg-ink px-3 py-2.5 text-[12.5px] font-semibold text-[rgb(var(--bg))] ring-focus"
          >
            <TerminalSquare className="h-3.5 w-3.5" />
            Practicar en el laboratorio
          </Link>
        </aside>

        <section className="space-y-4">
          <div className="card p-5">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-bg-soft text-[20px]">
                {activeTopic.emoji}
              </span>
              <div>
                <h2 className="text-[22px] font-semibold">{activeTopic.title}</h2>
                <p className="text-[13px] text-ink-sub">{activeTopic.desc}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {staticContent.map((c, i) => (
              <article key={i} className="card p-4">
                <p className="text-[13.5px] leading-relaxed text-ink-soft">
                  {c.summary}
                </p>
                <div className="mt-3">
                  <CodeBlock code={c.sql} title="Ejemplo" />
                </div>
                <p className="mt-2 text-[12px] text-ink-sub">
                  <Sparkles className="mr-1 inline h-3 w-3 text-accent" />
                  {c.desc}
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-3"
                  iconLeft={<Play className="h-3.5 w-3.5" />}
                  onClick={() => runExample(c.sql)}
                  disabled={status !== "ready"}
                >
                  Ejecutar en laboratorio
                </Button>
              </article>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="card grid place-items-center gap-2 py-10"
              >
                <Loader2 className="h-5 w-5 animate-spin text-accent" />
                <p className="text-[13px] text-ink-sub">
                  La IA está preparando el tema…
                </p>
              </motion.div>
            ) : error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="card p-4 text-[13px] text-accent3"
              >
                {error}
              </motion.div>
            ) : aiContent ? (
              <motion.div
                key="ai"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-5"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-accent" />
                  <h3 className="text-[15px] font-semibold">
                    Explicación de la IA
                  </h3>
                  <span
                    className={cn(
                      "ml-auto rounded-full px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider",
                      aiContent.source === "openai"
                        ? "bg-accent2/10 text-accent2"
                        : "bg-bg-soft text-ink-sub",
                    )}
                  >
                    {aiContent.source === "openai" ? "OpenAI" : "Local"}
                  </span>
                </div>
                <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">
                  {aiContent.summary}
                </p>

                {aiContent.concepts.length > 0 && (
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {aiContent.concepts.map((c, i) => (
                      <div
                        key={i}
                        className="rounded-apple border border-line-soft bg-bg-soft/40 p-3"
                      >
                        <div className="font-mono text-[11.5px] font-semibold text-accent2">
                          {c.term}
                        </div>
                        <p className="mt-1 text-[12.5px] text-ink-sub">
                          {c.definition}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {aiContent.examples.length > 0 && (
                  <div className="mt-4 space-y-3">
                    {aiContent.examples.map((ex, i) => (
                      <div key={i}>
                        <CodeBlock code={ex.sql} title={`Ejemplo ${i + 1}`} />
                        <p className="mt-1.5 text-[12px] text-ink-sub">
                          <Lightbulb className="mr-1 inline h-3 w-3 text-accent5" />
                          {ex.desc}
                        </p>
                        <Button
                          variant="subtle"
                          size="sm"
                          className="mt-2"
                          iconLeft={<Play className="h-3.5 w-3.5" />}
                          onClick={() => runExample(ex.sql)}
                          disabled={status !== "ready"}
                        >
                          Ejecutar
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ) : null}
          </AnimatePresence>

          {preview && (
            <div>
              <div className="mb-2 flex items-center gap-2 text-[13px] font-medium text-ink-soft">
                <Database className="h-3.5 w-3.5" />
                Resultado en el laboratorio
                <Link
                  href="/lab"
                  className="ml-auto inline-flex items-center gap-1 text-[12px] font-medium text-accent ring-focus rounded-md"
                >
                  Abrir editor
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <ResultTable result={preview} />
            </div>
          )}

          <div className="card flex items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-bg-soft text-[16px]">
                🎓
              </span>
              <div>
                <p className="text-[13.5px] font-semibold">¿Listo para practicar?</p>
                <p className="text-[12px] text-ink-sub">
                  Pon a prueba lo aprendido con retos por dificultad.
                </p>
              </div>
            </div>
            <Link
              href="/challenges"
              className="inline-flex items-center gap-1.5 rounded-apple bg-ink px-4 py-2.5 text-[13px] font-semibold text-[rgb(var(--bg))] ring-focus hover:opacity-90"
            >
              Ir a retos
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
