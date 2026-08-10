export type ColumnType = "INTEGER" | "TEXT" | "REAL";

export type Column = {
  name: string;
  type: ColumnType;
  pk?: boolean;
  fk?: { table: string; column: string };
  notNull?: boolean;
  desc: string;
};

export type Table = {
  name: string;
  label: string;
  emoji: string;
  color: string;
  desc: string;
  columns: Column[];
  sampleQuery: string;
};

export const SCHEMA: Table[] = [
  {
    name: "marcas",
    label: "Marcas",
    emoji: "🏷️",
    color: "#5e5ce6",
    desc: "Fabricantes de coches. Catálogo maestro de marcas disponibles.",
    columns: [
      { name: "id", type: "INTEGER", pk: true, notNull: true, desc: "Clave primaria" },
      { name: "nombre", type: "TEXT", notNull: true, desc: "Nombre comercial de la marca" },
      { name: "pais", type: "TEXT", notNull: true, desc: "País de origen" },
    ],
    sampleQuery: "SELECT * FROM marcas ORDER BY nombre;",
  },
  {
    name: "coches",
    label: "Coches",
    emoji: "🚗",
    color: "#0071e3",
    desc: "Unidades del catálogo del concesionario. Cada coche pertenece a una marca.",
    columns: [
      { name: "id", type: "INTEGER", pk: true, notNull: true, desc: "Clave primaria" },
      { name: "modelo", type: "TEXT", notNull: true, desc: "Nombre del modelo" },
      {
        name: "marca_id",
        type: "INTEGER",
        notNull: true,
        fk: { table: "marcas", column: "id" },
        desc: "Referencia a marcas.id",
      },
      { name: "color", type: "TEXT", desc: "Color de la carrocería" },
      { name: "anio", type: "INTEGER", desc: "Año de fabricación" },
      { name: "precio", type: "REAL", desc: "Precio de catálogo en euros" },
    ],
    sampleQuery: "SELECT * FROM coches ORDER BY precio DESC LIMIT 10;",
  },
  {
    name: "clientes",
    label: "Clientes",
    emoji: "👤",
    color: "#ff5a5f",
    desc: "Personas registradas como posibles compradores en el concesionario.",
    columns: [
      { name: "id", type: "INTEGER", pk: true, notNull: true, desc: "Clave primaria" },
      { name: "nombre", type: "TEXT", notNull: true, desc: "Nombre completo" },
      { name: "email", type: "TEXT", desc: "Correo electrónico único" },
      { name: "ciudad", type: "TEXT", desc: "Ciudad de residencia" },
    ],
    sampleQuery: "SELECT * FROM clientes ORDER BY nombre LIMIT 10;",
  },
  {
    name: "ventas",
    label: "Ventas",
    emoji: "🧾",
    color: "#32d7aa",
    desc: "Transacciones de compra realizadas. Vincula un coche con un cliente en una fecha y precio de venta.",
    columns: [
      { name: "id", type: "INTEGER", pk: true, notNull: true, desc: "Clave primaria" },
      {
        name: "coche_id",
        type: "INTEGER",
        notNull: true,
        fk: { table: "coches", column: "id" },
        desc: "Referencia a coches.id",
      },
      {
        name: "cliente_id",
        type: "INTEGER",
        notNull: true,
        fk: { table: "clientes", column: "id" },
        desc: "Referencia a clientes.id",
      },
      { name: "fecha", type: "TEXT", desc: "Fecha de la venta (ISO 8601)" },
      { name: "precio_venta", type: "REAL", desc: "Precio final de venta en euros" },
    ],
    sampleQuery:
      "SELECT v.id, c.modelo, cl.nombre AS cliente, v.fecha, v.precio_venta FROM ventas v JOIN coches c ON v.coche_id = c.id JOIN clientes cl ON v.cliente_id = cl.id ORDER BY v.fecha DESC LIMIT 12;",
  },
];

export const SCHEMA_DDL = `
DROP TABLE IF EXISTS ventas;
DROP TABLE IF EXISTS coches;
DROP TABLE IF EXISTS clientes;
DROP TABLE IF EXISTS marcas;

CREATE TABLE marcas (
  id INTEGER PRIMARY KEY,
  nombre TEXT NOT NULL,
  pais TEXT NOT NULL
);

CREATE TABLE coches (
  id INTEGER PRIMARY KEY,
  modelo TEXT NOT NULL,
  marca_id INTEGER NOT NULL,
  color TEXT,
  anio INTEGER,
  precio REAL,
  FOREIGN KEY (marca_id) REFERENCES marcas (id)
);

CREATE TABLE clientes (
  id INTEGER PRIMARY KEY,
  nombre TEXT NOT NULL,
  email TEXT,
  ciudad TEXT
);

CREATE TABLE ventas (
  id INTEGER PRIMARY KEY,
  coche_id INTEGER NOT NULL,
  cliente_id INTEGER NOT NULL,
  fecha TEXT,
  precio_venta REAL,
  FOREIGN KEY (coche_id) REFERENCES coches (id),
  FOREIGN KEY (cliente_id) REFERENCES clientes (id)
);

CREATE INDEX idx_coches_marca ON coches(marca_id);
CREATE INDEX idx_ventas_coche ON ventas(coche_id);
CREATE INDEX idx_ventas_cliente ON ventas(cliente_id);
CREATE INDEX idx_ventas_fecha ON ventas(fecha);
`;

export function schemaSummary(): string {
  return SCHEMA.map((t) => {
    const cols = t.columns
      .map((c) => {
        const extra =
          c.pk
            ? "PRIMARY KEY"
            : c.fk
              ? `REFERENCES ${c.fk.table}(${c.fk.column})`
              : "";
        return `${c.name} ${c.type}${extra ? " " + extra : ""}`;
      })
      .join(", ");
    return `${t.name}(${cols})`;
  }).join("\n");
}