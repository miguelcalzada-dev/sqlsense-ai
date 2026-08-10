# SQLSense AI

> Aprende SQL hablando con IA. Traduce lenguaje natural ⇄ SQL y experimenta con un laboratorio de base de datos efímero que vive en tu navegador.

SQLSense AI es una aplicación web que combina **LLM**, **SQLite compilado a WebAssembly** y **diseño estilo Apple** para enseñar SQL. Describe lo que necesitas en español y obtienes el SQL equivalente, explicado paso a paso y ejecutado contra una base de datos de ejemplo. Pega un SQL y la IA te lo explica en lenguaje natural. Todo en una sesión efímera: al recargar la pestaña, la base de datos vuelve a su estado inicial.

![stack](https://img.shields.io/badge/Next.js-14-black) ![ts](https://img.shields.io/badge/TypeScript-5-blue) ![wasm](https://img.shields.io/badge/SQLite-WASM-orange)

---

## ✨ Funcionalidades

- **Lenguaje natural → SQL** — describe una consulta y obtén SQL válido + ejecución inmediata.
- **SQL → lenguaje natural** — pega una consulta y recibe su explicación (tablas, pasos, pregunta equivalente).
- **Explicación paso a paso** — cada cláusula (`SELECT`, `JOIN`, `WHERE`, `GROUP BY`...) se razona como un tutor.
- **Laboratorio efímero** — base de datos SQLite en WebAssembly que vive solo en la sesión del navegador.
- **Editor SQL libre** — escribe, ejecuta (`⌘/Ctrl + Enter`), y modifica con `INSERT` / `UPDATE` / `DELETE` sin riesgo.
- **Restablecer con un clic** — vuelve al estado inicial cuando quieras; al recargar también.
- **Visor de esquema y tablas** — explora la base de datos del concesionario.
- **8 retos guiados** con validación automática y dificultad creciente.
- **Modo dual IA** — usa OpenAI si hay `OPENAI_API_KEY`, o un **motor local basado en patrones** como respaldo (la demo funciona sin clave).
- **Diseño Apple** — tipografía SF, glassmorphism, dark mode, micro-interacciones con Framer Motion.

## 🧠 Por qué es una pieza de IA interesante

- **Bidireccionalidad:** no es solo un generador; también explica e invierte el proceso.
- **IA como tutor:** razona cada cláusula, no actúa como caja negra.
- **Seguridad por diseño:** al LLM solo se le envía el **esquema**, nunca los datos del usuario.
- **Resiliencia:** degrada con elegancia a un motor local cuando no hay clave API, de forma que la demo en vivo sigue siendo funcional.
- **Prompting estructurado:** salida JSON estricta + autoreparación cuando el SQL generado no compila.

## 🗄️ Base de datos de laboratorio

Un concesionario con cuatro tablas y datos sintéticos deterministas:

```
marcas(id, nombre, pais)
coches(id, modelo, marca_id → marcas.id, color, anio, precio)
clientes(id, nombre, email, ciudad)
ventas(id, coche_id → coches.id, cliente_id → clientes.id, fecha, precio_venta)
```

~50 coches · ~30 clientes · ~120 ventas (2018–2024). Vuelve a este estado al reiniciar.

## 🏗️ Arquitectura

```
Navegador (Next.js / React)
  └─ sql.js (SQLite WASM) ── base de datos efimera en memoria
API Routes (Node serverless)
  └─ OpenAI gpt-4o-mini  ──  con respaldo a motor local basado en patrones
```

- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS + Framer Motion + Zustand.
- **Base de datos:** [sql.js](https://github.com/sql-js/sql.js) — SQLite compilado a WebAssembly, ejecutado 100% en el cliente.
- **IA:** OpenAI (`gpt-4o-mini`) vía API route serverless, con fallback determinista.
- **Cero estado servidor:** la base de datos nunca toca el backend.

## ⌨️ Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 14 · TypeScript |
| Estilos | Tailwind CSS · cristal/glassmorphism estilo Apple |
| Animación | Framer Motion |
| Estado | Zustand |
| Base de datos | sql.js (SQLite WASM) |
| IA | OpenAI · motor local de respaldo |
| Icons | Lucide |
| Deploy | Railway |

## 🚀 Puesta en marcha

```bash
npm install
npm run dev          # http://localhost:3000
```

Build de producción:

```bash
npm run build
npm start
```

### Variables de entorno (opcional)

```bash
# Sin esta variable, la app usa el motor local de patrones.
OPENAI_API_KEY=sk-...
```

## 📚 Uso

1. **Preguntar** — escribe en lenguaje natural (ej. *"¿Cuántos coches rojos se vendieron en 2019?"*).
2. **Explicar SQL** — pega una consulta y obtén su descripción en lenguaje natural.
3. **Editor libre** — escribe y ejecuta SQL; modifícalo y re-ejecútalo.
4. **Retos** — practica con validación automática.

## 🛠️ Estructura

```
app/
  page.tsx              # Landing con hero animado
  lab/                  # Laboratorio NL⇄SQL + editor
  challenges/           # Retos guiados
  docs/                 # Guía rápida
  api/translate|explain|teach/   # Endpoints IA
components/
  sql/                  # SqlEditor, ResultTable, SchemaViewer
  Navbar.tsx · ThemeProvider.tsx
lib/
  db/                   # sql.js · esquema · seed
  ai/                   # prompts · client OpenAI · motor local
  challenges.ts · sql-highlight.ts
```

## 👤 Autor

**Miguel Calzada** — [github.com/miguelcalzada-dev](https://github.com/miguelcalzada-dev)

Proyecto de portfolio enfocado en **IA aplicada**.