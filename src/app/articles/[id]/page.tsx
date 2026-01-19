import NewsArticle from '@/components/organisms/NewsArticle'
import Layout from '@/components/molecules/Layout'

// In newer Next.js versions `searchParams` can be a Promise; await it before use.
interface ArticlePageProps {
  // allow searchParams to be a Record or a Promise resolving to one
  searchParams:
    | Record<string, string | string[] | undefined>
    | Promise<Record<string, string | string[] | undefined>>
}

function toSingleString(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0]
  if (typeof value === 'string') return value
  return undefined
}

function normalizeParam(value: string | string[] | undefined) {
  const single = toSingleString(value)
  if (!single) return undefined
  try {
    return decodeURIComponent(single.replace(/\+/g, ' '))
  } catch (e) {
    return single.replace(/\+/g, ' ')
  }
}

export default async function ArticlePage({ searchParams }: ArticlePageProps) {
  const params = await searchParams

  const title = normalizeParam(params.title) || ''
  const description = normalizeParam(params.description)
  const link = normalizeParam(params.link)
  const pubDate = normalizeParam(params.pubDate)
  const image_url = normalizeParam(params.image_url)
  const source_name = normalizeParam(params.source_name)
  const language = normalizeParam(params.language)

  return (
    <Layout>
      <NewsArticle
        title={title}
        description={description} // show summary immediately
        link={link} // full content fetched inside NewsArticle
        pubDate={pubDate}
        image_url={image_url}
        source_name={source_name}
        language={language}
      />
    </Layout>
  )
}
