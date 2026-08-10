import { schemaSummary } from "@/lib/db/schema";

const SYSTEM = `Eres SQLSense, un tutor experto en SQL que habla español claro y amable.
Trabajas con un concesionario que tiene estas tablas:
${schemaSummary()}

Reglas:
- Devuelve SIEMPRE JSON válido, sin texto fuera del objeto.
- El SQL debe ser válido para SQLite (sql.js).
- Usa los nombres de tablas y columnas exactamente. Evita columnas que no existan.
- No inventes tablas. Si la pregunta no tiene sentido, devuelve sql vacío y responde en summary.
- Sé conciso, preciso y didáctico. Tono cercano, no robótico.`;

export function translatePrompt(userQuery: string) {
  return {
    system: SYSTEM,
    userPrompt: `Convierte esta petición en lenguaje natural a SQL (y explica brevemente).
DEVUELVE un JSON con esta forma exacta:
{
  "sql": "<sql sqlite válido>",
  "summary": "<1-2 frases sobre qué hace>",
  "steps": [{"clause": "SELECT|WHERE|JOIN|...", "note": "..."}],
  "tables": ["tabla1", "tabla2"]
}

Petición: """${userQuery.replace(/"/g, "'")}"""`,
  };
}

export function explainPrompt(sql: string) {
  return {
    system: SYSTEM,
    userPrompt: `Explica esta consulta SQL en lenguaje natural claro y didáctico, paso por paso.
Devuelve un JSON exacto:
{
  "naturalLanguage": "<frase resumen amable>",
  "steps": [{"clause": "SELECT|JOIN|...", "note": "..."}],
  "tables": ["..."],
  "citations": [{"clause": "<fragmento del sql>", "what": "<qué hace>"}]
}

SQL: """${sql}"""`,
  };
}

export function teachPrompt(topic: string) {
  return {
    system: SYSTEM,
    userPrompt: `Enséñame el concepto SQL: "${topic}". Sé claro, con ejemplos ejecutables en SQLite sobre el concesionario.
Devuelve JSON exacto:
{
  "concept": "<nombre>",
  "summary": "<definición 2-3 frases>",
  "examples": [{"sql": "<sql>", "desc": "<qué enseña>"}],
  "concepts": [{"term": "<término>", "definition": "<qué es>"}]
}`,
  };
}