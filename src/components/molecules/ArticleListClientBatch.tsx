"use client";

import Link from "next/link";
import ArticleImage from "../atoms/ArticleImage";
import { formatDate } from "@/utils/formatDate";
import { capitalizeFirstLetter } from "@/utils/capitalizeFirstLetter";
import { useTranslateArticles } from "@/hooks/useTranslateArticles";

interface Article {
  article_id: string;
  title: string;
  description?: string;
  link: string;
  pubDate: string;
  image_url?: string;
  source_name: string;
  language: string;
}

export default function ArticleListClientBatch({
  articles,
  category,
}: {
  articles: Article[];
  category?: string;
}) {
  const { translations, loading, error } = useTranslateArticles(articles);

  return (
    <div className="flex flex-col gap-6">
      {loading && (
        <p className="text-sm text-gray-500">Translating category...</p>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {articles.map((article) => {
        const translated = translations[article.article_id];
        const displayTitle = translated?.title || article.title;
        const displayDescription =
          translated?.description || article.description;

        const queryParams = new URLSearchParams({
          title: displayTitle,
          description: displayDescription || "",
          link: article.link,
          pubDate: article.pubDate,
          image_url: article.image_url || "",
          source_name: article.source_name,
          language: article.language,
        }).toString();

        return (
          <Link
            key={article.article_id}
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
                  {displayDescription.length > 100
                    ? displayDescription.slice(0, 100) + "\u2026"
                    : displayDescription}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <p className="font-semibold text-sm">{article.source_name}</p>
              <p className="text-sm text-gray-600">
                {formatDate(article.pubDate)} •{" "}
                {capitalizeFirstLetter(article.language)}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
