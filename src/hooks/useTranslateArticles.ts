// src/hooks/useTranslateArticles.ts
"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

interface ArticleInput {
  article_id: string;
  title: string;
  description?: string;
  language: string;
}

interface Translated {
  title: string;
  description?: string;
  error?: string;
}

export function useTranslateArticles(articles: ArticleInput[]) {
  const { selected } = useLanguage();
  const [translations, setTranslations] = useState<Record<string, Translated>>(
    {},
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!articles.length) return;

    let mounted = true;

    const toTranslate = articles.filter(
      (a) =>
        a.language &&
        selected.id &&
        a.language.toLowerCase() !== selected.id.toLowerCase(),
    );

    if (!toTranslate.length) {
      setTranslations({});
      return;
    }

    setLoading(true);
    setError(null);

    async function fetchTranslation() {
      try {
        const res = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            articles: toTranslate,
            targetLang: selected.id, // use language code
          }),
        });

        if (!res.ok)
          throw new Error(
            `Translation failed: ${res.status} ${res.statusText}`,
          );

        const data = await res.json();
        const translatedArr: Translated[] = data?.translated || [];

        const map: Record<string, Translated> = {};
        translatedArr.forEach((t, i) => {
          const original = toTranslate[i];
          if (original) map[original.article_id] = t;
        });

        if (mounted) setTranslations(map);
      } catch (err: any) {
        console.error(err);
        if (mounted) setError(err.message || "Translation failed");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchTranslation();

    return () => {
      mounted = false;
    };
  }, [articles, selected.id]);

  return { translations, loading, error };
}
