import { NextResponse } from "next/server";
import { translateTextBatch } from "@/libs/translate";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const articles = Array.isArray(body?.articles) ? body.articles : [];
    const targetLang = body?.targetLang || "English";

    if (!articles.length) return NextResponse.json({ translated: [] });

    const translated = await translateTextBatch(articles, targetLang);

    return NextResponse.json({ translated });
  } catch (err) {
    console.error("/api/translate error:", err);
    return NextResponse.json({ error: "Translation failed" }, { status: 500 });
  }
}
