export type Difficulty = "Principiante" | "Intermedio" | "Avanzado" | "Experto";

export type Challenge = {
  id: string;
  title: string;
  difficulty: Difficulty;
  prompt: string;
  hint: string;
  starterCode: string;
  canonicalSQL: string;
  successMessage: string;
  tolerance: "exactOrdered" | "exactUnordered" | "rowsCount" | "rowsContain";
  /** Keywords the user's SQL should contain (case-insensitive). Optional. */
  keywords?: string[];
  tags: string[];
};

export const DIFFICULTY_ORDER: Difficulty[] = [
  "Principiante",
  "Intermedio",
  "Avanzado",
  "Experto",
];

export const DIFFICULTY_META: Record<
  Difficulty,
  { label: string; color: string; bg: string; emoji: string; desc: string }
> = {
  Principiante: {
    label: "Principiante",
    color: "var(--accent-4)",
    bg: "rgba(50,215,170,0.12)",
    emoji: "🌱",
    desc: "Tus primeros SELECT y filtros. Para empezar.",
  },
  Intermedio: {
    label: "Intermedio",
    color: "var(--accent)",
    bg: "rgba(0,113,227,0.12)",
    emoji: "⚡",
    desc: "Joins, agrupaciones y consultas con varias tablas.",
  },
  Avanzado: {
    label: "Avanzado",
    color: "var(--accent-2)",
    bg: "rgba(94,92,230,0.14)",
    emoji: "🔥",
    desc: "Subconsultas, HAVING, CASE y composición avanzada.",
  },
  Experto: {
    label: "Experto",
    color: "var(--accent-3)",
    bg: "rgba(255,90,95,0.14)",
    emoji: "🧠",
    desc: "Window functions, self-joins y patrones finos.",
  },
};

