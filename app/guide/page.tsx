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
  { id: "intro", title: "Empezando", emoji: "🌱", desc: "Que es SQL, como se organiza y por donde empezar.", icon: BookOpen, topic: "intro" },
  { id: "select", title: "SELECT & FROM", emoji: "📥", desc: "Leer datos. La base de todo.", icon: Layers, topic: "select" },
  { id: "where", title: "WHERE & filtros", emoji: "🎯", desc: "Quedarte solo con las filas que interesan.", icon: Filter, topic: "where" },
  { id: "join", title: "JOIN", emoji: "🔗", desc: "Combinar varias tablas en un solo resultado.", icon: GitBranch, topic: "join" },
  { id: "group", title: "GROUP BY & HAVING", emoji: "🧮", desc: "Agrupar y agregar: contar, sumar, promediar.", icon: Group, topic: "group by" },
  { id: "order", title: "ORDER BY & LIMIT", emoji: "↕️", desc: "Ordenar y limitar los resultados.", icon: ListOrdered, topic: "order by" },
  { id: "aggregates", title: "Agregaciones", emoji: "∑", desc: "COUNT, SUM, AVG, MIN, MAX en detalle.", icon: Hash, topic: "aggregates" },
  { id: "window", title: "Window functions", emoji: "🪟", desc: "Rankings, medias moviles y particiones.", icon: TrendingUp, topic: "window" },
];

