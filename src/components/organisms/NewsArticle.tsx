'use client'

import ArticleImage from '../atoms/ArticleImage'
import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { capitalizeFirstLetter } from '@/utils/capitalizeFirstLetter'
import { formatDate } from '@/utils/formatDate'
import { Button } from '@/components/base/buttons/button'
import { ArrowNarrowUpRight } from '@untitledui/icons'
import { useLanguage } from '@/context/LanguageContext'

interface NewsArticleProps {
  title: string
  description?: string
  link?: string
  pubDate: string
  image_url?: string
  source_name?: string
  language?: string // original article language (optional)
  className?: string
}

export default function NewsArticle({
  title,
  description,
  link,
  pubDate,
  image_url,
  source_name,
  language, // original article language
}: NewsArticleProps) {
  const [fullContent, setFullContent] = useState<string>(description || '')
  const [loading, setLoading] = useState<boolean>(!!link)
  const [fetchError, setFetchError] = useState<boolean>(false)

  const { selected } = useLanguage()

  // Translation state
  const [translatedContent, setTranslatedContent] = useState<string | null>(null)
  const [translating, setTranslating] = useState<boolean>(false)
  const [translateError, setTranslateError] = useState<boolean>(false)
  const translateReqId = useRef(0)

  // Fetch full article if link is provided
  useEffect(() => {
    if (!link) return
    setLoading(true)
    setFetchError(false)

    const fetchFullArticle = async () => {
      try {
        const res = await axios.get(`/api/fetch-article?url=${encodeURIComponent(link)}`)
        setFullContent(res.data.textContent || description || '')
      } catch (err) {
        console.error('Failed to fetch full article:', err)
        setFetchError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchFullArticle()
  }, [link, description])

  // Translate article whenever fullContent or selected language changes
  useEffect(() => {
    if (loading || !fullContent) {
      setTranslatedContent(null)
      return
    }

    const targetLangName = selected?.name || 'English'

    // Skip translation only if original language is known and matches target
    if (language && language.toLowerCase() === targetLangName.toLowerCase()) {
      setTranslatedContent(null)
      setTranslateError(false)
      setTranslating(false)
      return
    }

    const thisReq = ++translateReqId.current
    setTranslating(true)
    setTranslateError(false)

    const controller = new AbortController()

    ;(async () => {
      try {
        const res = await fetch('/api/translate-paragraphs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: fullContent,
            targetLang: selected.name,
          }),
          signal: controller.signal,
        })

        if (!res.ok) throw new Error('Translation failed')
        const json = await res.json()
        if (thisReq !== translateReqId.current) return

        setTranslatedContent(json.translated || fullContent)
      } catch (err) {
        if ((err as any)?.name === 'AbortError') return
        console.error('Translation failed:', err)
        setTranslateError(true)
        setTranslatedContent(fullContent)
      } finally {
        if (thisReq === translateReqId.current) setTranslating(false)
      }
    })()

    return () => controller.abort()
  }, [selected, fullContent, language, loading])

  // Detect RTL languages
  const rtlLanguages = ['ar', 'he', 'fa', 'ur']
  const isRTL =
    rtlLanguages.includes(selected.id) ||
    (language && rtlLanguages.includes(language.toLowerCase()))

  return (
    <div className="flex flex-col gap-12">
      {/* Title and metadata */}
      <div className="w-full flex flex-col gap-6 md:gap-8 max-w-2xl mx-auto">
        <h1 className={`text-3xl md:text-4xl font-semibold ${isRTL ? 'text-right' : 'text-left'}`}>
          {title}
        </h1>
        <div className="w-full flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2">
          <div className="flex flex-col gap-1">
            {source_name && <p className="text-sm font-semibold">{source_name}</p>}
            {pubDate && (
              <p className="text-sm text-gray-600">
                {formatDate(pubDate)}
                {' • '}
                {translating
                  ? `${capitalizeFirstLetter(language || selected.name)} (Translating)`
                  : translatedContent
                    ? `${capitalizeFirstLetter(language || selected.name)} (Translated)`
                    : capitalizeFirstLetter(language || selected.name)}
              </p>
            )}
          </div>

          {link && (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline mt-2 sm:mt-0"
            >
              <Button color="primary" size="md" iconTrailing={<ArrowNarrowUpRight data-icon />}>
                Read original article
              </Button>
            </a>
          )}
        </div>
      </div>

      {/* Article image */}
      {image_url && (
        <div className="max-w-3xl w-full mx-auto">
          <ArticleImage src={image_url.trim() ? image_url : undefined} alt={title} />
        </div>
      )}

      {/* Article content */}
      <div className={`prose max-w-2xl w-full mx-auto ${isRTL ? 'text-right' : 'text-left'}`}>
        {loading && <p className="text-center">Loading full article...</p>}

        {fetchError && (
          <p className="text-red-600 mb-8 text-center">
            Full article could not be fetched due to technical restrictions. Displaying summary
            instead.
          </p>
        )}

        {!loading && (
          <div>
            {translateError && (
              <p className="text-red-600 mb-8 text-center">
                Translation failed, showing original text.
              </p>
            )}

            <div className="prose text-gray-700 flex flex-col gap-4">
              {(translatedContent ?? fullContent)
                .split(/\n+/)
                .map((para, i) => (para.trim() ? <p key={i}>{para.trim()}</p> : null))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
