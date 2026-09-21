"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Brain,
  Database,
  PlayCircle,
  Sparkles,
  Terminal,
  Trophy,
  Wand2,
  Zap,
} from "lucide-react";
import { motion, type Transition } from "framer-motion";
import CodeBlock from "@/components/ui/CodeBlock";
import { CHALLENGES } from "@/lib/challenges";

const FEATURES = [
  {
    icon: Wand2,`n    color: "var(--accent)",`n    iconColor: "#ffffff",
    title: "Lenguaje natural a SQL",
    desc: "Describe lo que necesitas en español y obtén SQL ejecutable al instante.",
  },
  {
    icon: Database,`n    color: "var(--accent-2)",`n    iconColor: "#ffffff",
    title: "Laboratorio efímero",
    desc: "SQLite en WebAssembly vive en tu pestaña. Escribe, ejecuta y reinicia sin riesgo.",
  },
  {
    icon: Brain,`n    color: "var(--accent-4)",`n    iconColor: "#ffffff",
    title: "IA como tutor",
    desc: "Cada cláusula se razona paso a paso. Aprende el porqué, no solo el qué.",
  },
  {
    icon: Trophy,`n    color: "var(--accent-5)",`n    iconColor: "#111111",
    title: `${CHALLENGES.length} retos por dificultad`,
    desc: "De Principiante a Experto, con window functions y self-joins.",
  },
];

const STEPS = [
  {
    n: "01",
    icon: Sparkles,
    title: "Pregunta en español",
    desc: "Describe la consulta que necesitas como si le hablaras a una persona.",
  },
  {
    n: "02",
    icon: Terminal,
    title: "Ejecuta en el laboratorio",
    desc: "El SQL se ejecuta contra una base de datos real que vive en tu navegador.",
  },
  {
    n: "03",
    icon: BookOpen,
    title: "Aprende con la guía",
    desc: "La IA explica cada cláusula y la guía te da el contexto que necesitas.",
  },
];

