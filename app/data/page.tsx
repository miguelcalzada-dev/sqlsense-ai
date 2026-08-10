"use client";

import { Database, Table2 } from "lucide-react";
import SchemaViewer from "@/components/sql/SchemaViewer";
import StatCards from "@/components/StatCards";

export default function DataPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-6">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-accent2 to-accent shadow-md">
            <Database className="h-5 w-5 text-white" strokeWidth={2.4} />
          </span>
          <h1 className="text-[28px] font-semibold tracking-tight">
            Datos & Esquema
          </h1>
        </div>
        <p className="mt-2 max-w-2xl text-[14px] text-ink-sub">
          Explora el concesionario: tablas, columnas, claves y relaciones. Cada
          tabla se previsualiza con sus primeras 50 filas.
        </p>
      </header>

      <StatCards />

      <div className="mt-6">
        <div className="mb-2 flex items-center gap-2 text-[13px] font-medium text-ink-soft">
          <Table2 className="h-3.5 w-3.5" />
          Visualizador de tablas
        </div>
        <SchemaViewer />
      </div>
    </div>
  );
}