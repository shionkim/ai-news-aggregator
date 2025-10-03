import Image from "next/image";
import Link from "next/link";

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
}

const capitalizeFirstLetter = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1);

export default async function NewsArticles() {
  const res = await fetch(
    `https://newsdata.io/api/1/latest?apikey=${API_KEY}`,
    {
      cache: "no-store", // always fetch fresh news
    }
  );

  const data = await res.json();

  // Handle 429 / Rate Limit error
  if (
    res.status === 429 ||
    (data.status === "error" && data.results?.code === "RateLimitExceeded")
  ) {
    const message =
      data.results?.message || "Rate limit exceeded. Please try again later.";
    return <p>{message}</p>;
  }

  // Ensure articles is always an array
  const articles: Article[] = Array.isArray(data.results) ? data.results : [];

  // Fallback for empty articles
  if (articles.length === 0) {
    return (
      <p>
        No articles available at the moment. Try refreshing the page after 10
        seconds.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
      {articles.map((article) => {
        // Build query string for the article
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
            className="flex flex-col gap-6 hover:scale-[1.02] transition-transform duration-200"
          >
            <Image
              src={
                article.image_url && article.image_url.trim() !== ""
                  ? `/api/proxy-image?url=${encodeURIComponent(
                      article.image_url
                    )}`
                  : `/gradients/dark${Math.floor(Math.random() * 12) + 1}.svg`
              }
              alt={article.title}
              width={500}
              height={300}
              className="w-full aspect-[5/3] object-cover rounded-md border border-gray-100"
            />
            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-semibold">{article.title}</h2>
              {article.description && (
                <p>
                  {article.description
                    ? article.description.slice(0, 100) +
                      (article.description.length > 100 ? "…" : "")
                    : ""}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <p className="font-semibold text-sm">{article.source_name}</p>
              <p className="text-sm">
                {new Date(article.pubDate).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
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
