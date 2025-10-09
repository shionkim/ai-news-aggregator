import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) return NextResponse.json({ error: "Missing URL" }, { status: 400 });

  try {
    const response = await fetch(url);

    if (!response.ok) throw new Error("Image not reachable");

    const contentType = response.headers.get("content-type") || "image/jpeg";
    const buffer = Buffer.from(await response.arrayBuffer());

    return new NextResponse(buffer, {
      status: 200,
      headers: { "Content-Type": contentType },
    });
  } catch (err) {
    console.error("Proxy error:", err);
    return NextResponse.json({ error: "Image not reachable" }, { status: 404 });
  }
}
