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
    icon: Wand2,
    title: "Lenguaje natural a SQL",
    desc: "Describe lo que necesitas en español y obtén SQL ejecutable al instante. Pega SQL y recibe su explicación.",
    color: "rgb(var(--accent))",
  },
  {
    icon: Database,
    title: "Laboratorio efímero",
    desc: "SQLite en WebAssembly vive en tu pestaña. Escribe, ejecuta y reinicia sin riesgo.",
    color: "rgb(var(--accent-2))",
  },
  {
    icon: Brain,
    title: "IA como tutor",
    desc: "Cada cláusula se razona paso a paso. Aprende el porqué, no solo el qué.",
    color: "rgb(var(--accent-4))",
  },
  {
    icon: Trophy,
    title: `${CHALLENGES.length} retos por dificultad`,
    desc: "De Principiante a Experto, con window functions y self-joins. Validación automática.",
    color: "rgb(var(--accent-5))",
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
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
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
    <section className="relative mx-auto max-w-7xl px-4 pt-16 pb-24 sm:pt-24">
      <div className="grid-bg pointer-events-none absolute inset-x-0 top-0 -z-10 h-[500px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center text-center"
      >
        <span className="pill anim-fade-up text-ink-sub">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-accent" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          SQLite WASM · IA local + OpenAI
        </span>

        <h1 className="mt-8 max-w-5xl text-balance text-[48px] font-bold leading-[1.05] tracking-tight sm:text-[76px]">
          Aprende SQL{" "}
          <span className="text-gradient">hablando con IA</span>
        </h1>

        <p className="mt-6 max-w-2xl text-balance text-[17px] leading-relaxed text-ink-sub sm:text-[19px]">
          Traduce lenguaje natural a SQL, ejecútalo contra una base de datos real y
          entiende cada cláusula paso a paso. Sin servidores, sin riesgo, sin fricción.
        </p>

        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
          <Link
            href="/lab"
            className="group inline-flex h-13 items-center gap-2 rounded-full bg-gradient-to-r from-accent to-accent2 px-7 text-[15px] font-semibold text-white ring-focus transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-accent/20 active:scale-[0.98]"
          >
            Abrir el laboratorio
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/guide"
            className="inline-flex h-13 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-7 text-[15px] font-semibold text-ink ring-focus transition-colors hover:bg-white/10"
          >
            <PlayCircle className="h-4 w-4" />
            Ver la guía
          </Link>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="relative mx-auto mt-20 max-w-4xl"
      >
        <div className="card overflow-hidden p-0 shadow-xl border-white/[0.06]">
          <div className="flex items-center gap-2 border-b border-white/[0.06] bg-white/[0.02] px-4 py-2.5">
            <span className="h-3 w-3 rounded-full bg-accent3/70" />
            <span className="h-3 w-3 rounded-full bg-accent5/70" />
            <span className="h-3 w-3 rounded-full bg-accent4/70" />
            <span className="ml-2 font-mono text-[11.5px] text-ink-sub">
              sqlsense — laboratorio
            </span>
            <span className="ml-auto flex items-center gap-1 text-[11px] text-ink-sub">
              <Zap className="h-3 w-3 text-accent" /> WASM
            </span>
          </div>
          <div className="grid gap-0 sm:grid-cols-2">
            <div className="border-b border-white/[0.06] p-5 sm:border-b-0 sm:border-r">
              <p className="text-[11px] uppercase tracking-wider text-ink-sub">
                Tú preguntas
              </p>
              <p className="mt-3 text-[15px] text-ink">
                &laquo;¿Cuál es la marca con más ventas?&raquo;
              </p>
              <div className="mt-4 flex items-center gap-1 text-[12px] text-accent">
                <ArrowRight className="h-3.5 w-3.5" />
                <span className="font-mono">generando...</span>
              </div>
            </div>
            <div className="p-5">
              <p className="text-[11px] uppercase tracking-wider text-ink-sub">
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

        <div
          aria-hidden
          className="pointer-events-none absolute -inset-x-10 -bottom-10 -z-10 h-40 bg-gradient-to-t from-accent/10 to-transparent blur-3xl"
        />
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
    <div className="relative overflow-hidden border-y border-white/5 bg-white/[0.02] py-3">
      <div className="mask-fade-x relative flex">
        <div className="flex shrink-0 animate-marquee items-center gap-8 pr-8">
          {[...items, ...items].map((k, i) => (
            <span
              key={i}
              className="font-mono text-[13px] font-medium text-ink-sub"
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
    <section className="mx-auto max-w-7xl px-4 py-24">
      <motion.div {...fade} className="mx-auto max-w-2xl text-center">
        <h2 className="text-balance text-[36px] font-bold tracking-tight sm:text-[48px]">
          Una caja de arena de IA para SQL
        </h2>
        <p className="mt-4 text-[16px] text-ink-sub">
          Todo lo que necesitas para pasar de leer SQL a escribirlo con confianza.
        </p>
      </motion.div>

      <div className="mt-14 grid gap-4 sm:grid-cols-2">
        {FEATURES.map((f, i) => {
          const Icon = f.icon;
          return (
            <motion.div
              key={f.title}
              {...fade}
              transition={{ ...fade.transition, delay: i * 0.05 }}
              className="card group relative overflow-hidden p-7 transition-all hover:-translate-y-0.5 hover:border-white/10"
            >
              <div
                className="absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-10 blur-2xl transition-opacity group-hover:opacity-25"
                style={{ background: f.color }}
              />
              <div
                className="grid h-12 w-12 place-items-center rounded-xl"
                style={{ background: `${f.color}1a`, color: f.color }}
              >
                <Icon className="h-5 w-5" strokeWidth={2.2} />
              </div>
              <h3 className="mt-5 text-[19px] font-semibold">{f.title}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-ink-sub">
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
    <section className="mx-auto max-w-7xl px-4 py-24">
      <motion.div {...fade} className="mx-auto max-w-2xl text-center">
        <h2 className="text-balance text-[36px] font-bold tracking-tight sm:text-[48px]">
          Tres pasos. Cero fricción.
        </h2>
        <p className="mt-4 text-[16px] text-ink-sub">
          No instalas nada. No configuras nada. Solo abres y empiezas.
        </p>
      </motion.div>

      <div className="mt-14 grid gap-4 md:grid-cols-3">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.n}
              {...fade}
              transition={{ ...fade.transition, delay: i * 0.08 }}
              className="card relative p-7 hover:border-white/10 transition-colors"
            >
              <span className="absolute right-5 top-4 font-mono text-[44px] font-bold text-white/[0.04]">
                {s.n}
              </span>
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-accent/10 text-accent">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-[18px] font-semibold">{s.title}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-ink-sub">
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
    <section className="mx-auto max-w-7xl px-4 py-24">
      <motion.div
        {...fade}
        className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-gradient-to-br from-surface to-bg-soft p-12 text-center shadow-xl sm:p-20"
      >
        <div className="grid-bg pointer-events-none absolute inset-0 -z-10 opacity-40" />
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-accent2/15 blur-3xl" />

        <h2 className="mx-auto max-w-xl text-balance text-[36px] font-bold tracking-tight sm:text-[52px]">
          ¿Listo para hablar SQL?
        </h2>
        <p className="mx-auto mt-5 max-w-md text-[16px] text-ink-sub">
          Sin cuentas, sin servidores. Tu primera consulta está lista en menos de
          cinco segundos.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/lab"
            className="group inline-flex h-13 items-center gap-2 rounded-full bg-gradient-to-r from-accent to-accent2 px-8 text-[15px] font-semibold text-white ring-focus transition-transform hover:scale-[1.02] hover:shadow-lg hover:shadow-accent/20"
          >
            Empezar ahora
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/challenges"
            className="inline-flex h-13 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-8 text-[15px] font-semibold text-ink ring-focus hover:bg-white/10"
          >
            <Trophy className="h-4 w-4" />
            Retos
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
