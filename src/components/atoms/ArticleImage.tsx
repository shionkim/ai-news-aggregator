"use client";

import { useState, useEffect } from "react";

interface ArticleImageProps {
  src?: string;
  alt: string;
}

export default function ArticleImage({ src, alt }: ArticleImageProps) {
  const [imgSrc, setImgSrc] = useState<string | undefined>(src);

  useEffect(() => {
    // Only run on the client, after hydration
    if (!src || src.trim() === "") {
      const random = Math.floor(Math.random() * 12) + 1;
      setImgSrc(`/gradients/dark${random}.svg`);
      return;
    }

    // If a valid src is provided (including external URLs), use it.
    setImgSrc(src);
  }, [src]);

  // fallback in case something still fails to load
  const randomGradient = () =>
    `/gradients/dark${Math.floor(Math.random() * 12) + 1}.svg`;

  return (
    // Use a plain <img> to avoid Next.js Image domain/optimizer restrictions when
    // loading remote images via arbitrary URLs. Styling mirrors the previous
    // usage of next/image so layout and appearance remain the same.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imgSrc ?? "/gradients/dark1.svg"}
      alt={alt}
      className="w-full aspect-5/3 object-cover rounded-md border border-gray-100"
      onError={() => setImgSrc(randomGradient())}
    />
  );
}
