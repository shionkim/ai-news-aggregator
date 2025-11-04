import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");
  // Support both query-style `/api/proxy-image?url=...` and path-style
  // `/api/proxy-image/<encoded-url>` where `<encoded-url>` is the
  // encodeURIComponent of the original remote image URL. The latter avoids
  // Next.js blocking Image src containing query strings.
  let imageUrl = url;
  if (!imageUrl) {
    const { pathname } = new URL(request.url);
    const prefix = "/api/proxy-image/";
    if (pathname.startsWith(prefix)) {
      const encoded = pathname.slice(prefix.length);
      if (encoded) imageUrl = decodeURIComponent(encoded);
    }
  }

  if (!imageUrl)
    return NextResponse.json({ error: "Missing URL" }, { status: 400 });

  try {
    const response = await fetch(imageUrl);

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
