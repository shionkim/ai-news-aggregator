import { NextResponse } from "next/server";
import { translateTextBatch } from "@/libs/translate";
import languageNameMap from "language-name-map/map";

const API_KEY = process.env.NEWS_API_KEY;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || undefined;
  const lang = (searchParams.get("lang") || "en").toLowerCase();

  try {
    const url = `https://newsdata.io/api/1/latest?apikey=${API_KEY}$${category ? `&category=${category}` : ""}`;
    const res = await fetch(url, { cache: "no-store" });
    const data = await res.json();

    let articles = Array.isArray(data.results) ? data.results : [];

    // If no articles return empty
    if (!articles.length) return NextResponse.json([]);

    const targetLangName = languageNameMap[lang]?.name || lang || "English";

    const translated = await translateTextBatch(articles, targetLangName);

    return NextResponse.json({ original: articles, translated });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch or translate" },
      { status: 500 },
    );
  }
}
