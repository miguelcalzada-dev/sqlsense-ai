import type { ExplainResponse, TeachResponse, TranslateResponse } from "./types";
import { SCHEMA } from "@/lib/db/schema";

function q(s: string): string {
  return s.replace(/'/g, "''");
}

function matchColor(text: string): string | null {
  const m = text.match(/\b(rojo|azul|verde|negro|blanco|gris|plata|amarillo|naranja)\b/i);
  if (!m) return null;
  return m[1].charAt(0).toUpperCase() + m[1].slice(1).toLowerCase();
}

function matchYear(text: string): number | null {
  const m = text.match(/\b(20\d{2})\b/);
  return m ? Number(m[1]) : null;
}

function matchMarca(text: string): string | null {
  const m = text.match(
    /\b(audi|bmw|mercedes|porsche|volkswagen|vw|tesla|toyota|honda|mazda|nissan|renault|peugeot|volvo|hyundai|kia)\b/i,
  );
  if (!m) return null;
  const map: Record<string, string> = {
    vw: "Volkswagen",
    audi: "Audi",
    bmw: "BMW",
    mercedes: "Mercedes",
    porsche: "Porsche",
    volkswagen: "Volkswagen",
    tesla: "Tesla",
    toyota: "Toyota",
    honda: "Honda",
    mazda: "Mazda",
    nissan: "Nissan",
    renault: "Renault",
    peugeot: "Peugeot",
    volvo: "Volvo",
    hyundai: "Hyundai",
    kia: "Kia",
  };
  return map[m[1].toLowerCase()];
}

function matchCiudad(text: string): string | null {
  const m = text.match(
    /\b(madrid|barcelona|valencia|sevilla|bilbao|málaga|malaga|zaragoza|murcia|palma|granada)\b/i,
  );
  return m ? m[1] : null;
}

function matchNumber(text: string): number | null {
  const m = text.match(/\b(\d{1,3})\b/);
  return m ? Number(m[1]) : null;
}

type Pattern = {
  test: (t: string) => boolean;
  build: (t: string) => TranslateResponse;
};

const PATTERNS: Pattern[] = [
  {
    test: (t) => /cu[aá]ntos?\s+coches/i.test(t),
    build: (t) => {
      const color = matchColor(t);
      const year = matchYear(t);
      const marca = matchMarca(t);
      let sql = "SELECT COUNT(*) AS total FROM coches";
      const conds: string[] = [];
      if (color) conds.push(`color = '${q(color)}'`);
      if (marca) {
        sql = `SELECT COUNT(*) AS total FROM coches c JOIN marcas m ON c.marca_id = m.id`;
        conds.push(`m.nombre = '${q(marca)}'`);
      }
      if (year) conds.push(`anio = ${year}`);
      const where = conds.length ? ` WHERE ${conds.join(" AND ")}` : "";
      return final(sql + where + ";", {
        summary: `Cuenta el número de coches${color ? ` de color ${color}` : ""}${marca ? ` de la marca ${marca}` : ""}${year ? ` del año ${year}` : ""}.`,
        steps: [
          { clause: "SELECT COUNT(*)", note: "Cuenta filas en coches" },
          ...(color ? [{ clause: "WHERE color", note: `Filtra por color ${color}` }] : []),
          ...(marca ? [{ clause: "JOIN marcas", note: `Une marcas para filtrar por ${marca}` }] : []),
        ],
        tables: ["coches", ...(marca ? ["marcas"] : [])],
      });
    },
  },
  {
    test: (t) => /precio\s+(medio|promedio|medio)/i.test(t) || /media\s+de\s+precio/i.test(t),
    build: (t) => {
      const marca = matchMarca(t);
      if (marca) {
        return final(
          `SELECT AVG(c.precio) AS precio_medio FROM coches c JOIN marcas m ON c.marca_id = m.id WHERE m.nombre = '${q(marca)}';`,
          {
            summary: `Precio medio de los coches de ${marca}.`,
            steps: [
              { clause: "SELECT AVG(precio)", note: "Promedia el precio" },
              { clause: "JOIN marcas", note: `Filtra por ${marca}` },
            ],
            tables: ["coches", "marcas"],
          },
        );
      }
      return final("SELECT AVG(precio) AS precio_medio FROM coches;", {
        summary: "Precio medio de todos los coches del catálogo.",
        steps: [{ clause: "SELECT AVG(precio)", note: "Promedia el precio de todos los coches" }],
        tables: ["coches"],
      });
    },
  },
  {
    test: (t) => /cu[aá]ntas\s+marcas/i.test(t) || /n[uú]mero\s+de\s+marcas/i.test(t),
    build: () =>
      final("SELECT COUNT(*) AS total FROM marcas;", {
        summary: "Cuenta cuántas marcas distintas hay en el catálogo.",
        steps: [{ clause: "SELECT COUNT(*)", note: "Cuenta filas de marcas" }],
        tables: ["marcas"],
      }),
  },
  {
    test: (t) => /cu[aá]ntas?\s+ventas/i.test(t) || /n[uú]mero\s+de\s+ventas/i.test(t),
    build: (t) => {
      const year = matchYear(t);
      if (year) {
        return final(`SELECT COUNT(*) AS total FROM ventas WHERE fecha LIKE '${year}%';`, {
          summary: `Cuenta las ventas del año ${year}.`,
          steps: [
            { clause: "SELECT COUNT(*)", note: "Cuenta ventas" },
            { clause: "WHERE fecha LIKE", note: `Filtra por el año ${year}` },
          ],
          tables: ["ventas"],
        });
      }
      return final("SELECT COUNT(*) AS total FROM ventas;", {
        summary: "Cuenta todas las ventas registradas.",
        steps: [{ clause: "SELECT COUNT(*)", note: "Cuenta filas de ventas" }],
        tables: ["ventas"],
      });
    },
  },
  {
    test: (t) => /marca\s+m[aá]s\s+vendida/i.test(t),
    build: () =>
      final(
        `SELECT m.nombre AS marca, COUNT(v.id) AS ventas FROM marcas m JOIN coches c ON c.marca_id = m.id JOIN ventas v ON v.coche_id = c.id GROUP BY m.nombre ORDER BY COUNT(v.id) DESC LIMIT 1;`,
        {
          summary: "Marca con más coches vendidos en el historial de ventas.",
          steps: [
            { clause: "JOIN", note: "Une marcas → coches → ventas" },
            { clause: "GROUP BY", note: "Agrupa por marca" },
            { clause: "ORDER BY COUNT DESC", note: "Ordena por número de ventas" },
            { clause: "LIMIT 1", note: "Toma la primera (la mayor)" },
          ],
          tables: ["marcas", "coches", "ventas"],
        },
      ),
  },
  {
    test: (t) => /(m[aá]s\s+caro|top\s+caro|coches?\s+m[aá]s\s+caros)/i.test(t),
    build: (t) => {
      const n = matchNumber(t) ?? 5;
      return final(`SELECT * FROM coches ORDER BY precio DESC LIMIT ${Math.min(n, 50)};`, {
        summary: `Los ${Math.min(n, 50)} coches más caros del catálogo.`,
        steps: [
          { clause: "ORDER BY precio DESC", note: "Ordena por precio descendente" },
          { clause: "LIMIT", note: `Toma los primeros ${Math.min(n, 50)}` },
        ],
        tables: ["coches"],
      });
    },
  },
  {
    test: (t) => /(m[aá]s\s+barato|coches?\s+m[aá]s\s+baratos)/i.test(t),
    build: (t) => {
      const n = matchNumber(t) ?? 5;
      return final(`SELECT * FROM coches ORDER BY precio ASC LIMIT ${Math.min(n, 50)};`, {
        summary: `Los ${Math.min(n, 50)} coches más baratos.`,
        steps: [
          { clause: "ORDER BY precio ASC", note: "Ordena por precio ascendente" },
          { clause: "LIMIT", note: `Toma los primeros ${Math.min(n, 50)}` },
        ],
        tables: ["coches"],
      });
    },
  },
  {
    test: (t) => /(coches?\s+de|coches?\s+por)/i.test(t) && !!matchColor(t),
    build: (t) => {
      const color = matchColor(t)!;
      return final(`SELECT * FROM coches WHERE color = '${q(color)}';`, {
        summary: `Coches de color ${color}.`,
        steps: [{ clause: "WHERE color", note: `Filtra por color ${color}` }],
        tables: ["coches"],
      });
    },
  },
  {
    test: (t) => /clientes?\s+de/i.test(t) && !!matchCiudad(t),
    build: (t) => {
      const ciudad = matchCiudad(t)!;
      return final(`SELECT * FROM clientes WHERE ciudad = '${q(ciudad)}';`, {
        summary: `Clientes que viven en ${ciudad}.`,
        steps: [{ clause: "WHERE ciudad", note: `Filtra por ciudad ${ciudad}` }],
        tables: ["clientes"],
      });
    },
  },
  {
    test: (t) => /ventas?\s+(de|en)\b/i.test(t) && !!matchYear(t),
    build: (t) => {
      const year = matchYear(t)!;
      return final(
        `SELECT v.id, c.modelo, cl.nombre AS cliente, v.fecha, v.precio_venta FROM ventas v JOIN coches c ON v.coche_id = c.id JOIN clientes cl ON v.cliente_id = cl.id WHERE v.fecha LIKE '${year}%' ORDER BY v.fecha DESC;`,
        {
          summary: `Todas las ventas del año ${year}.`,
          steps: [
            { clause: "JOIN", note: "Une ventas con coches y clientes" },
            { clause: "WHERE fecha LIKE", note: `Filtra por año ${year}` },
          ],
          tables: ["ventas", "coches", "clientes"],
        },
      );
    },
  },
  {
    test: (t) => /(todo|todas|lista|muestr|ver)\b/i.test(t) && /coches/i.test(t),
    build: (t) => {
      const limit = matchNumber(t);
      return final(
        `SELECT * FROM coches${limit ? ` LIMIT ${Math.min(limit, 100)}` : ""};`,
        {
          summary: `Lista los coches del catálogo${limit ? ` (máximo ${limit})` : ""}.`,
          steps: [{ clause: "SELECT *", note: "Devuelve todas las columnas" }],
          tables: ["coches"],
        },
      );
    },
  },
  {
    test: (t) => /ventas?/i.test(t) && /(u[uú]ltim[ao]s?|recientes?)/i.test(t),
    build: (t) => {
      const n = matchNumber(t) ?? 10;
      return final(
        `SELECT v.id, c.modelo, cl.nombre AS cliente, v.fecha, v.precio_venta FROM ventas v JOIN coches c ON v.coche_id = c.id JOIN clientes cl ON v.cliente_id = cl.id ORDER BY v.fecha DESC LIMIT ${Math.min(n, 100)};`,
        {
          summary: `Las ${Math.min(n, 100)} ventas más recientes.`,
          steps: [
            { clause: "JOIN", note: "Une ventas con coches y clientes" },
            { clause: "ORDER BY fecha DESC", note: "Ordena de más reciente a más antigua" },
          ],
          tables: ["ventas", "coches", "clientes"],
        },
      );
    },
  },
];

function final(
  sql: string,
  base: Omit<TranslateResponse, "sql" | "source">,
): TranslateResponse {
  return { ...base, sql, source: "local" };
}

export function localTranslate(userQuery: string): TranslateResponse {
  const text = userQuery.trim();
  for (const p of PATTERNS) {
    if (p.test(text)) return p.build(text);
  }
  return final(`-- No reconozco esta intención. Prueba con: 'cuántos coches rojos hay' o 'precio medio de los BMW'.`, {
    summary:
      "Lo siento, no reconozco esta petición en el motor local. Prueba con frases como «cuántos coches rojos», «precio medio de los BMW», «ventas en 2022», «clientes de Madrid» o «marca más vendida».",
    steps: [],
    tables: [],
  });
}

export function localExplain(sql: string): ExplainResponse {
  const clean = sql.trim().replace(/;$/, "");
  const upper = clean.toUpperCase();
  const steps: { clause: string; note: string }[] = [];
  const tables = SCHEMA.map((t) => t.name).filter((t) =>
    clean.toLowerCase().includes(t.toLowerCase()),
  );

  if (upper.startsWith("SELECT"))
    steps.push({ clause: "SELECT", note: "Selecciona columnas y filas" });
  if (upper.includes("COUNT("))
    steps.push({ clause: "COUNT", note: "Cuenta el número de filas" });
  if (upper.includes("AVG("))
    steps.push({ clause: "AVG", note: "Calcula la media de una columna numérica" });
  if (upper.includes("SUM("))
    steps.push({ clause: "SUM", note: "Suma los valores de una columna numérica" });
  if (upper.includes("MAX("))
    steps.push({ clause: "MAX", note: "Devuelve el valor máximo de una columna" });
  if (upper.includes("MIN("))
    steps.push({ clause: "MIN", note: "Devuelve el valor mínimo de una columna" });
  if (upper.includes(" JOIN "))
    steps.push({ clause: "JOIN", note: "Combina filas de dos tablas por una condición común" });
  if (upper.includes(" WHERE "))
    steps.push({ clause: "WHERE", note: "Filtra filas que cumplen una condición" });
  if (upper.includes(" GROUP BY "))
    steps.push({ clause: "GROUP BY", note: "Agrupa filas con valores comunes" });
  if (upper.includes(" HAVING "))
    steps.push({ clause: "HAVING", note: "Filtra grupos después de GROUP BY" });
  if (upper.includes(" ORDER BY "))
    steps.push({ clause: "ORDER BY", note: "Ordena el resultado por una o más columnas" });
  if (upper.includes(" DESC "))
    steps.push({ clause: "DESC", note: "Orden descendente (mayor primero)" });
  if (upper.includes(" LIMIT "))
    steps.push({ clause: "LIMIT", note: "Limita el número de filas devueltas" });
  if (upper.includes(" DISTINCT "))
    steps.push({ clause: "DISTINCT", note: "Elimina duplicados" });

  const summary =
    steps.length > 0
      ? `Esta consulta ${steps
          .slice(0, 3)
          .map((s) => s.note.toLowerCase())
          .join(", ")}.`
      : "Es una consulta SQL que opera sobre el concesionario.";

  return {
    naturalLanguage: summary,
    steps: steps.length
      ? steps
      : [{ clause: "SQL", note: "Consulta general sobre el esquema" }],
    tables,
    citations: tables.map((t) => ({ clause: t, what: "Tabla referenciada" })),
    source: "local",
  };
}

const ENCYCLOPEDIA: Record<string, TeachResponse> = {
  select: {
    concept: "SELECT",
    summary:
      "SELECT es el corazón de SQL: especifica qué columnas quieres ver y, combinado con FROM, de qué tabla.",
    examples: [
      { sql: "SELECT modelo, precio FROM coches;", desc: "Selecciona columnas concretas de coches." },
      { sql: "SELECT * FROM coches;", desc: "El * devuelve todas las columnas." },
    ],
    concepts: [
      { term: "Columna", definition: "Cada campo de una tabla (modelo, precio, color…)" },
      { term: "Proyección", definition: "Elegir qué columnas aparecen en el resultado" },
    ],
    source: "local",
  },
  where: {
    concept: "WHERE",
    summary:
      "WHERE filtra filas: solo quedan las que cumplen la condición. Va siempre después del FROM.",
    examples: [
      { sql: "SELECT * FROM coches WHERE color = 'Rojo';", desc: "Filtra por color exacto." },
      { sql: "SELECT * FROM coches WHERE precio < 30000 AND anio >= 2022;", desc: "Combina condiciones con AND." },
    ],
    concepts: [
      { term: "Operadores", definition: "=, <>, <, >, <=, >=, AND, OR, NOT" },
      { term: "LIKE", definition: "Coincidencia por patrón de texto con % y _" },
    ],
    source: "local",
  },
  join: {
    concept: "JOIN",
    summary:
      "JOIN combina filas de dos tablas usando una condición de cruce. INNER JOIN trae solo filas que coinciden en ambas.",
    examples: [
      {
        sql: "SELECT c.modelo, m.nombre AS marca FROM coches c JOIN marcas m ON c.marca_id = m.id;",
        desc: "Cruza coches con su marca.",
      },
    ],
    concepts: [
      { term: "INNER JOIN", definition: "Solo filas que coinciden en ambas tablas" },
      { term: "LEFT JOIN", definition: "Todas de la izquierda + coincidencias de la derecha" },
      { term: "ON", definition: "Condición de cruce entre tablas" },
    ],
    source: "local",
  },
  "group by": {
    concept: "GROUP BY",
    summary:
      "GROUP BY agrupa filas con el mismo valor en una columna. Se usa con funciones de agregación como COUNT, SUM, AVG, MAX, MIN.",
    examples: [
      {
        sql: "SELECT m.nombre, COUNT(v.id) AS ventas FROM marcas m JOIN coches c ON c.marca_id = m.id JOIN ventas v ON v.coche_id = c.id GROUP BY m.nombre;",
        desc: "Cuenta cuántos coches vendió cada marca.",
      },
    ],
    concepts: [
      { term: "COUNT", definition: "Cuenta el número de filas" },
      { term: "HAVING", definition: "Filtro sobre grupos (como WHERE pero para agregados)" },
    ],
    source: "local",
  },
  "order by": {
    concept: "ORDER BY",
    summary:
      "ORDER BY ordena el resultado por una o varias columnas. ASC es ascendente (por defecto) y DESC descendente.",
    examples: [
      { sql: "SELECT * FROM coches ORDER BY precio DESC LIMIT 5;", desc: "Los 5 coches más caros." },
    ],
    concepts: [
      { term: "ASC", definition: "Ascendente (de menor a mayor)" },
      { term: "DESC", definition: "Descendente (de mayor a menor)" },
    ],
    source: "local",
  },
  limit: {
    concept: "LIMIT",
    summary:
      "LIMIT restringe el número de filas del resultado. En SQLite también existe OFFSET para saltar filas.",
    examples: [
      { sql: "SELECT * FROM ventas ORDER BY fecha DESC LIMIT 10;", desc: "Las 10 ventas más recientes." },
    ],
    concepts: [
      { term: "OFFSET", definition: "Salta N filas antes de aplicar LIMIT" },
    ],
    source: "local",
  },
  aggregates: {
    concept: "Agregaciones",
    summary:
      "Las funciones de agregación resumen muchas filas en un valor: COUNT (cuenta), SUM (suma), AVG (media), MAX/MIN (extremos).",
    examples: [
      { sql: "SELECT AVG(precio) FROM coches;", desc: "Precio medio del catálogo." },
      { sql: "SELECT MAX(precio), MIN(precio) FROM coches;", desc: "Rango de precios." },
    ],
    concepts: [
      { term: "COUNT(*)", definition: "Cuenta todas las filas, incluidas las nulas" },
      { term: "COUNT(col)", definition: "Cuenta solo filas con valor no nulo en col" },
    ],
    source: "local",
  },
};

const TOPIC_ALIASES: Record<string, string> = {
  select: "select",
  where: "where",
  "where clause": "where",
  join: "join",
  "inner join": "join",
  "group by": "group by",
  groupby: "group by",
  "order by": "order by",
  orderby: "order by",
  limit: "limit",
  aggregates: "aggregates",
  agregaciones: "aggregates",
  "funciones de agregacion": "aggregates",
  avg: "aggregates",
  count: "aggregates",
  sum: "aggregates",
  avg_count_sum: "aggregates",
};

export function localTeach(topic: string): TeachResponse {
  const key = TOPIC_ALIASES[topic.trim().toLowerCase()];
  if (key && ENCYCLOPEDIA[key]) return ENCYCLOPEDIA[key];
  return {
    concept: topic,
    summary:
      "Concepto SQL. Explora la guía o prueba con: SELECT, WHERE, JOIN, GROUP BY, ORDER BY, LIMIT o agregaciones.",
    examples: [
      {
        sql: "SELECT * FROM coches LIMIT 5;",
        desc: "Ejemplo: ver los primeros 5 coches.",
      },
    ],
    concepts: [
      { term: "Esquema", definition: "Conjunto de tablas y relaciones de una base de datos" },
      { term: "Consulta", definition: "Comando SQL que lee o modifica datos" },
    ],
    source: "local",
  };
}