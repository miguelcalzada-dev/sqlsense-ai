"use client";

import { Database, Table2 } from "lucide-react";
import SchemaViewer from "@/components/sql/SchemaViewer";
import StatCards from "@/components/StatCards";

export default function DataPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <header className="mb-8 border-b-4 border-line pb-6">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center border-4 border-line bg-accent-2 shadow-brutal">
            <Database className="h-6 w-6 text-white" strokeWidth={2.5} />
          </span>
          <h1 className="font-heading text-4xl uppercase">
            Datos & Esquema
          </h1>
        </div>
        <p className="mt-3 max-w-2xl font-mono text-xs uppercase tracking-wider text-sub">
          Explora el concesionario: tablas, columnas, claves y relaciones. Cada
          tabla se previsualiza con sus primeras 50 filas.
        </p>
      </header>

      <StatCards />

      <div className="mt-8">
        <div className="mb-4 flex items-center gap-2 font-mono text-sm font-bold uppercase tracking-wider">
          <Table2 className="h-4 w-4" />
          Visualizador de tablas
        </div>
        <SchemaViewer />
      </div>
    </div>
  );
}
