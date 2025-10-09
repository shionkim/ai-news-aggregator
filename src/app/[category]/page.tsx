import Layout from "@/components/molecules/Layout";
import ArticleList from "@/components/organisms/ArticleList";

interface PageProps {
  params?: { category?: string };
}

export default function CategoryPage({ params }: PageProps) {
  return (
    <Layout>
      <ArticleList category={params?.category} />
    </Layout>
  );
}
