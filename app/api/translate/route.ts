import { NextResponse, type NextRequest } from "next/server";
import { translatePrompt } from "@/lib/ai/prompts";
import { chatJSON } from "@/lib/ai/openai";
import { localTranslate } from "@/lib/ai/local";
import type { TranslateResponse } from "@/lib/ai/types";
import { checkRateLimit } from "@/lib/ai/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = { query?: unknown };

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
  const query = typeof body.query === "string" ? body.query.trim() : "";
  if (!query) {
    return NextResponse.json(
      { error: "Falta el campo 'query'" },
      { status: 400 },
    );
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(localTranslate(query));
  }

  try {
    const { system, userPrompt } = translatePrompt(query);
    const res = await chatJSON<Partial<TranslateResponse>>(system, userPrompt);
    const merged: TranslateResponse = {
      sql: res.sql || "",
      summary: res.summary || "",
      steps: Array.isArray(res.steps) ? res.steps : [],
      tables: Array.isArray(res.tables) ? res.tables : [],
      source: "openai",
    };
    return NextResponse.json(merged);
  } catch (e) {
    console.warn("translate: OpenAI falló, usando fallback:", e);
    return NextResponse.json(localTranslate(query));
  }
}