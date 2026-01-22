'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import ArticleImage from '../atoms/ArticleImage'
import { formatDate } from '@/utils/formatDate'
import { capitalizeFirstLetter } from '@/utils/capitalizeFirstLetter'
import { useLanguage } from '@/context/LanguageContext'
import { BadgeWithDot } from '@/components/base/badges/badges'

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

interface Translation {
  title: string
  description?: string
}

export default function ArticleCardClient({ article }: { article: Article }) {
  const { selected } = useLanguage()

  const [translated, setTranslated] = useState<Translation | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const articleLang = article.language?.toLowerCase()
  const targetLang = (selected?.name || 'english').toLowerCase()

  useEffect(() => {
    let cancelled = false

    async function translateIfNeeded() {
      if (!articleLang || articleLang === targetLang) {
        setTranslated(null)
        setLoading(false)
        setError(null)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const res = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            articles: [article],
            targetLang,
          }),
        })

        if (!res.ok) throw new Error(`Translation failed (${res.status})`)

        const data = await res.json()
        const result = data?.translated?.[0]

        if (!cancelled && result && !result.error) {
          setTranslated({
            title: result.title,
            description: result.description,
          })
        }
      } catch (err: any) {
        if (!cancelled) {
          console.error(err)
          setError(err.message || 'Translation failed')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    translateIfNeeded()

    return () => {
      cancelled = true
    }
  }, [article.article_id, article.language, targetLang])

  const displayTitle = translated?.title ?? article.title
  const displayDescription = translated?.description ?? article.description

  // ✅ Use the .dir from selected language
  // dir === true → LTR, false → RTL
  const isRTL = selected.dir === false

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
      className={`flex flex-col gap-6 transition-transform duration-200 lg:hover:scale-[1.02] ${
        isRTL ? 'text-right' : 'text-left'
      }`}
    >
      <ArticleImage src={article.image_url?.trim() || undefined} alt={displayTitle} />

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
          <p className="text-sm font-semibold">{article.source_name}</p>
          <p className="text-sm text-gray-600">
            {isRTL ? (
              <>
                {capitalizeFirstLetter(article.language)} • {formatDate(article.pubDate)}
              </>
            ) : (
              <>
                {formatDate(article.pubDate)} • {capitalizeFirstLetter(article.language)}
              </>
            )}
          </p>
        </div>

        <div className={`flex ${isRTL ? 'justify-end' : ''}`}>
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
