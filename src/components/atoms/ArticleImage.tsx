"use client";

import { useState } from "react";
import Image from "next/image";

interface ArticleImageProps {
  src?: string;
  alt: string;
}

export default function ArticleImage({ src, alt }: ArticleImageProps) {
  const [imgSrc, setImgSrc] = useState(
    src && src.trim() !== ""
      ? src
      : `/gradients/dark${Math.floor(Math.random() * 12) + 1}.svg`
  );

  // Generate a new random gradient
  const randomGradient = () =>
    `/gradients/dark${Math.floor(Math.random() * 12) + 1}.svg`;

  return (
    <Image
      key={imgSrc} // key forces Next/Image to reload when src changes
      src={imgSrc}
      alt={alt}
      width={500}
      height={300}
      className="w-full aspect-[5/3] object-cover rounded-md border border-gray-100"
      onError={() => setImgSrc(randomGradient())}
    />
  );
}
