import NewsArticle from "@/components/organisms/NewsArticle";
import Layout from "@/components/molecules/Layout";

interface ArticlePageProps {
  searchParams: {
    title: string;
    description?: string;
    link?: string;
    pubDate?: string;
    image_url?: string;
    source_name?: string;
    language?: string;
  };
}

export default function ArticlePage({ searchParams }: ArticlePageProps) {
  return (
    <Layout>
      <NewsArticle
        title={searchParams.title}
        description={searchParams.description} // show summary immediately
        link={searchParams.link} // full content fetched inside NewsArticle
        pubDate={searchParams.pubDate}
        image_url={searchParams.image_url}
        source_name={searchParams.source_name}
        language={searchParams.language}
      />
    </Layout>
  );
}
