import { NextResponse, type NextRequest } from "next/server";
import { teachPrompt } from "@/lib/ai/prompts";
import { chatJSON } from "@/lib/ai/openai";
import { localTeach } from "@/lib/ai/local";
import type { TeachResponse } from "@/lib/ai/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = { topic?: unknown };

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  const topic = typeof body.topic === "string" ? body.topic.trim() : "";
  if (!topic) {
    return NextResponse.json(
      { error: "Falta el campo 'topic'" },
      { status: 400 },
    );
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(localTeach(topic));
  }

  try {
    const { system, userPrompt } = teachPrompt(topic);
    const res = await chatJSON<Partial<TeachResponse>>(system, userPrompt);
    const merged: TeachResponse = {
      concept: res.concept || topic,
      summary: res.summary || "",
      examples: Array.isArray(res.examples) ? res.examples : [],
      concepts: Array.isArray(res.concepts) ? res.concepts : [],
      source: "openai",
    };
    return NextResponse.json(merged);
  } catch (e) {
    console.warn("teach: OpenAI falló, usando fallback:", e);
    return NextResponse.json(localTeach(topic));
  }
}