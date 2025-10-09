import NewsArticles from "@/components/molecules/ArticleGrid";
import { CATEGORIES } from "@/libs/categories";
import { capitalizeFirstLetter } from "@/utils/capitalizeFirstLetter";

interface ArticleListProps {
  category?: string;
}

export default function ArticleList({ category = "top" }: ArticleListProps) {
  const normalizedCategory = category;

  if (!CATEGORIES.includes(normalizedCategory)) {
    return <p>Category not found.</p>;
  }

  return (
    <div>
      <h1 className="text-4xl font-semibold pb-8">
        {capitalizeFirstLetter(normalizedCategory)}
      </h1>
      <NewsArticles category={normalizedCategory} />
    </div>
  );
}
