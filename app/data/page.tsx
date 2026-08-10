"use client";

import { Database, Table2 } from "lucide-react";
import SchemaViewer from "@/components/sql/SchemaViewer";
import StatCards from "@/components/StatCards";

export default function DataPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <header className="mb-8">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-accent2 to-accent shadow-lg shadow-accent2/20">
            <Database className="h-5 w-5 text-white" strokeWidth={2.4} />
          </span>
          <h1 className="text-[32px] font-bold tracking-tight">
            Datos & Esquema
          </h1>
        </div>
        <p className="mt-3 max-w-2xl text-[15px] text-ink-sub">
          Explora el concesionario: tablas, columnas, claves y relaciones. Cada
          tabla se previsualiza con sus primeras 50 filas.
        </p>
      </header>

      <StatCards />

      <div className="mt-8">
        <div className="mb-3 flex items-center gap-2 text-[14px] font-semibold text-ink-soft">
          <Table2 className="h-4 w-4" />
          Visualizador de tablas
        </div>
        <SchemaViewer />
      </div>
    </div>
  );
}
