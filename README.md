# SQLSense AI

[![CI](https://github.com/miguelcalzada-dev/sqlsense-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/miguelcalzada-dev/sqlsense-ai/actions/workflows/ci.yml)
[![Live](https://img.shields.io/badge/demo-miguelcalzada.com%2Fsqlsense-ec4899?style=flat-square)](https://miguelcalzada.com/sqlsense)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![SQLite WASM](https://img.shields.io/badge/SQLite-WebAssembly-003B57?style=flat-square&logo=sqlite)](https://sql.js.org)
[![License: MIT](https://img.shields.io/badge/license-MIT-green?style=flat-square)](./LICENSE)

> Aprende SQL hablando con IA. Traduce lenguaje natural ↔ SQL y experimenta con un laboratorio de base de datos efímero que vive en tu navegador.

**SQLSense AI** combina **LLM**, **SQLite compilado a WebAssembly** y un diseño limpio para enseñar SQL. Describe lo que necesitas en español y obtienes el SQL equivalente, explicado paso a paso y ejecutado contra una base de datos de ejemplo. Pega un SQL y la IA te lo explica en lenguaje natural. Todo en una sesión efímera: al recargar la pestaña, la base de datos vuelve a su estado inicial.

**Demo en producción:** <https://miguelcalzada.com/sqlsense>

---

## Tabla de contenidos

- [Funcionalidades](#funcionalidades)
- [Por qué es una pieza de IA interesante](#por-qué-es-una-pieza-de-ia-interesante)
- [Base de datos de laboratorio](#base-de-datos-de-laboratorio)
- [Arquitectura](#arquitectura)
- [Stack tecnológico](#stack-tecnológico)
- [Puesta en marcha](#puesta-en-marcha)
- [Variables de entorno](#variables-de-entorno)
- [Estructura](#estructura)
- [Autor](#autor)
- [Licencia](#licencia)

---

## Funcionalidades

- **Lenguaje natural → SQL** — describe una consulta y obtén SQL válido con ejecución inmediata.
- **SQL → lenguaje natural** — pega una consulta y recibe su explicación (tablas, pasos, pregunta equivalente).
- **Explicación paso a paso** — cada cláusula (`SELECT`, `JOIN`, `WHERE`, `GROUP BY`...) se razona como un tutor.
- **Laboratorio efímero** — base de datos SQLite en WebAssembly que vive solo en la sesión del navegador.
- **Editor SQL libre** — escribe, ejecuta (`Ctrl/⌘ + Enter`) y modifica con `INSERT` / `UPDATE` / `DELETE` sin riesgo.
- **Restablecer con un clic** — vuelve al estado inicial cuando quieras; al recargar también.
- **Visor de esquema y tablas** — explora la base de datos del concesionario.
- **Retos guiados** con validación automática y dificultad creciente.
- **Modo dual IA** — usa OpenAI si hay `OPENAI_API_KEY`, o un **motor local basado en patrones** como respaldo (la demo funciona sin clave).
- **Rate limiting** en las rutas de IA para proteger la cuota de OpenAI.

## Por qué es una pieza de IA interesante

- **Bidireccionalidad:** no es solo un generador; también explica e invierte el proceso.
- **IA como tutor:** razona cada cláusula, no actúa como caja negra.
- **Seguridad por diseño:** al LLM solo se le envía el **esquema**, nunca los datos del usuario; el SQL se ejecuta 100% en el cliente.
- **Resiliencia:** degrada con elegancia a un motor local cuando no hay clave API, de modo que la demo en vivo sigue siendo funcional.
- **Prompting estructurado:** salida JSON estricta con auto-reparación cuando el SQL generado no compila.

## Base de datos de laboratorio

Un concesionario con cuatro tablas y datos sintéticos deterministas:

```text
marcas(id, nombre, pais)
coches(id, modelo, marca_id → marcas.id, color, anio, precio)
clientes(id, nombre, email, ciudad)
ventas(id, coche_id → coches.id, cliente_id → clientes.id, fecha, precio_venta)
```

~50 coches · ~30 clientes · ~120 ventas (2018-2024). Vuelve a este estado al reiniciar.

## Arquitectura

```text
Navegador (Next.js / React)
  └── sql.js (SQLite WASM) ── base de datos efimera en memoria
API Routes (Node serverless)
  └── OpenAI gpt-4o-mini ── con respaldo a motor local basado en patrones
```

- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS + Framer Motion + Zustand.
- **Base de datos:** [sql.js](https://github.com/sql-js/sql.js) — SQLite compilado a WebAssembly, ejecutado 100% en el cliente. El binario se sirve desde `public/sql-wasm.wasm` (sin depender de un CDN externo), con fallback a jsDelivr.
- **IA:** OpenAI (`gpt-4o-mini`) vía API route serverless, con fallback determinista.
- **Cero estado servidor:** la base de datos nunca toca el backend.

## Stack tecnológico

| Capa | Tecnología |
| --- | --- |
| Framework | Next.js 14 · TypeScript |
| Estilos | Tailwind CSS |
| Animación | Framer Motion |
| Estado | Zustand |
| Base de datos | sql.js (SQLite WASM) |
| IA | OpenAI · motor local de respaldo |
| Iconos | Lucide |
| Deploy | Railway |

## Puesta en marcha

Requisitos: **Node.js 20+**.

```bash
npm install
npm run dev          # http://localhost:3000/sqlsense
```

Build de producción:

```bash
npm run build
npm start
```

> La aplicación se sirve bajo `basePath: /sqlsense`, por lo que en local la URL es `http://localhost:3000/sqlsense`.

### Scripts

| Script | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo. |
| `npm run build` | Build de producción. |
| `npm start` | Sirve el build de producción. |
| `npm run lint` | Análisis estático con ESLint. |
| `npm run typecheck` | Verificación de tipos con TypeScript. |

## Variables de entorno

Todas son opcionales (ver [`.env.example`](./.env.example)):

```bash
# Sin esta variable, la app usa el motor local de patrones.
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini

# Rate limit de las API routes de IA
AI_RATE_LIMIT_MAX=20
AI_RATE_LIMIT_WINDOW_MS=60000
```

## Uso

1. **Preguntar** — escribe en lenguaje natural (ej. *"¿Cuántos coches rojos se vendieron en 2019?"*).
2. **Explicar SQL** — pega una consulta y obtén su descripción en lenguaje natural.
3. **Editor libre** — escribe y ejecuta SQL; modifícalo y re-ejecútalo.
4. **Retos** — practica con validación automática.

## Estructura

```text
app/
  page.tsx                        # Landing con hero animado
  lab/                            # Laboratorio NL<->SQL + editor
  challenges/                     # Retos guiados
  data/ · guide/                  # Esquema y guía rápida
  api/translate|explain|teach/    # Endpoints IA (con rate limiting)
components/
  sql/                            # SqlEditor, ResultTable, SchemaViewer...
lib/
  db/                             # sql.js · esquema · seed
  ai/                             # prompts · cliente OpenAI · motor local · rate limit
  challenges.ts · sql-highlight.ts
public/
  sql-wasm.wasm                   # Binario SQLite WASM autoalojado
```

## Autor

**Miguel Ángel Calzada Martín** — Software Developer · IA & Big Data

- GitHub: [@miguelcalzada-dev](https://github.com/miguelcalzada-dev)
- Web: [miguelcalzada.com](https://miguelcalzada.com)

## Licencia

Distribuido bajo licencia **MIT**. Consulta [LICENSE](./LICENSE) para más información.
