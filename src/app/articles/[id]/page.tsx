import NewsArticle from "@/components/NewsArticle";
import Container from "@/components/Container";

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
    <Container>
      <NewsArticle
        title={searchParams.title}
        description={searchParams.description} // show summary immediately
        link={searchParams.link} // full content fetched inside NewsArticle
        pubDate={searchParams.pubDate}
        image_url={searchParams.image_url}
        source_name={searchParams.source_name}
        language={searchParams.language}
      />
    </Container>
  );
}
