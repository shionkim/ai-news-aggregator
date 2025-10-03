import Container from "@/components/Container";
import NewsArticles from "../components/NewsArticles";

export default function Home() {
  return (
    <Container>
      <h1 className="text-4xl font-semibold pb-8">Latest News</h1>
      <NewsArticles />
    </Container>
  );
}