export const CHALLENGES: Challenge[] = [
  // ───────────── Principiante ─────────────
  {
    id: "p1",
    title: "Hola catálogo",
    difficulty: "Principiante",
    prompt: "Muestra todos los coches. Te basta un SELECT *.",
    hint: "Piensa en `SELECT * FROM coches;`",
    starterCode: "SELECT * FROM coches;",
    canonicalSQL: "SELECT * FROM coches;",
    successMessage: "¡Listo! Has cargado toda la tabla coches.",
    tolerance: "exactOrdered",
    tags: ["SELECT", "FROM"],
  },
  {
    id: "p2",
    title: "Filtro por color",
    difficulty: "Principiante",
    prompt: "Muestra todos los coches de color 'Rojo'.",
    hint: "Usa `WHERE color = 'Rojo'`.",
    starterCode: "SELECT * FROM coches WHERE color = 'Rojo';",
    canonicalSQL: "SELECT * FROM coches WHERE color = 'Rojo';",
    successMessage: "Bien. El WHERE filtra por el color exacto.",
    tolerance: "exactOrdered",
    keywords: ["where", "color"],
    tags: ["WHERE", "FILTRO"],
  },
  {
    id: "p3",
    title: "Cuenta los coches",
    difficulty: "Principiante",
    prompt: "¿Cuántos coches hay en el catálogo? Devuelve una sola fila con el total.",
    hint: "Recuerda COUNT(*).",
    starterCode: "SELECT COUNT(*) FROM coches;",
    canonicalSQL: "SELECT COUNT(*) AS total FROM coches;",
    successMessage: "COUNT resume todas las filas en un número.",
    tolerance: "rowsCount",
    keywords: ["count"],
    tags: ["COUNT", "AGREGADO"],
  },
  {
    id: "p4",
    title: "Precio de cada coche",
    difficulty: "Principiante",
    prompt:
      "Devuelve el modelo y el precio de todos los coches, ordenados por precio descendente.",
    hint: "ORDER BY precio DESC",
    starterCode: "SELECT modelo, precio FROM coches ORDER BY precio DESC;",
    canonicalSQL: "SELECT modelo, precio FROM coches ORDER BY precio DESC;",
    successMessage: "ORDER BY DESC ordena de mayor a menor.",
    tolerance: "exactOrdered",
    keywords: ["order by"],
    tags: ["ORDER BY"],
  },
  {
    id: "p5",
    title: "Los 5 más baratos",
    difficulty: "Principiante",
    prompt: "Muestra los 5 coches más baratos del catálogo.",
    hint: "ORDER BY precio ASC LIMIT 5",
    starterCode: "SELECT * FROM coches ORDER BY precio ASC LIMIT 5;",
    canonicalSQL: "SELECT * FROM coches ORDER BY precio ASC LIMIT 5;",
    successMessage: "ASC + LIMIT es el combo natural para 'los más bajos'.",
    tolerance: "exactOrdered",
    keywords: ["limit"],
    tags: ["ORDER BY", "LIMIT"],
  },
  {
    id: "p6",
    title: "Marcas por país",
    difficulty: "Principiante",
    prompt: "Muestra el nombre y el país de todas las marcas, ordenadas alfabéticamente.",
    hint: "ORDER BY nombre",
    starterCode: "SELECT nombre, pais FROM marcas ORDER BY nombre;",
    canonicalSQL: "SELECT nombre, pais FROM marcas ORDER BY nombre;",
    successMessage: "ORDER BY sin dirección = ascendente por defecto.",
    tolerance: "exactOrdered",
    tags: ["ORDER BY"],
  },

  // ───────────── Intermedio ─────────────
  {
    id: "i1",
    title: "Coches de una marca",
    difficulty: "Intermedio",
    prompt:
      "Muestra el modelo y el color de todos los coches de la marca 'BMW'. Necesitarás un JOIN con marcas.",
    hint: "JOIN marcas ON coches.marca_id = marcas.id WHERE marcas.nombre = 'BMW'.",
    starterCode:
      "SELECT c.modelo, c.color FROM coches c JOIN marcas m ON c.marca_id = m.id WHERE m.nombre = 'BMW';",
    canonicalSQL:
      "SELECT c.modelo, c.color FROM coches c JOIN marcas m ON c.marca_id = m.id WHERE m.nombre = 'BMW';",
    successMessage: "JOIN cruza dos tablas por una clave común.",
    tolerance: "exactUnordered",
    keywords: ["join"],
    tags: ["JOIN", "WHERE"],
  },
  {
    id: "i2",
    title: "Ventas por año",
    difficulty: "Intermedio",
    prompt: "Cuenta cuántas ventas hubo cada año. Devuelve año y total.",
    hint: "Usa STRFTIME('%Y', fecha) y GROUP BY.",
    starterCode:
      "SELECT STRFTIME('%Y', fecha) AS anio, COUNT(*) AS total FROM ventas GROUP BY anio ORDER BY anio;",
    canonicalSQL:
      "SELECT STRFTIME('%Y', fecha) AS anio, COUNT(*) AS total FROM ventas GROUP BY anio ORDER BY anio;",
    successMessage: "STRFTIME extrae el año y GROUP BY agrupa por él.",
    tolerance: "exactOrdered",
    keywords: ["group by", "strftime"],
    tags: ["GROUP BY", "STRFTIME"],
  },
  {
    id: "i3",
    title: "Precio medio por marca",
    difficulty: "Intermedio",
    prompt: "Calcula el precio medio de los coches de cada marca, ordenado de mayor a menor.",
    hint: "AVG(precio) y GROUP BY marcas.nombre DESC.",
    starterCode:
      "SELECT m.nombre AS marca, AVG(c.precio) AS media FROM marcas m JOIN coches c ON c.marca_id = m.id GROUP BY m.nombre ORDER BY media DESC;",
    canonicalSQL:
      "SELECT m.nombre AS marca, AVG(c.precio) AS media FROM marcas m JOIN coches c ON c.marca_id = m.id GROUP BY m.nombre ORDER BY media DESC;",
    successMessage: "JOIN + GROUP BY = agregación por dimensión.",
    tolerance: "exactUnordered",
    keywords: ["avg", "join", "group by"],
    tags: ["AVG", "GROUP BY"],
  },
  {
    id: "i4",
    title: "Ventas con detalle",
    difficulty: "Intermedio",
    prompt:
      "Devuelve 20 ventas mostrando modelo, nombre del cliente, fecha y precio de venta, ordenadas por fecha descendente.",
    hint: "Necesitas tres JOIN: ventas → coches y ventas → clientes.",
    starterCode:
      "SELECT c.modelo, cl.nombre AS cliente, v.fecha, v.precio_venta FROM ventas v JOIN coches c ON v.coche_id = c.id JOIN clientes cl ON v.cliente_id = cl.id ORDER BY v.fecha DESC LIMIT 20;",
    canonicalSQL:
      "SELECT c.modelo, cl.nombre AS cliente, v.fecha, v.precio_venta FROM ventas v JOIN coches c ON v.coche_id = c.id JOIN clientes cl ON v.cliente_id = cl.id ORDER BY v.fecha DESC LIMIT 20;",
    successMessage: "Un solo SELECT puede unir tres tablas encadenando JOINs.",
    tolerance: "exactOrdered",
    keywords: ["join"],
    tags: ["JOIN", "ORDER BY", "LIMIT"],
  },
  {
    id: "i5",
    title: "Clientes únicos por ciudad",
    difficulty: "Intermedio",
    prompt: "Devuelve la lista de ciudades distintas en las que viven clientes. Ordena alfabéticamente.",
    hint: "DISTINCT quita duplicados.",
    starterCode: "SELECT DISTINCT ciudad FROM clientes ORDER BY ciudad;",
    canonicalSQL: "SELECT DISTINCT ciudad FROM clientes ORDER BY ciudad;",
    successMessage: "DISTINCT elimina filas duplicadas del resultado.",
    tolerance: "exactOrdered",
    keywords: ["distinct"],
    tags: ["DISTINCT"],
  },
  {
    id: "i6",
    title: "Coches entre precios",
    difficulty: "Intermedio",
    prompt: "Muestra todos los coches cuyo precio esté entre 25000 y 60000 euros.",
    hint: "BETWEEN 25000 AND 60000.",
    starterCode:
      "SELECT * FROM coches WHERE precio BETWEEN 25000 AND 60000 ORDER BY precio;",
    canonicalSQL:
      "SELECT * FROM coches WHERE precio BETWEEN 25000 AND 60000 ORDER BY precio;",
    successMessage: "BETWEEN es inclusivo en ambos extremos.",
    tolerance: "exactOrdered",
    keywords: ["between"],
    tags: ["BETWEEN", "WHERE"],
  },

  // ───────────── Avanzado ─────────────
  {
    id: "a1",
    title: "Marcas con más de N ventas",
    difficulty: "Avanzado",
    prompt:
      "Lista las marcas que hayan realizado más de 5 ventas, con su número de ventas. Ordena de mayor a menor.",
    hint: "GROUP BY + HAVING COUNT(*) > 5.",
    starterCode:
      "SELECT m.nombre AS marca, COUNT(v.id) AS ventas FROM marcas m JOIN coches c ON c.marca_id = m.id JOIN ventas v ON v.coche_id = c.id GROUP BY m.nombre HAVING COUNT(v.id) > 5 ORDER BY ventas DESC;",
    canonicalSQL:
      "SELECT m.nombre AS marca, COUNT(v.id) AS ventas FROM marcas m JOIN coches c ON c.marca_id = m.id JOIN ventas v ON v.coche_id = c.id GROUP BY m.nombre HAVING COUNT(v.id) > 5 ORDER BY ventas DESC;",
    successMessage: "HAVING filtra grupos, a diferencia de WHERE que filtra filas.",
    tolerance: "exactOrdered",
    keywords: ["having"],
    tags: ["GROUP BY", "HAVING"],
  },
  {
    id: "a2",
    title: "Clientes que nunca compraron",
    difficulty: "Avanzado",
    prompt: "Devuelve los clientes que no tienen ninguna venta asociada.",
    hint: "LEFT JOIN y filtra ventas.id IS NULL; o bien NOT IN (subconsulta).",
    starterCode:
      "SELECT c.id, c.nombre FROM clientes c LEFT JOIN ventas v ON v.cliente_id = c.id WHERE v.id IS NULL;",
    canonicalSQL:
      "SELECT c.id, c.nombre FROM clientes c LEFT JOIN ventas v ON v.cliente_id = c.id WHERE v.id IS NULL;",
    successMessage: "LEFT JOIN + IS NULL es el patrón clásico para 'ausencia'.",
    tolerance: "exactUnordered",
    keywords: ["left join", "is null"],
    tags: ["LEFT JOIN", "NULL"],
  },
  {
    id: "a3",
    title: "Coches nunca vendidos",
    difficulty: "Avanzado",
    prompt: "Lista los modelos de coches que nunca se han vendido.",
    hint: "Similar al anterior: LEFT JOIN ventas y filtra por NULL.",
    starterCode:
      "SELECT c.id, c.modelo FROM coches c LEFT JOIN ventas v ON v.coche_id = c.id WHERE v.id IS NULL;",
    canonicalSQL:
      "SELECT c.id, c.modelo FROM coches c LEFT JOIN ventas v ON v.coche_id = c.id WHERE v.id IS NULL;",
    successMessage: "Reutilizar el patrón LEFT JOIN + IS NULL es una herramienta clave.",
    tolerance: "exactUnordered",
    keywords: ["left join", "is null"],
    tags: ["LEFT JOIN", "NULL"],
  },
  {
    id: "a4",
    title: "Precio superior a la media",
    difficulty: "Avanzado",
    prompt:
      "Muestra los coches cuyo precio está por encima del precio medio de todo el catálogo. Necesitas una subconsulta.",
    hint: "WHERE precio > (SELECT AVG(precio) FROM coches).",
    starterCode:
      "SELECT * FROM coches WHERE precio > (SELECT AVG(precio) FROM coches) ORDER BY precio DESC;",
    canonicalSQL:
      "SELECT * FROM coches WHERE precio > (SELECT AVG(precio) FROM coches) ORDER BY precio DESC;",
    successMessage: "La subconsulta se evalúa una vez y devuelve un escalar.",
    tolerance: "exactOrdered",
    keywords: ["select", "avg"],
    tags: ["SUBCONSULTA", "AGREGADO"],
  },
  {
    id: "a5",
    title: "Clasificación por tramo de precio",
    difficulty: "Avanzado",
    prompt:
      "Cuenta cuántos coches hay en cada tramo: 'barato' (<25000), 'medio' (25000-50000), 'caro' (>50000). Devuelve tramo y total.",
    hint: "CASE WHEN ... THEN ... END + GROUP BY.",
    starterCode:
      "SELECT CASE WHEN precio < 25000 THEN 'barato' WHEN precio <= 50000 THEN 'medio' ELSE 'caro' END AS tramo, COUNT(*) AS total FROM coches GROUP BY tramo ORDER BY tramo;",
    canonicalSQL:
      "SELECT CASE WHEN precio < 25000 THEN 'barato' WHEN precio <= 50000 THEN 'medio' ELSE 'caro' END AS tramo, COUNT(*) AS total FROM coches GROUP BY tramo ORDER BY tramo;",
    successMessage: "CASE permite crear categorías derivadas para agrupar.",
    tolerance: "exactOrdered",
    keywords: ["case"],
    tags: ["CASE", "GROUP BY"],
  },
  {
    id: "a6",
    title: "Ventas por ciudad del cliente",
    difficulty: "Avanzado",
    prompt:
      "Calcula el importe total vendido agrupado por la ciudad del cliente, ordenado descendentemente.",
    hint: "SUM(precio_venta) y un JOIN a clientes.",
    starterCode:
      "SELECT cl.ciudad, SUM(v.precio_venta) AS total FROM ventas v JOIN clientes cl ON v.cliente_id = cl.id GROUP BY cl.ciudad ORDER BY total DESC;",
    canonicalSQL:
      "SELECT cl.ciudad, SUM(v.precio_venta) AS total FROM ventas v JOIN clientes cl ON v.cliente_id = cl.id GROUP BY cl.ciudad ORDER BY total DESC;",
    successMessage: "Sumas por una dimensión externa a la tabla de hechos.",
    tolerance: "exactOrdered",
    keywords: ["sum", "join", "group by"],
    tags: ["SUM", "GROUP BY", "JOIN"],
  },
  {
    id: "a7",
    title: "Venta más cara",
    difficulty: "Avanzado",
    prompt:
      "Devuelve la venta con el precio de venta más alto, mostrando modelo, cliente, fecha y precio.",
    hint: "ORDER BY precio_venta DESC LIMIT 1.",
    starterCode:
      "SELECT c.modelo, cl.nombre AS cliente, v.fecha, v.precio_venta FROM ventas v JOIN coches c ON v.coche_id = c.id JOIN clientes cl ON v.cliente_id = cl.id ORDER BY v.precio_venta DESC LIMIT 1;",
    canonicalSQL:
      "SELECT c.modelo, cl.nombre AS cliente, v.fecha, v.precio_venta FROM ventas v JOIN coches c ON v.coche_id = c.id JOIN clientes cl ON v.cliente_id = cl.id ORDER BY v.precio_venta DESC LIMIT 1;",
    successMessage: "ORDER BY + LIMIT 1 = el máximo.",
    tolerance: "exactOrdered",
    tags: ["ORDER BY", "LIMIT"],
  },

  // ───────────── Experto ─────────────
  {
    id: "e1",
    title: "Ranking de ventas por cliente",
    difficulty: "Experto",
    prompt:
      "Para cada venta, muestra su cliente, la fecha, el precio de venta y el número de venta acumulado (ranking) de ese cliente, ordenado por fecha.",
    hint: "ROW_NUMBER() OVER (PARTITION BY cliente_id ORDER BY fecha).",
    starterCode:
      "SELECT cl.nombre AS cliente, v.fecha, v.precio_venta, ROW_NUMBER() OVER (PARTITION BY v.cliente_id ORDER BY v.fecha) AS n_venta_cliente FROM ventas v JOIN clientes cl ON v.cliente_id = cl.id ORDER BY v.cliente_id, v.fecha;",
    canonicalSQL:
      "SELECT cl.nombre AS cliente, v.fecha, v.precio_venta, ROW_NUMBER() OVER (PARTITION BY v.cliente_id ORDER BY v.fecha) AS n_venta_cliente FROM ventas v JOIN clientes cl ON v.cliente_id = cl.id ORDER BY v.cliente_id, v.fecha;",
    successMessage: "ROW_NUMBER con PARTITION genera rankings por grupo.",
    tolerance: "exactOrdered",
    keywords: ["over", "row_number"],
    tags: ["WINDOW", "PARTITION BY"],
  },
  {
    id: "e2",
    title: "Media móvil de precios",
    difficulty: "Experto",
    prompt:
      "Calcula la media móvil de precio_venta de las últimas 3 ventas de cada cliente, ordenadas por fecha.",
    hint: "AVG(precio_venta) OVER (PARTITION BY cliente_id ORDER BY fecha ROWS 2 PRECEDING).",
    starterCode:
      "SELECT cl.nombre AS cliente, v.fecha, v.precio_venta, ROUND(AVG(v.precio_venta) OVER (PARTITION BY v.cliente_id ORDER BY v.fecha ROWS 2 PRECEDING), 2) AS media_movil FROM ventas v JOIN clientes cl ON v.cliente_id = cl.id ORDER BY v.cliente_id, v.fecha;",
    canonicalSQL:
      "SELECT cl.nombre AS cliente, v.fecha, v.precio_venta, ROUND(AVG(v.precio_venta) OVER (PARTITION BY v.cliente_id ORDER BY v.fecha ROWS 2 PRECEDING), 2) AS media_movil FROM ventas v JOIN clientes cl ON v.cliente_id = cl.id ORDER BY v.cliente_id, v.fecha;",
    successMessage: "ROWS 2 PRECEDING define una ventana de 3 filas.",
    tolerance: "exactOrdered",
    keywords: ["over", "avg"],
    tags: ["WINDOW", "ROWS PRECEDING"],
  },
  {
    id: "e3",
    title: "Comprador top por ciudad",
    difficulty: "Experto",
    prompt:
      "Para cada ciudad, encuentra el cliente que más ha gastado en total y cuánto gastó. Usa una window function y DISTINCT.",
    hint: "Suma por cliente + ROW_NUMBER sobre cada ciudad + KEEP",
    starterCode:
      "WITH gasto AS (SELECT v.cliente_id, cl.ciudad, cl.nombre AS cliente, SUM(v.precio_venta) AS total FROM ventas v JOIN clientes cl ON v.cliente_id = cl.id GROUP BY v.cliente_id, cl.ciudad, cl.nombre) SELECT ciudad, cliente, total FROM (SELECT *, ROW_NUMBER() OVER (PARTITION BY ciudad ORDER BY total DESC) AS rk FROM gasto) g WHERE rk = 1 ORDER BY total DESC;",
    canonicalSQL:
      "WITH gasto AS (SELECT v.cliente_id, cl.ciudad, cl.nombre AS cliente, SUM(v.precio_venta) AS total FROM ventas v JOIN clientes cl ON v.cliente_id = cl.id GROUP BY v.cliente_id, cl.ciudad, cl.nombre) SELECT ciudad, cliente, total FROM (SELECT *, ROW_NUMBER() OVER (PARTITION BY ciudad ORDER BY total DESC) AS rk FROM gasto) g WHERE rk = 1 ORDER BY total DESC;",
    successMessage: "CTE + ROW_NUMBER = el famoso 'top per group'.",
    tolerance: "exactOrdered",
    keywords: ["with", "over", "row_number"],
    tags: ["CTE", "WINDOW", "TOP PER GROUP"],
  },
  {
    id: "e4",
    title: "Porcentaje de ventas por marca",
    difficulty: "Experto",
    prompt:
      "Calcula el porcentaje del total de ventas (en importe) que corresponde a cada marca. Devuelve marca, importe y porcentaje (2 decimales).",
    hint: "SUM ventas agrupado + dividir entre SUM total usando una subconsulta.",
    starterCode:
      "SELECT m.nombre AS marca, SUM(v.precio_venta) AS importe, ROUND(100.0 * SUM(v.precio_venta) / (SELECT SUM(precio_venta) FROM ventas), 2) AS pct FROM marcas m JOIN coches c ON c.marca_id = m.id JOIN ventas v ON v.coche_id = c.id GROUP BY m.nombre ORDER BY pct DESC;",
    canonicalSQL:
      "SELECT m.nombre AS marca, SUM(v.precio_venta) AS importe, ROUND(100.0 * SUM(v.precio_venta) / (SELECT SUM(precio_venta) FROM ventas), 2) AS pct FROM marcas m JOIN coches c ON c.marca_id = m.id JOIN ventas v ON v.coche_id = c.id GROUP BY m.nombre ORDER BY pct DESC;",
    successMessage: "Comparar con el total global es la base de % de contribución.",
    tolerance: "exactOrdered",
    keywords: ["sum", "round", "join"],
    tags: ["SUBCONSULTA", "SOBRE TOTAL"],
  },
  {
    id: "e5",
    title: "Self-join: coches de la misma marca",
    difficulty: "Experto",
    prompt:
      "Usando un self-join sobre coches, devuelve pares de modelos distintos de la misma marca (sin duplicados A-B / B-A), ordenados por marca y primer modelo.",
    hint: "JOIN coches c2 ON c1.marca_id = c2.marca_id WHERE c1.id < c2.id.",
    starterCode:
      "SELECT m.nombre AS marca, c1.modelo AS modelo_a, c2.modelo AS modelo_b FROM coches c1 JOIN coches c2 ON c1.marca_id = c2.marca_id AND c1.id < c2.id JOIN marcas m ON c1.marca_id = m.id ORDER BY marca, modelo_a, modelo_b;",
    canonicalSQL:
      "SELECT m.nombre AS marca, c1.modelo AS modelo_a, c2.modelo AS modelo_b FROM coches c1 JOIN coches c2 ON c1.marca_id = c2.marca_id AND c1.id < c2.id JOIN marcas m ON c1.marca_id = m.id ORDER BY marca, modelo_a, modelo_b;",
    successMessage: "Auto-unir una tabla consigo misma evita duplicados con id_A < id_B.",
    tolerance: "exactOrdered",
    keywords: ["join"],
    tags: ["SELF JOIN"],
  },
];

export function challengesByDifficulty(): Record<Difficulty, Challenge[]> {
  const acc: Record<Difficulty, Challenge[]> = {
    Principiante: [],
    Intermedio: [],
    Avanzado: [],
    Experto: [],
  };
  for (const c of CHALLENGES) acc[c.difficulty].push(c);
  return acc;
}