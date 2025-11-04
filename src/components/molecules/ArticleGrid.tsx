import ArticleCardClient from "./ArticleCardClient";

const API_KEY = process.env.NEWS_API_KEY;

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
  category?: string;
}

export default async function NewsArticles({ category }: NewsArticlesProps) {
  // Build API URL dynamically
  const url = `https://newsdata.io/api/1/latest?apikey=${API_KEY}${
    category ? `&category=${category}` : ""
  }`;

  const res = await fetch(url, { cache: "no-store" });
  const data = await res.json();

  // Handle rate limit from News API
  if (
    res.status === 429 ||
    (data.status === "error" && data.results?.code === "RateLimitExceeded")
  ) {
    const message =
      data.results?.message || "Rate limit exceeded. Please try again later.";
    return <p>{message}</p>;
  }

  let articles: Article[] = Array.isArray(data.results) ? data.results : [];

  if (articles.length === 0) {
    return <p>No articles available at the moment.</p>;
  }

  // Render articles as-is on the server. Translation will happen on the client after mount.

  return (
    <div className="grid grid-cols-1 @3xl:grid-cols-2 @5xl:grid-cols-3 gap-x-8 gap-y-16">
      {articles.map((originalArticle) => (
        <ArticleCardClient
          key={originalArticle.article_id}
          article={originalArticle}
        />
      ))}
    </div>
  );
}
