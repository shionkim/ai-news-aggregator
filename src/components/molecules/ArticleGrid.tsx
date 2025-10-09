import ArticleImage from "../atoms/ArticleImage";
import Link from "next/link";
import { capitalizeFirstLetter } from "@/utils/capitalizeFirstLetter";
import { formatDate } from "@/utils/formatDate";

const API_KEY = "pub_644e6b1197d244e69e9d459f5533af0e";

interface Article {
  article_id: string;
  title: string;
  description?: string;
  link: string;
  pubDate: string;
  image_url?: string;
  source_name: string;
  language: string;
  category?: string[];
}

interface NewsArticlesProps {
  category?: string; // dynamic category
}

export default async function NewsArticles({ category }: NewsArticlesProps) {
  // Build API URL dynamically
  const url = `https://newsdata.io/api/1/latest?apikey=${API_KEY}${
    category ? `&category=${category}` : ""
  }`;

  const res = await fetch(url, { cache: "no-store" });
  const data = await res.json();

  // Handle rate limit
  if (
    res.status === 429 ||
    (data.status === "error" && data.results?.code === "RateLimitExceeded")
  ) {
    const message =
      data.results?.message || "Rate limit exceeded. Please try again later.";
    return <p>{message}</p>;
  }

  const articles: Article[] = Array.isArray(data.results) ? data.results : [];

  if (articles.length === 0) {
    return <p>No articles available at the moment.</p>;
  }

  return (
    <div className="grid grid-cols-1 @3xl:grid-cols-2 @5xl:grid-cols-3 gap-x-8 gap-y-16">
      {articles.map((article) => {
        const queryParams = new URLSearchParams({
          title: article.title,
          description: article.description || "",
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
              src={
                article.image_url && article.image_url.trim() !== ""
                  ? `/api/proxy-image?url=${encodeURIComponent(
                      article.image_url
                    )}`
                  : undefined
              }
              alt={article.title}
            />

            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-semibold">{article.title}</h2>
              {article.description && (
                <p className="text-gray-700">
                  {article.description.length > 100
                    ? article.description.slice(0, 100) + "…"
                    : article.description}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <p className="font-semibold text-sm">{article.source_name}</p>
              <p className="text-sm text-gray-600">
                {formatDate(article.pubDate)}
                {" • "}
                {capitalizeFirstLetter(article.language)}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
