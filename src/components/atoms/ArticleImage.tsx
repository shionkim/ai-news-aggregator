'use client'

import { useState, useEffect } from 'react'

interface ArticleImageProps {
  src?: string
  alt: string
}

export default function ArticleImage({ src, alt }: ArticleImageProps) {
  const [imgSrc, setImgSrc] = useState<string | undefined>(src?.trim() || '/gradients/dark1.svg')

  useEffect(() => {
    // Only run on the client after hydration
    if (!src || src.trim() === '') {
      const random = Math.floor(Math.random() * 12) + 1
      setImgSrc(`/gradients/dark${random}.svg`)
    }
  }, [src])

  const handleError = () => {
    const random = Math.floor(Math.random() * 12) + 1
    setImgSrc(`/gradients/dark${random}.svg`)
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imgSrc}
      alt={alt}
      className="w-full aspect-5/3 object-cover rounded-md border border-gray-200"
      onError={handleError}
    />
  )
}
