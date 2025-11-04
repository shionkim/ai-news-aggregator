"use client"; // Needed for state/hooks

import ArticleImage from "../atoms/ArticleImage";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { capitalizeFirstLetter } from "@/utils/capitalizeFirstLetter";
import { formatDate } from "@/utils/formatDate";
import { Button } from "@/components/base/buttons/button";
import { ArrowNarrowUpRight } from "@untitledui/icons";
import { useLanguage } from "@/context/LanguageContext";
import { BadgeWithDot } from "@/components/base/badges/badges";

interface NewsArticleProps {
  title: string;
  description?: string;
  link?: string;
  pubDate?: string;
  image_url?: string;
  source_name?: string;
  language?: string;
  className?: string;
}

export default function NewsArticle({
  title,
  description,
  link,
  pubDate,
  image_url,
  source_name,
  language,
}: NewsArticleProps) {
  const [fullContent, setFullContent] = useState<string>(description || "");
  const [loading, setLoading] = useState<boolean>(!!link);
  const [fetchError, setFetchError] = useState<boolean>(false);
  const { selected } = useLanguage();

  // translatedContent will hold the translated text (replaces fullContent in UI when available)
  const [translatedContent, setTranslatedContent] = useState<string | null>(
    null
  );
  const [translating, setTranslating] = useState<boolean>(false);
  const [translateError, setTranslateError] = useState<boolean>(false);
  const translateReqId = useRef(0);

  useEffect(() => {
    if (!link) return;

    setLoading(true);
    setFetchError(false);

    const fetchFullArticle = async () => {
      try {
        // You could create a server API route /api/fetch-article to fetch & parse HTML using jsdom + Readability
        const res = await axios.get(
          `/api/fetch-article?url=${encodeURIComponent(link)}`
        );
        setFullContent(res.data.textContent || description || "");
      } catch (err) {
        console.error("Failed to fetch full article:", err);
        setFetchError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchFullArticle();
  }, [link, description]);

  // Trigger translation when fullContent changes or when user-selected language changes
  useEffect(() => {
    // don't attempt to translate while we're fetching the article
    if (loading) return;
    if (!fullContent) {
      setTranslatedContent(null);
      return;
    }

    // If no selected language or selected equals article's language, skip translating
    const targetLangName = selected?.name || "English";
    if (language && selected && selected.id === language) {
      // Use original content
      setTranslatedContent(null);
      setTranslateError(false);
      setTranslating(false);
      return;
    }

    // kick off translation
    const thisReq = ++translateReqId.current;
    setTranslating(true);
    setTranslateError(false);

    const controller = new AbortController();

    (async () => {
      try {
        const res = await fetch("/api/translate-paragraphs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: fullContent,
            targetLang: targetLangName,
          }),
          signal: controller.signal,
        });

        if (!res.ok) throw new Error("translation failed");
        const json = await res.json();

        // ignore out-of-order responses
        if (thisReq !== translateReqId.current) return;

        setTranslatedContent(json.translated || fullContent);
      } catch (err) {
        if ((err as any)?.name === "AbortError") return;
        console.error("Translation failed:", err);
        setTranslateError(true);
        setTranslatedContent(fullContent);
      } finally {
        if (thisReq === translateReqId.current) setTranslating(false);
      }
    })();

    return () => {
      controller.abort();
    };
  }, [selected, fullContent, language, loading]);

  return (
    <div className="flex flex-col gap-12">
      <div className="w-full flex flex-col gap-8 max-w-2xl mx-auto">
        <h1 className="text-4xl font-semibold">{title}</h1>
        <div className="w-full flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2">
          <div className="flex flex-col gap-1">
            {source_name && (
              <p className="text-sm font-semibold">{source_name}</p>
            )}

            {pubDate && language && (
              <p className="text-sm text-gray-600">
                {formatDate(pubDate)}
                {" • "}
                {capitalizeFirstLetter(language)}
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
              <Button
                color="primary"
                size="md"
                iconTrailing={<ArrowNarrowUpRight data-icon />}
              >
                Read original article
              </Button>
            </a>
          )}
        </div>
      </div>
      <div className="max-w-3xl w-full mx-auto">
        <ArticleImage
          src={image_url?.trim() ? image_url : undefined}
          alt={title}
        />
      </div>

      {/* Loading & content */}
      <div className="prose max-w-2xl mx-auto">
        {loading && <p className="text-gray-500">Loading full article…</p>}
        {fetchError && (
          <p className="text-red-600 mb-2">
            Full article could not be fetched due to technical restrictions.
            Displaying summary instead.
          </p>
        )}
        {!loading && (
          <div>
            {translating && (
              <BadgeWithDot
                type="modern"
                color="warning"
                size="md"
                className="mb-6"
              >
                Translating
              </BadgeWithDot>
            )}
            {translateError && (
              <p className="text-red-600 mb-2">
                Translation failed; showing original text.
              </p>
            )}

            <div className="prose text-gray-700 flex flex-col gap-4">
              {(translatedContent ?? fullContent)
                .split(/\n+/)
                .map((para, i) =>
                  para.trim() ? <p key={i}>{para.trim()}</p> : null
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
