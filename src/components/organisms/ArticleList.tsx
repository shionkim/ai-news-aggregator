import NewsArticles from "@/components/molecules/NewsArticles";
import { CATEGORIES } from "@/libs/categories";
import { capitalizeFirstLetter } from "@/utils/capitalizeFirstLetter";
import LangPicker from "@/components/molecules/LangPicker";

interface ArticleListProps {
  category?: string;
}

export default function ArticleList({ category = "top" }: ArticleListProps) {
  // If the category is invalid, fallback to "top"
  const validCategory = CATEGORIES.includes(category) ? category : "top";

  // Optional: log for debugging
  console.log("ArticleList category:", validCategory);

  return (
    <div className="@container">
      <div className="flex flex-row justify-between mb-8 items-end">
        <h1 className="text-4xl font-semibold">
          {capitalizeFirstLetter(validCategory)}
        </h1>
        <LangPicker />
      </div>
      <NewsArticles category={validCategory} />
    </div>
  );
}