const fade: {
  initial: { opacity: number; y: number };
  whileInView: { opacity: number; y: number };
  viewport: { once: boolean; margin: string };
  transition: Transition;
} = {
  initial: { opacity: 0, y: 10 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
};

export default function LandingPage() {
  return (
    <div className="relative">
      <Hero />
      <Marquee />
      <Features />
      <HowItWorks />
      <CTA />
    </div>
  );
}

function Hero() {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-12 pb-20 sm:pt-20">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center text-center"
      >
        <span className="pill anim-fade-up">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-pulse rounded-full bg-accent" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          SQLite WASM · IA local + OpenAI
        </span>

        <h1 className="mt-8 max-w-5xl font-heading text-5xl leading-[1.05] tracking-tight sm:text-7xl uppercase">
          Aprende SQL
          <br />
          hablando con{" "}
          <span className="inline-block bg-accent text-surface border-4 border-line px-3 sm:px-5 shadow-brutal">
            IA
          </span>
        </h1>

        <p className="mt-6 max-w-2xl font-mono text-sm uppercase tracking-wider text-sub">
          Traduce lenguaje natural a SQL, ejecútalo contra una base de datos real y
          entiende cada cláusula paso a paso. Sin servidores, sin riesgo, sin fricción.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <Link
            href="/lab"
            className="brutal-btn brutal-btn-primary group"
          >
            Abrir el laboratorio
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/guide"
            className="brutal-btn brutal-btn-secondary"
          >
            <PlayCircle className="h-4 w-4" />
            Ver la guía
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-3 gap-4 max-w-2xl">
          <div className="card p-4 text-center">
            <div className="font-heading text-3xl text-accent">4</div>
            <div className="font-mono text-xs uppercase tracking-wider text-sub mt-1">Tablas</div>
          </div>
          <div className="card p-4 text-center">
            <div className="font-heading text-3xl text-accent-2">24</div>
            <div className="font-mono text-xs uppercase tracking-wider text-sub mt-1">Retos</div>
          </div>
          <div className="card p-4 text-center">
            <div className="font-heading text-3xl text-accent-4">∞</div>
            <div className="font-mono text-xs uppercase tracking-wider text-sub mt-1">Consultas</div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="relative mx-auto mt-16 max-w-4xl"
      >
        <div className="card p-0 overflow-hidden">
          <div className="flex items-center gap-2 border-b-4 border-line bg-bg-soft px-4 py-3">
            <span className="h-3 w-3 bg-accent-3 border border-line" />
            <span className="h-3 w-3 bg-accent-5 border border-line" />
            <span className="h-3 w-3 bg-accent-4 border border-line" />
            <span className="ml-3 font-mono text-xs font-bold uppercase tracking-wider">
              sqlsense — laboratorio
            </span>
            <span className="ml-auto flex items-center gap-1 font-mono text-xs font-bold uppercase tracking-wider">
              <Zap className="h-3 w-3" /> WASM
            </span>
          </div>
          <div className="grid gap-0 sm:grid-cols-2">
            <div className="border-b-4 border-line p-6 sm:border-b-0 sm:border-r-4">
              <p className="font-mono text-xs font-bold uppercase tracking-wider text-sub">
                Tú preguntas
              </p>
              <p className="mt-3 font-body text-lg">
                &laquo;¿Cuál es la marca con más ventas?&raquo;
              </p>
              <div className="mt-4 flex items-center gap-2 font-mono text-xs font-bold uppercase text-accent">
                <ArrowRight className="h-4 w-4" />
                generando...
              </div>
            </div>
            <div className="p-6">
              <p className="font-mono text-xs font-bold uppercase tracking-wider text-sub">
                SQLSense responde
              </p>
              <div className="mt-3">
                <CodeBlock
                  showCopy={false}
                  code={`SELECT m.nombre AS marca,\n       COUNT(v.id) AS ventas\nFROM marcas m\nJOIN coches c ON c.marca_id = m.id\nJOIN ventas v ON v.coche_id = c.id\nGROUP BY m.nombre\nORDER BY ventas DESC\nLIMIT 1;`}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function Marquee() {
  const items = [
    "SELECT", "WHERE", "JOIN", "GROUP BY", "HAVING", "ORDER BY",
    "LIMIT", "DISTINCT", "CASE", "WINDOW", "ROW_NUMBER", "STRFTIME",
    "AVG", "COUNT", "SUM", "LEFT JOIN", "OVER", "PARTITION BY",
  ];
  return (
    <div className="relative overflow-hidden border-y-4 border-line bg-bg-soft py-4">
      <div className="mask-fade-x relative flex">
        <div className="flex shrink-0 animate-marquee items-center gap-8 pr-8">
          {[...items, ...items].map((k, i) => (
            <span
              key={i}
              className="font-mono text-sm font-bold uppercase tracking-wider"
            >
              {k}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function Features() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20">
      <motion.div {...fade} className="mx-auto max-w-2xl text-center">
        <h2 className="font-heading text-4xl uppercase sm:text-5xl">
          Una caja de arena de IA para SQL
        </h2>
        <p className="mt-4 font-mono text-xs uppercase tracking-wider text-sub">
          Todo lo que necesitas para pasar de leer SQL a escribirlo con confianza.
        </p>
      </motion.div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {FEATURES.map((f, i) => {
          const Icon = f.icon;
          return (
            <motion.div
              key={f.title}
              {...fade}
              transition={{ ...fade.transition, delay: i * 0.05 }}
              className="card p-6"
            >
              <div
                className="grid h-12 w-12 place-items-center border-2 border-line shadow-brutal-sm"
                style={{ backgroundColor: f.color }}
              >
                <Icon className="h-5 w-5" strokeWidth={2.5} style={{ color: f.iconColor }} />
              </div>
              <h3 className="mt-5 font-heading text-xl uppercase">{f.title}</h3>
              <p className="mt-2 font-body text-sm text-sub">
                {f.desc}
              </p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20">
      <motion.div {...fade} className="mx-auto max-w-2xl text-center">
        <h2 className="font-heading text-4xl uppercase sm:text-5xl">
          Tres pasos. Cero fricción.
        </h2>
        <p className="mt-4 font-mono text-xs uppercase tracking-wider text-sub">
          No instalas nada. No configuras nada. Solo abres y empiezas.
        </p>
      </motion.div>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.n}
              {...fade}
              transition={{ ...fade.transition, delay: i * 0.08 }}
              className="card p-6 relative"
            >
              <span className="absolute right-4 top-4 font-mono text-4xl font-bold text-line/20">
                {s.n}
              </span>
              <div className="grid h-11 w-11 place-items-center border-2 border-line bg-accent shadow-brutal-sm">
                <Icon className="h-5 w-5 text-white" strokeWidth={2.5} />
              </div>
              <h3 className="mt-5 font-heading text-lg uppercase">{s.title}</h3>
              <p className="mt-2 font-body text-sm text-sub">
                {s.desc}
              </p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20">
      <motion.div
        {...fade}
        className="card-accent p-12 text-center sm:p-16"
      >
        <h2 className="mx-auto max-w-xl font-heading text-4xl uppercase sm:text-5xl">
          ¿Listo para hablar SQL?
        </h2>
        <p className="mx-auto mt-5 max-w-md font-mono text-xs uppercase tracking-wider text-sub">
          Sin cuentas, sin servidores. Tu primera consulta está lista en menos de
          cinco segundos.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/lab"
            className="brutal-btn brutal-btn-primary group"
          >
            Empezar ahora
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/challenges"
            className="brutal-btn brutal-btn-secondary"
          >
            <Trophy className="h-4 w-4" />
            Retos
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
