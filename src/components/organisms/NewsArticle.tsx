"use client"; // Needed for state/hooks

import ArticleImage from "../atoms/ArticleImage";
import { useEffect, useState } from "react";
import axios from "axios";
import { capitalizeFirstLetter } from "@/utils/capitalizeFirstLetter";
import { formatDate } from "@/utils/formatDate";

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

  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col gap-8 max-w-2xl mx-auto">
        <h1 className="text-4xl font-semibold">{title}</h1>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2">
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
              Read original article
            </a>
          )}
        </div>
      </div>
      <div className="w-3xl mx-auto">
        <ArticleImage
          src={
            image_url && image_url.trim() !== ""
              ? `/api/proxy-image?url=${encodeURIComponent(image_url)}`
              : undefined
          }
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
          <div className="prose text-gray-700 flex flex-col gap-4">
            {fullContent
              .split(/\n+/)
              .map((para, i) =>
                para.trim() ? <p key={i}>{para.trim()}</p> : null
              )}
          </div>
        )}
      </div>
    </div>
  );
}
