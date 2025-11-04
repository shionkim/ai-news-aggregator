// app/api/fetch-article/route.ts
import { NextResponse } from "next/server";
import axios from "axios";
// Use dynamic imports for ESM-only dependencies to avoid require() of ESM in certain bundlers
// (e.g. jsdom -> parse5 is shipped as ESM). We'll import them at runtime inside the handler.

// Ensure this API runs on the Node runtime (jsdom / readability require Node APIs)
export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");
  if (!url) return NextResponse.json({ error: "Missing url" }, { status: 400 });

  try {
    const res = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      timeout: 10_000,
      maxRedirects: 5,
    });

    // Dynamically import jsdom and readability so bundlers don't try to require() ESM-only code
    const jsdomMod = await import("jsdom");
    const readabilityMod = await import("@mozilla/readability");
    const { JSDOM } = jsdomMod as any;
    const { Readability } = readabilityMod as any;

    const dom = new JSDOM(res.data, { url });
    const article = new Readability(dom.window.document).parse();
    return NextResponse.json(article || { textContent: "" });
  } catch (err: any) {
    // Enhanced logging to help diagnose issues in Vercel logs
    console.error("/api/fetch-article error:", {
      message: err?.message,
      code: err?.code,
      responseStatus: err?.response?.status,
      responseHeaders: err?.response?.headers,
      url,
    });

    // Return more helpful error for debugging (safe to show in dev; in prod you may prefer generic message)
    const status = err?.response?.status || 500;
    const errorMessage =
      err?.response?.statusText || err?.message || "Failed to fetch article";
    return NextResponse.json({ error: errorMessage }, { status });
  }
}
