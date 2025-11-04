// src/libs/translate.ts
import OpenAI from "openai";
import crypto from "crypto";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

interface ArticleInput {
  article_id?: string;
  title: string;
  description?: string;
  language: string;
}

interface ArticleOutput {
  title: string;
  description?: string;
}

// Simple in-memory cache to avoid re-translating the same article.
const CACHE_TTL_SECONDS = Number(process.env.TRANSLATE_CACHE_TTL || 3600); // default 1 hour
const cache = new Map<string, { value: ArticleOutput; expiresAt: number }>();

function cacheKey(a: ArticleInput, targetLang: string) {
  if (a.article_id) return `${a.article_id}:${targetLang}`;
  // otherwise hash title+description
  const h = crypto.createHash("sha256");
  h.update((a.title || "") + "|" + (a.description || "") + "|" + targetLang);
  return h.digest("hex");
}

function getCached(a: ArticleInput, targetLang: string) {
  const key = cacheKey(a, targetLang);
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.value;
}

function setCached(a: ArticleInput, targetLang: string, value: ArticleOutput) {
  const key = cacheKey(a, targetLang);
  cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_SECONDS * 1000 });
}

/**
 * Translates an array of articles into targetLang in a single GPT call.
 * Uses an in-memory cache and sends only uncached, non-English articles to the model.
 */
export async function translateTextBatch(
  articles: ArticleInput[],
  targetLang: string
): Promise<ArticleOutput[]> {
  if (!articles.length) return [];

  // Identify non-English articles
  const nonEnglishArticles = articles.filter(
    (a) => a.language && a.language.toLowerCase() !== "en"
  );

  // Pre-fill from cache
  const cachedMap = new Map<string, ArticleOutput>();
  const toTranslate: ArticleInput[] = [];
  nonEnglishArticles.forEach((a) => {
    const cached = getCached(a, targetLang);
    if (cached) cachedMap.set(a.article_id || cacheKey(a, targetLang), cached);
    else toTranslate.push(a);
  });

  // If nothing to translate, return results from cache/original
  if (!toTranslate.length) {
    return articles.map((a) =>
      a.language && a.language.toLowerCase() === "en"
        ? { title: a.title, description: a.description }
        : cachedMap.get(a.article_id || cacheKey(a, targetLang)) || {
            title: a.title,
            description: a.description,
          }
    );
  }

  // Build payload with article_id so we can map results reliably
  const payload = toTranslate.map((a) => ({
    article_id: a.article_id || null,
    title: a.title,
    description: a.description || "",
  }));

  let prompt = `Translate the following titles and descriptions into ${targetLang}. Keep them concise and natural.\n`;
  prompt += `Return ONLY a JSON array of objects with keys \"article_id\" (string or null), \"title\", and \"description\". The order doesn't matter but include article_id so each item can be mapped back.\n\n`;
  prompt += JSON.stringify(payload, null, 2);

  try {
    const model = process.env.OPENAI_MODEL || "gpt-3.5-turbo"; // allow overriding to faster/slower models
    const completion = await openai.chat.completions.create({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
    });

    const text = completion.choices[0].message?.content?.trim() || "";

    // Parse GPT output - try to extract a JSON array
    let translatedArr: {
      article_id?: string | null;
      title: string;
      description?: string;
    }[] = [];
    try {
      const firstBracket = text.indexOf("[");
      const lastBracket = text.lastIndexOf("]") + 1;
      const jsonText =
        firstBracket >= 0 && lastBracket > firstBracket
          ? text.slice(firstBracket, lastBracket)
          : "[]";
      translatedArr = JSON.parse(jsonText);
    } catch (e) {
      console.warn(
        "Failed to parse GPT output; falling back to original text for those items."
      );
      // fallback: map toTranslate to their original values
      translatedArr = toTranslate.map((a) => ({
        article_id: a.article_id || null,
        title: a.title,
        description: a.description || "",
      }));
    }

    // Build a map from article_id (or positional index) to translation
    const translationMap = new Map<string, ArticleOutput>();
    // First try mapping by article_id when available
    translatedArr.forEach((t, idx) => {
      const key =
        t.article_id ||
        (toTranslate[idx] &&
          (toTranslate[idx].article_id ||
            cacheKey(toTranslate[idx], targetLang))) ||
        String(idx);
      translationMap.set(String(key), {
        title: t.title,
        description: t.description,
      });
    });

    // Cache translations
    toTranslate.forEach((orig, i) => {
      const mapKey = orig.article_id || cacheKey(orig, targetLang);
      const found = translationMap.get(mapKey) || translationMap.get(String(i));
      if (found) setCached(orig, targetLang, found);
    });

    // Compose final result maintaining original order and including english originals
    const result: ArticleOutput[] = articles.map((a) => {
      if (!a.language || a.language.toLowerCase() === "en")
        return { title: a.title, description: a.description };
      const key = a.article_id || cacheKey(a, targetLang);
      const fromCache = cachedMap.get(a.article_id || key);
      if (fromCache) return fromCache;
      const fromTranslation = translationMap.get(a.article_id || key) || null;
      return fromTranslation || { title: a.title, description: a.description };
    });

    return result;
  } catch (err: any) {
    if (err.code === "rate_limit_exceeded") {
      console.warn("OpenAI rate limit exceeded, returning original articles.");
      return articles.map((a) => ({
        title: a.title,
        description: a.description,
      }));
    }
    throw err;
  }
}
