type SeedRow = { sql: string; params: (number | string | null)[] };

const MARCAS: { nombre: string; pais: string }[] = [
  { nombre: "Audi", pais: "Alemania" },
  { nombre: "BMW", pais: "Alemania" },
  { nombre: "Mercedes", pais: "Alemania" },
  { nombre: "Porsche", pais: "Alemania" },
  { nombre: "Volkswagen", pais: "Alemania" },
  { nombre: "Tesla", pais: "EE. UU." },
  { nombre: "Toyota", pais: "Japón" },
  { nombre: "Honda", pais: "Japón" },
  { nombre: "Mazda", pais: "Japón" },
  { nombre: "Nissan", pais: "Japón" },
  { nombre: "Renault", pais: "Francia" },
  { nombre: "Peugeot", pais: "Francia" },
  { nombre: "Volvo", pais: "Suecia" },
  { nombre: "Hyundai", pais: "Corea del Sur" },
  { nombre: "Kia", pais: "Corea del Sur" },
];

const MODELOS_POR_MARCA: Record<string, string[]> = {
  Audi: ["A3", "A4", "Q5", "e-tron", "TT"],
  BMW: ["Serie 3", "X3", "i4", "M5"],
  Mercedes: ["Clase A", "Clase C", "GLC", "EQS"],
  Porsche: ["911", "Taycan", "Macan"],
  Volkswagen: ["Golf", "ID.3", "Tiguan", "Polo"],
  Tesla: ["Model 3", "Model Y", "Model S"],
  Toyota: ["Corolla", "Yaris", "RAV4", "Prius"],
  Honda: ["Civic", "CR-V", "Jazz"],
  Mazda: ["MX-5", "CX-5", "Mazda 3"],
  Nissan: ["Qashqai", "Leaf", "Micra"],
  Renault: ["Clio", "Captur", "Megane E-Tech"],
  Peugeot: ["208", "3008", "e-208"],
  Volvo: ["XC40", "XC60", "EX30"],
  Hyundai: ["i20", "Tucson", "Ioniq 5"],
  Kia: ["Ceed", "Sportage", "EV6"],
};

const COLORES = [
  "Negro",
  "Blanco",
  "Gris",
  "Azul",
  "Rojo",
  "Verde",
  "Plata",
];

const CIUDADES = [
  "Madrid",
  "Barcelona",
  "Valencia",
  "Sevilla",
  "Bilbao",
  "Málaga",
  "Zaragoza",
  "Murcia",
  "Palma",
  "Granada",
];

const NOMBRES_CLIENTES = [
  "Lucía", "Martín", "Sofía", "Diego", "Paula", "Álvaro", "Carmen", "Javier",
  "Elena", "Pablo", "Noa", "Daniel", "Marina", "Hugo", "Valeria", "Iker",
  "Cristina", "Adrián", "Nora", "Gonzalo", "Inés", "Bruno", " Vera", "Sergio",
  "Olivia", "Marcos", "Laia", "Álex", "Triana", "Rubén",
];

const APELLIDOS = [
  "García", "Fernández", "López", "Martínez", "Sánchez", "Pérez", "Gómez",
  "Jiménez", "Ruiz", "Hernández", "Díaz", "Moreno", "Álvarez", "Romero",
  "Torres", "Cano", "Vega", "Ortega", "Reyes", "Molina", "Suárez", "Cabrera",
];

const EMAIL_DOMAIN = ["gmail.com", "hotmail.com", "outlook.com", "proton.me"];

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20240115);

function pick<T>(arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

function int(min: number, max: number): number {
  return Math.floor(rand() * (max - min + 1)) + min;
}

function float(min: number, max: number): number {
  return Math.round((rand() * (max - min) + min) * 100) / 100;
}

function randomDate(): string {
  const year = int(2018, 2024);
  const month = int(1, 12);
  const day = int(1, 28);
  const m = String(month).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${m}-${d}`;
}

export function buildSeed(): SeedRow[] {
  const rows: SeedRow[] = [];

  // marcas
  MARCAS.forEach((m, i) => {
    rows.push({
      sql: "INSERT INTO marcas (id, nombre, pais) VALUES (?, ?, ?)",
      params: [i + 1, m.nombre, m.pais],
    });
  });

  // coches
  const coches: {
    id: number;
    marcaId: number;
    modelo: string;
    precio: number;
  }[] = [];
  let cocheId = 1;
  MARCAS.forEach((marca, marcaIdx) => {
    const modeloNames = MODELOS_POR_MARCA[marca.nombre] ?? [];
    const count = Math.min(int(2, 4), modeloNames.length);
    for (let i = 0; i < count; i++) {
      const basePrice = int(18, 130) * 1000 + int(0, 9) * 100;
      const year = int(2018, 2024);
      const color = pick(COLORES);
      const modelo = modeloNames[i];
      rows.push({
        sql: "INSERT INTO coches (id, modelo, marca_id, color, anio, precio) VALUES (?, ?, ?, ?, ?, ?)",
        params: [cocheId, modelo, marcaIdx + 1, color, year, basePrice],
      });
      coches.push({ id: cocheId, marcaId: marcaIdx + 1, modelo, precio: basePrice });
      cocheId++;
    }
  });

  // clientes
  const clientes: number[] = [];
  for (let i = 0; i < 30; i++) {
    const nombre = `${pick(NOMBRES_CLIENTES).trim()} ${pick(APELLIDOS)}`;
    const dominio = pick(EMAIL_DOMAIN);
    const email = `${nombre
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, ".")}@${dominio}`;
    clientes.push(i + 1);
    rows.push({
      sql: "INSERT INTO clientes (id, nombre, email, ciudad) VALUES (?, ?, ?, ?)",
      params: [i + 1, nombre, email, pick(CIUDADES)],
    });
  }

  // ventas
  const numVentas = 120;
  for (let i = 0; i < numVentas; i++) {
    const coche = coches[int(0, coches.length - 1)];
    const ventaPrecio = Math.round(coche.precio * float(0.85, 1.18));
    rows.push({
      sql: "INSERT INTO ventas (id, coche_id, cliente_id, fecha, precio_venta) VALUES (?, ?, ?, ?, ?)",
      params: [
        i + 1,
        coche.id,
        clientes[int(0, clientes.length - 1)],
        randomDate(),
        ventaPrecio,
      ],
    });
  }

  return rows;
}