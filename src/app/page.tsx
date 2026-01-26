// /filters/page.tsx
import Layout from '@/components/molecules/Layout'
import ArticleCardClient from '@/components/molecules/ArticleCardClient'

interface Article {
  article_id: string
  title: string
  description?: string
  link: string
  pubDate: string
  image_url?: string
  source_name: string
  language: string
}

interface PageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>
}

const API_KEY = process.env.NEWS_API_KEY

export default async function FilterPage({ searchParams }: PageProps) {
  const params = await searchParams

  const categoryParam = params.category
  const keywordParam = params.q
  const countryParam = params.country
  const languageParam = params.lang

  let url = `https://newsdata.io/api/1/latest?apikey=${API_KEY}&removeduplicate=1`

  if (categoryParam) url += `&category=${categoryParam}`
  if (keywordParam) url += `&q=${encodeURIComponent(keywordParam)}`
  if (countryParam) url += `&country=${countryParam}`
  if (languageParam) url += `&language=${languageParam}`

  let content

  try {
    const res = await fetch(url, { cache: 'no-store' })
    const data = await res.json()

    if (!res.ok || data.status === 'error') {
      const message = data.results?.message || data.message || 'An error occurred.'
      content = <p className="p-4 text-red-500">Error: {message}</p>
    } else {
      const articles: Article[] = Array.isArray(data.results) ? data.results : []

      content =
        articles.length === 0 ? (
          <p className="p-4">
            No articles found for {categoryParam ? `"${categoryParam}"` : ''}{' '}
            {countryParam ? `in countries: "${countryParam}"` : ''}
          </p>
        ) : (
          <div className="grid grid-cols-1 @2xl:grid-cols-2 @5xl:grid-cols-3 gap-x-8 gap-y-16">
            {articles.map((article) => (
              <ArticleCardClient key={article.article_id || article.link} article={article} />
            ))}
          </div>
        )
    }
  } catch (error) {
    content = <p className="p-4 text-red-500">Unable to connect to the news service.</p>
  }

  return <Layout>{content}</Layout>
}
