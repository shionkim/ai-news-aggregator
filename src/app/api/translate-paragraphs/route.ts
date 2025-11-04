import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const text: string = body?.text || "";
    const targetLang: string = body?.targetLang || "English";

    if (!text) return NextResponse.json({ translated: "" });

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
    const model = process.env.OPENAI_MODEL || "gpt-3.5-turbo";

    const prompt = `Translate the following text into ${targetLang}. Preserve paragraph breaks and formatting. Return ONLY the translated text with the same paragraph structure and do not add any commentary.`;

    const completion = await openai.chat.completions.create({
      model,
      messages: [{ role: "user", content: `${prompt}\n\n${text}` }],
      temperature: 0,
    });

    const translated =
      completion.choices?.[0]?.message?.content?.trim?.() || "";

    return NextResponse.json({ translated });
  } catch (err) {
    console.error("/api/translate-paragraphs error:", err);
    return NextResponse.json({ error: "Translation failed" }, { status: 500 });
  }
}
