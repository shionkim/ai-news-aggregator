// app/api/fetch-article/route.ts
import { NextResponse } from "next/server";
import axios from "axios";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");
  if (!url) return NextResponse.json({ error: "Missing url" }, { status: 400 });

  try {
    const res = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    const dom = new JSDOM(res.data, { url });
    const article = new Readability(dom.window.document).parse();
    return NextResponse.json(article || { textContent: "" });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch article" },
      { status: 500 }
    );
  }
}
