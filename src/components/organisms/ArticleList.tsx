import NewsArticles from "@/components/molecules/ArticleGrid";
import { CATEGORIES } from "@/libs/categories";
import { capitalizeFirstLetter } from "@/utils/capitalizeFirstLetter";
import LangPicker from "@/components/molecules/LangPicker";

interface ArticleListProps {
  category?: string;
}

export default function ArticleList({ category = "top" }: ArticleListProps) {
  const normalizedCategory = category;

  if (!CATEGORIES.includes(normalizedCategory)) {
    return <p>Category not found.</p>;
  }

  return (
    <div className="@container">
      <div className="flex flex-row justify-between mb-8 items-end">
        <h1 className="text-4xl font-semibold">
          {capitalizeFirstLetter(normalizedCategory)}
        </h1>
        <LangPicker />
      </div>
      <NewsArticles category={normalizedCategory} />
    </div>
  );
}
