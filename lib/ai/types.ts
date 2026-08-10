export type Step = {
  clause: string;
  note: string;
};

export type TranslateResponse = {
  sql: string;
  summary: string;
  steps: Step[];
  tables: string[];
  source: "openai" | "local";
  attempt?: string;
};

export type ExplainResponse = {
  naturalLanguage: string;
  steps: Step[];
  tables: string[];
  citations: { clause: string; what: string }[];
  source: "openai" | "local";
};

export type TeachResponse = {
  concept: string;
  summary: string;
  examples: { sql: string; desc: string }[];
  concepts: { term: string; definition: string }[];
  source: "openai" | "local";
};

export type ApiError = {
  error: string;
  details?: string;
};