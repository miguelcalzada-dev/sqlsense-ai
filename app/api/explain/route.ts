import { NextResponse, type NextRequest } from "next/server";
import { explainPrompt } from "@/lib/ai/prompts";
import { chatJSON } from "@/lib/ai/openai";
import { localExplain } from "@/lib/ai/local";
import type { ExplainResponse } from "@/lib/ai/types";
import { checkRateLimit } from "@/lib/ai/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = { sql?: unknown };

export async function POST(req: NextRequest) {
  const limit = checkRateLimit(req);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Demasiadas peticiones. Intentalo de nuevo en unos segundos." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  const sql = typeof body.sql === "string" ? body.sql.trim() : "";
  if (!sql) {
    return NextResponse.json({ error: "Falta el campo 'sql'" }, { status: 400 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(localExplain(sql));
  }

  try {
    const { system, userPrompt } = explainPrompt(sql);
    const res = await chatJSON<Partial<ExplainResponse>>(system, userPrompt);
    const merged: ExplainResponse = {
      naturalLanguage: res.naturalLanguage || "",
      steps: Array.isArray(res.steps) ? res.steps : [],
      tables: Array.isArray(res.tables) ? res.tables : [],
      citations: Array.isArray(res.citations) ? res.citations : [],
      source: "openai",
    };
    return NextResponse.json(merged);
  } catch (e) {
    console.warn("explain: OpenAI falló, usando fallback:", e);
    return NextResponse.json(localExplain(sql));
  }
}