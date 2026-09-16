"use client";

import { create } from "zustand";
import initSqlJs, { type Database, type SqlJsStatic } from "sql.js";
import { SCHEMA_DDL } from "./schema";
import { buildSeed } from "./seed";

// El binario se sirve localmente (public/sql-wasm.wasm) para no depender de un
// CDN externo en tiempo de ejecucion. Se mantiene el CDN como fallback.
const SQL_WASM_LOCAL =
  process.env.NEXT_PUBLIC_SQL_WASM_URL || "/sqlsense/sql-wasm.wasm";
const SQL_WASM_CDN =
  "https://cdn.jsdelivr.net/npm/sql.js@1.14.1/dist/sql-wasm.wasm";

async function initSqlJsWithFallback(): Promise<SqlJsStatic> {
  try {
    return await initSqlJs({ locateFile: () => SQL_WASM_LOCAL });
  } catch {
    return initSqlJs({ locateFile: () => SQL_WASM_CDN });
  }
}

export type QueryResult = {
  columns: string[];
  rows: unknown[][];
  rowsAffected: number;
  ms: number;
  lastInsertId?: number;
};

export type DBStatus = "idle" | "loading" | "ready" | "error";

type State = {
  status: DBStatus;
  error: string | null;
  sqlJs: SqlJsStatic | null;
  db: Database | null;
  statementsRun: number;
};

type Actions = {
  init: () => Promise<void>;
  reset: () => Promise<void>;
  execute: (sql: string) => QueryResult | { error: string };
  tableNames: () => string[];
};

export type DBStore = State & Actions;

let inflight: Promise<void> | null = null;

function instantiate(sqlJs: SqlJsStatic): Database {
  const db = new sqlJs.Database();
  try {
    db.run(SCHEMA_DDL);
    const seed = buildSeed();
    db.run("BEGIN;");
    for (const row of seed) {
      db.run(row.sql, row.params);
    }
    db.run("COMMIT;");
  } catch (e) {
    try { db.run("ROLLBACK;"); } catch { /* ignore */ }
    throw e;
  }
  return db;
}

export const useDatabase = create<DBStore>((set, get) => ({
  status: "idle",
  error: null,
  sqlJs: null,
  db: null,
  statementsRun: 0,

  init: async () => {
    if (get().status === "ready" || get().status === "loading") {
      if (inflight) await inflight.catch(() => {});
      return;
    }
    set({ status: "loading", error: null });
    inflight = (async () => {
      try {
        const sqlJs = await initSqlJsWithFallback();
        const db = instantiate(sqlJs);
        set({ status: "ready", sqlJs, db, error: null });
      } catch (e) {
        set({
          status: "error",
          error: e instanceof Error ? e.message : "No se pudo cargar SQLite WASM",
        });
        throw e;
      } finally {
        inflight = null;
      }
    })();
    await inflight;
  },

  reset: async () => {
    const { sqlJs, db } = get();
    if (sqlJs && db) {
      try { db.close(); } catch { /* ignore */ }
      const fresh = instantiate(sqlJs);
      set({ db: fresh, statementsRun: 0, status: "ready", error: null });
      return;
    }
    await get().init();
    set({ statementsRun: 0 });
  },

  execute: (sql) => {
    const db = get().db;
    if (!db) return { error: "La base de datos aún no está lista." };
    if (!sql.trim()) {
      return { columns: [], rows: [], rowsAffected: 0, ms: 0 };
    }
    const started = typeof performance !== "undefined" ? performance.now() : Date.now();
    try {
      const stmt = db.prepare(sql);
      let rows: unknown[][] = [];
      let columns: string[] = [];
      if (stmt.step()) {
        columns = stmt.getColumnNames();
        rows.push(stmt.get());
        while (stmt.step()) rows.push(stmt.get());
      }
      stmt.free();
      const rowsAffected = db.getRowsModified();
      const ended = typeof performance !== "undefined" ? performance.now() : Date.now();
      set((s) => ({ statementsRun: s.statementsRun + 1 }));
      return { columns, rows, rowsAffected, ms: Math.max(0, ended - started) };
    } catch (e) {
      const message = e instanceof Error ? e.message : "Error ejecutando la consulta";
      return { error: message } as { error: string };
    }
  },

  tableNames: () => {
    const db = get().db;
    if (!db) return [];
    try {
      const res = db.exec("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;");
      if (!res.length) return [];
      return res[0].values.map((r) => String(r[0]));
    } catch {
      return [];
    }
  },
}));

export function ensureDatabase(): Promise<void> {
  const store = useDatabase.getState();
  return store.init();
}

export async function executeWhenReady(
  sql: string,
): Promise<QueryResult | { error: string }> {
  try {
    await useDatabase.getState().init();
    return useDatabase.getState().execute(sql);
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "No se pudo inicializar la base de datos.",
    };
  }
}

if (typeof window !== "undefined") {
  void ensureDatabase();
}