const STATIC_CONTENT: Record<string, { summary: string; sql: string; desc: string }[]> = {
  intro: [
    { summary: "SQL (Structured Query Language) es el lenguaje para hablar con bases de datos relacionales. Sus tablas son como hojas de calculo con filas y columnas, pero conectadas entre si por claves.", sql: "SELECT 'Hola SQL' AS saludo;", desc: "Tu primera consulta. Devuelve una fila construida al vuelo." },
    { summary: "El esquema del laboratorio es un concesionario: marcas, coches, clientes y ventas. Cada venta conecta un coche y un cliente mediante claves foraneas.", sql: "SELECT name FROM sqlite_master WHERE type='table';", desc: "Inspecciona las tablas que existen en la base de datos." },
  ],
  select: [
    { summary: "SELECT elige que columnas mostrar; FROM indica de que tabla. El asterisco (*) trae todas las columnas.", sql: "SELECT modelo, precio FROM coches LIMIT 5;", desc: "Proyeccion: solo las columnas que te interesan." },
    { summary: "Puedes renombrar columnas con AS, calcular expresiones y formatear salidas.", sql: "SELECT modelo, precio, ROUND(precio/1000, 1) AS miles FROM coches LIMIT 5;", desc: "Columnas calculadas y alias." },
  ],
  where: [
    { summary: "WHERE filtra filas segun una condicion. Soporta =, <>, <, >, <=, >=, AND, OR, NOT, BETWEEN, IN, LIKE e IS NULL.", sql: "SELECT * FROM coches WHERE color = 'Rojo' AND anio >= 2022;", desc: "Combina condiciones con AND/OR." },
    { summary: "LIKE busca por patron: % cualquier secuencia, _ un caracter concreto.", sql: "SELECT * FROM coches WHERE modelo LIKE 'M%';", desc: "Modelos que empiezan por 'M'." },
  ],
  join: [
    { summary: "INNER JOIN devuelve solo filas que coinciden en ambas tablas, segun una condicion de cruce.", sql: "SELECT c.modelo, m.nombre AS marca FROM coches c JOIN marcas m ON c.marca_id = m.id LIMIT 8;", desc: "Cada coche con el nombre de su marca." },
    { summary: "LEFT JOIN conserva todas las filas de la tabla izquierda y rellena con NULL cuando no hay coincidencia.", sql: "SELECT c.id, c.modelo, v.id AS venta_id FROM coches c LEFT JOIN ventas v ON v.coche_id = c.id WHERE v.id IS NULL;", desc: "Coches que nunca se han vendido." },
  ],
  group: [
    { summary: "GROUP BY agrupa filas con el mismo valor. Se combina con funciones de agregacion (COUNT, SUM, AVG...).", sql: "SELECT m.nombre, COUNT(v.id) AS ventas FROM marcas m JOIN coches c ON c.marca_id = m.id JOIN ventas v ON v.coche_id = c.id GROUP BY m.nombre ORDER BY ventas DESC;", desc: "Ventas por marca." },
    { summary: "HAVING filtra grupos despues de agrupar. WHERE filtra filas antes; HAVING filtra grupos despues.", sql: "SELECT m.nombre, COUNT(v.id) AS ventas FROM marcas m JOIN coches c ON c.marca_id = m.id JOIN ventas v ON v.coche_id = c.id GROUP BY m.nombre HAVING COUNT(v.id) > 5;", desc: "Solo marcas con mas de 5 ventas." },
  ],
  order: [
    { summary: "ORDER BY ordena por una o varias columnas, ASC (por defecto) o DESC.", sql: "SELECT * FROM coches ORDER BY precio DESC LIMIT 5;", desc: "Los 5 coches mas caros." },
    { summary: "LIMIT restringe el numero de filas; OFFSET salta las primeras N.", sql: "SELECT * FROM ventas ORDER BY fecha DESC LIMIT 10 OFFSET 0;", desc: "Las 10 ventas mas recientes (pagina 1)." },
  ],
  aggregates: [
    { summary: "COUNT cuenta filas. COUNT(*) cuenta todo; COUNT(col) ignora NULL en col.", sql: "SELECT COUNT(*) AS total, COUNT(DISTINCT color) AS colores FROM coches;", desc: "Total de coches y cuantos colores distintos hay." },
    { summary: "SUM suma, AVG promedia, MAX/MIN devuelven extremos.", sql: "SELECT AVG(precio) AS media, MIN(precio) AS minimo, MAX(precio) AS maximo FROM coches;", desc: "Estadisticas de precios." },
  ],
  window: [
    { summary: "ROW_NUMBER() OVER (...) numeriza filas segun un orden. PARTITION BY reinicia el contador por grupo.", sql: "SELECT v.id, cl.nombre, v.precio_venta, ROW_NUMBER() OVER (PARTITION BY v.cliente_id ORDER BY v.fecha) AS n FROM ventas v JOIN clientes cl ON v.cliente_id = cl.id LIMIT 12;", desc: "Numero de venta de cada cliente por orden cronologico." },
    { summary: "ROWS BETWEEN ... PRECEDING AND ... FOLLOWING define ventanas deslizantes para medias moviles.", sql: "SELECT v.id, v.precio_venta, ROUND(AVG(v.precio_venta) OVER (ORDER BY v.id ROWS 2 PRECEDING), 1) AS media_movil FROM ventas v LIMIT 15;", desc: "Media movil de las ultimas 3 ventas." },
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
        const res = await fetch("/sqlsense/api/teach", {
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

  useEffect(() => { void fetchTeach(activeTopic); }, [activeTopic, fetchTeach]);

  const staticContent = STATIC_CONTENT[activeTopic.id] ?? [];

  const runExample = (sql: string) => {
    if (status !== "ready") return;
    setPreview(execute(sql));
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <header className="mb-8 border-b-4 border-line pb-6">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center border-4 border-line bg-accent-4 shadow-brutal">
            <BookOpen className="h-6 w-6 text-white" strokeWidth={2.5} />
          </span>
          <h1 className="font-heading text-4xl uppercase">Guia</h1>
        </div>
        <p className="mt-3 max-w-2xl font-mono text-xs uppercase tracking-wider text-sub">
          Aprende SQL de forma visual: cada concepto se explica con ejemplos
          ejecutables que puedes lanzar contra la base de datos del laboratorio.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="card p-3 lg:sticky lg:top-28 lg:self-start">
          <div className="px-2 py-2 font-mono text-xs font-bold uppercase tracking-wider">
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
                      "flex w-full items-center gap-2.5 border-2 px-2.5 py-2.5 text-left transition-all",
                      isActive
                        ? "border-line bg-bg-soft shadow-brutal-sm"
                        : "border-transparent hover:border-line hover:bg-bg-soft/50",
                    )}
                  >
                    <span className="grid h-8 w-8 shrink-0 place-items-center border-2 border-line bg-bg-soft text-sm">
                      {t.emoji}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-mono text-xs font-bold uppercase tracking-wider">{t.title}</span>
                    </span>
                    <Icon className="h-3.5 w-3.5 opacity-40" />
                  </button>
                </li>
              );
            })}
          </ul>
          <Link prefetch={false}
            href="/lab"
            className="mt-4 flex items-center justify-center gap-2 brutal-btn brutal-btn-primary !text-xs w-full"
          >
            <TerminalSquare className="h-4 w-4" />
            Practicar en el laboratorio
          </Link>
        </aside>

        <section className="space-y-6">
          <div className="card p-6">
            <div className="flex items-center gap-4">
              <span className="grid h-14 w-14 place-items-center border-4 border-line bg-bg-soft text-2xl shadow-brutal-sm">
                {activeTopic.emoji}
              </span>
              <div>
                <h2 className="font-heading text-2xl uppercase">{activeTopic.title}</h2>
                <p className="font-mono text-xs uppercase tracking-wider text-sub">{activeTopic.desc}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {staticContent.map((c, i) => (
              <article key={i} className="card p-5">
                <p className="font-body text-sm leading-relaxed text-ink-soft">
                  {c.summary}
                </p>
                <div className="mt-3">
                  <CodeBlock code={c.sql} title="Ejemplo" />
                </div>
                <p className="mt-3 font-mono text-xs uppercase tracking-wider text-sub">
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
                className="card grid place-items-center gap-3 py-12"
              >
                <Loader2 className="h-5 w-5 animate-spin" />
                <p className="font-mono text-xs uppercase tracking-wider">
                  La IA esta preparando el tema...
                </p>
              </motion.div>
            ) : error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="card border-accent-3 p-5 font-mono text-xs uppercase tracking-wider text-accent-3"
              >
                {error}
              </motion.div>
            ) : aiContent ? (
              <motion.div
                key="ai"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-6"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  <h3 className="font-heading text-lg uppercase">
                    Explicacion de la IA
                  </h3>
                  <span
                    className={cn(
                      "ml-auto pill",
                      aiContent.source === "openai"
                        ? "!bg-accent-2 !text-white"
                        : "",
                    )}
                  >
                    {aiContent.source === "openai" ? "OpenAI" : "Local"}
                  </span>
                </div>
                <p className="mt-4 font-body text-sm leading-relaxed text-ink-soft">
                  {aiContent.summary}
                </p>

                {aiContent.concepts.length > 0 && (
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {aiContent.concepts.map((c, i) => (
                      <div
                        key={i}
                        className="border-2 border-line bg-bg-soft p-4 shadow-brutal-sm"
                      >
                        <div className="font-mono text-xs font-bold uppercase text-accent-2">
                          {c.term}
                        </div>
                        <p className="mt-1 font-body text-xs text-sub">
                          {c.definition}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {aiContent.examples.length > 0 && (
                  <div className="mt-5 space-y-4">
                    {aiContent.examples.map((ex, i) => (
                      <div key={i}>
                        <CodeBlock code={ex.sql} title={`Ejemplo ${i + 1}`} />
                        <p className="mt-2 font-mono text-xs uppercase tracking-wider text-sub">
                          <Lightbulb className="mr-1 inline h-3 w-3 text-accent-5" />
                          {ex.desc}
                        </p>
                        <Button
                          variant="secondary"
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
              <div className="mb-3 flex items-center gap-2 font-mono text-sm font-bold uppercase tracking-wider">
                <Database className="h-4 w-4" />
                Resultado en el laboratorio
                <Link prefetch={false}
                  href="/lab"
                  className="ml-auto inline-flex items-center gap-1 font-mono text-xs font-bold uppercase tracking-wider text-accent hover:underline"
                >
                  Abrir editor
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <ResultTable result={preview} />
            </div>
          )}

          <div className="card flex items-center justify-between gap-4 p-5">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center border-4 border-line bg-bg-soft text-xl shadow-brutal-sm">
                🎓
              </span>
              <div>
                <p className="font-heading text-lg uppercase">Listo para practicar?</p>
                <p className="font-mono text-xs uppercase tracking-wider text-sub">
                  Pon a prueba lo aprendido con retos por dificultad.
                </p>
              </div>
            </div>
            <Link prefetch={false}
              href="/challenges"
              className="brutal-btn brutal-btn-primary !text-xs"
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
