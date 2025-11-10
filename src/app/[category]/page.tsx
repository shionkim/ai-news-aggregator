import Layout from "@/components/molecules/Layout";
import ArticleList from "@/components/organisms/ArticleList";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category?: string }>;
}) {
  const { category } = await params; // ✅ unwrap the Promise

  return (
    <Layout>
      <ArticleList category={category} />
    </Layout>
  );
}
