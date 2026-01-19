'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import ArticleImage from '../atoms/ArticleImage'
import { formatDate } from '@/utils/formatDate'
import { capitalizeFirstLetter } from '@/utils/capitalizeFirstLetter'
import { useLanguage } from '@/context/LanguageContext'
import { BadgeWithDot } from '@/components/base/badges/badges'
// status will be shown inline next to language; no badge import needed

interface Article {
  article_id: string
  title: string
  description?: string
  link: string
  pubDate: string
  image_url?: string
  source_name: string
  language: string
}

export default function ArticleCardClient({ article }: { article: Article }) {
  const { selected } = useLanguage()
  const [translated, setTranslated] = useState<{
    title: string
    description?: string
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    // token to ignore stale responses
    const token = Symbol('req')

    async function fetchTranslation() {
      const targetCode = selected?.id || 'en'

      // If target language equals article language, clear any translations and don't call API
      if (!article.language || article.language.toLowerCase() === targetCode.toLowerCase()) {
        if (mounted) {
          setTranslated(null)
          setError(null)
          setLoading(false)
        }
        return
      }

      setLoading(true)
      setError(null)

      try {
        const res = await fetch(`/api/translate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            articles: [article],
            targetLang: selected?.name || 'English',
          }),
        })

        if (!res.ok) throw new Error(`Translation failed: ${res.status}`)

        const data = await res.json()
        const first = Array.isArray(data?.translated) ? data.translated[0] : null

        if (mounted && first) {
          if ((first as any).error) {
            setError((first as any).error) // set error state
            setTranslated(null) // clear translated state
          } else {
            setTranslated(first) // set translated
            setError(null) // clear error state
          }
        }
      } catch (err: any) {
        console.error(err)
        if (mounted) setError(err.message || 'Failed to translate')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchTranslation()

    return () => {
      mounted = false
    }
  }, [article, selected?.id, selected?.name])

  const displayTitle = translated?.title || article.title
  const displayDescription = translated?.description || article.description

  const queryParams = new URLSearchParams({
    title: displayTitle,
    description: displayDescription || '',
    link: article.link,
    pubDate: article.pubDate,
    image_url: article.image_url || '',
    source_name: article.source_name,
    language: article.language,
  }).toString()

  return (
    <Link
      href={`/articles/${article.article_id}?${queryParams}`}
      className="flex flex-col gap-6 lg:hover:scale-[1.02] transition-transform duration-200"
    >
      <ArticleImage
        src={article.image_url?.trim() ? article.image_url : undefined}
        alt={displayTitle}
      />

      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold">{displayTitle}</h2>
        {displayDescription && (
          <p className="text-gray-700">
            {displayDescription.length > 140
              ? displayDescription.slice(0, 140) + '\u2026'
              : displayDescription}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <p className="font-semibold text-sm">{article.source_name}</p>
          <p className="text-sm text-gray-600">
            {formatDate(article.pubDate)} • {capitalizeFirstLetter(article.language)}
          </p>
        </div>

        <div>
          {error ? (
            <BadgeWithDot type="modern" color="error" size="md">
              Error
            </BadgeWithDot>
          ) : loading ? (
            <BadgeWithDot type="modern" color="warning" size="md">
              Translating
            </BadgeWithDot>
          ) : translated ? (
            <BadgeWithDot type="modern" color="success" size="md">
              Translated
            </BadgeWithDot>
          ) : null}
        </div>
      </div>
    </Link>
  )
}
