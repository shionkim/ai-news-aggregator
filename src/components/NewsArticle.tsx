"use client"; // Needed for state/hooks

import Image from "next/image";
import { useEffect, useState } from "react";
import axios from "axios";

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

const capitalizeFirstLetter = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1);

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
              <p className="text-sm">
                {new Date(pubDate).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
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

      <Image
        src={
          image_url && image_url.trim() !== ""
            ? `/api/proxy-image?url=${encodeURIComponent(image_url)}`
            : `/gradients/dark${Math.floor(Math.random() * 12) + 1}.svg`
        }
        alt={title}
        width={800}
        height={500}
        className="max-w-7xl mx-auto aspect-[16/9] object-cover rounded-md border border-gray-100"
      />

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
          <div className="prose">
            {fullContent.split(/\n+/).map((para, i) => (
              <p key={i}>{para.trim()}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
