import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Missing URL" }, { status: 400 });
  }

  try {
    // Fetch the external image
    const response = await fetch(url);

    if (!response.ok)
      throw new Error(`Image not reachable: ${response.status}`);

    const contentType = response.headers.get("content-type") || "image/jpeg";
    const buffer = Buffer.from(await response.arrayBuffer());

    return new NextResponse(buffer, {
      status: 200,
      headers: { "Content-Type": contentType },
    });
  } catch (err) {
    console.error("Proxy image error:", err);

    // Return 404 so the component uses its own SVG fallback
    return new NextResponse(null, { status: 404 });
  }
}
