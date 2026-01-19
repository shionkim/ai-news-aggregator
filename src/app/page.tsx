import Layout from '@/components/molecules/Layout'
import NewsArticles from '@/components/molecules/NewsArticles'

interface PageProps {
  params?: { category?: string }
}

export default function CategoryPage({ params }: PageProps) {
  return (
    <Layout>
      <div className="@container">
        <div className="flex flex-row justify-between mb-8 items-end">
          <h1 className="text-4xl font-semibold"></h1>
        </div>
        <NewsArticles />
      </div>
    </Layout>
  )
}
