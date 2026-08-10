import { useMemo } from "react";

const KEYWORDS = new Set([
  "SELECT",
  "FROM",
  "WHERE",
  "JOIN",
  "INNER",
  "LEFT",
  "RIGHT",
  "OUTER",
  "FULL",
  "ON",
  "GROUP",
  "BY",
  "HAVING",
  "ORDER",
  "ASC",
  "DESC",
  "LIMIT",
  "OFFSET",
  "INSERT",
  "INTO",
  "VALUES",
  "UPDATE",
  "SET",
  "DELETE",
  "CREATE",
  "TABLE",
  "INDEX",
  "DROP",
  "ALTER",
  "PRIMARY",
  "KEY",
  "FOREIGN",
  "REFERENCES",
  "NOT",
  "NULL",
  "UNIQUE",
  "DEFAULT",
  "AS",
  "DISTINCT",
  "UNION",
  "ALL",
  "AND",
  "OR",
  "IN",
  "IS",
  "LIKE",
  "BETWEEN",
  "CASE",
  "WHEN",
  "THEN",
  "ELSE",
  "END",
  "EXISTS",
  "WITH",
  "BEGIN",
  "COMMIT",
  "ROLLBACK",
]);

const FUNCTIONS = new Set([
  "COUNT",
  "SUM",
  "AVG",
  "MIN",
  "MAX",
  "ROUND",
  "COALESCE",
  "UPPER",
  "LOWER",
  "LENGTH",
  "STRFTIME",
  "DATE",
  "TOTAL",
  "ABS",
]);

const TYPES = new Set(["INTEGER", "TEXT", "REAL", "BLOB", "NUMERIC", "BOOLEAN"]);

type Token = { type: string; value: string };

function tokenize(sql: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const n = sql.length;

  while (i < n) {
    const ch = sql[i];
    if (ch === "-" && sql[i + 1] === "-") {
      const end = sql.indexOf("\n", i);
      const value = end === -1 ? sql.slice(i) : sql.slice(i, end);
      tokens.push({ type: "comment", value });
      i += value.length;
      continue;
    }
    if ((ch === "'" && sql[i + 1] !== undefined) || ch === "`") {
      const quote = ch;
      let j = i + 1;
      let closed = false;
      while (j < n) {
        if (sql[j] === quote) {
          // escape with doubled quote
          if (sql[j + 1] === quote) {
            j += 2;
            continue;
          }
          closed = true;
          j++;
          break;
        }
        j++;
      }
      const value = sql.slice(i, closed ? j : n);
      tokens.push({ type: "string", value });
      i = j;
      continue;
    }
    if (/\s/.test(ch)) {
      let j = i;
      while (j < n && /\s/.test(sql[j])) j++;
      tokens.push({ type: "ws", value: sql.slice(i, j) });
      i = j;
      continue;
    }
    if (/[0-9]/.test(ch)) {
      let j = i;
      while (j < n && /[0-9.]/.test(sql[j])) j++;
      tokens.push({ type: "number", value: sql.slice(i, j) });
      i = j;
      continue;
    }
    if (/[A-Za-z_]/.test(ch)) {
      let j = i;
      while (j < n && /[A-Za-z0-9_]/.test(sql[j])) j++;
      const word = sql.slice(i, j);
      const up = word.toUpperCase();
      const type = KEYWORDS.has(up)
        ? "keyword"
        : FUNCTIONS.has(up)
          ? "function"
          : TYPES.has(up)
            ? "type"
            : /^[A-Z]/.test(word)
              ? "identifier"
              : "ident";
      tokens.push({ type, value: word });
      i = j;
      continue;
    }
    if (/[(),.;*=<>!+\-/%]/.test(ch)) {
      let j = i;
      const buf = [ch];
      if (ch === "*" && sql[i + 1] === "/") {
        // comment end improbable here
      }
      j++;
      tokens.push({ type: "punct", value: buf.join("") });
      i = j;
      continue;
    }
    tokens.push({ type: "other", value: ch });
    i++;
  }

  return tokens;
}

export function highlightTokens(sql: string): Token[] {
  return tokenize(sql);
}

export function useHighlight(sql: string) {
  return useMemo(() => tokenize(sql), [sql]);
}