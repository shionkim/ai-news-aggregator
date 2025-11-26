// src/libs/translate.ts
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import crypto from "crypto";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Choose provider via environment variable: "openai" or "gemini"
type Provider = "openai" | "gemini";
const provider: Provider =
  (process.env.TRANSLATE_PROVIDER as Provider) || "openai";

interface ArticleInput {
  article_id?: string;
  title: string;
  description?: string;
  language: string;
}

interface ArticleOutput {
  article_id?: string | null;
  title: string;
  description?: string;
  error?: string;
}

// Simple in-memory cache
const CACHE_TTL_SECONDS = Number(process.env.TRANSLATE_CACHE_TTL || 3600);
const cache = new Map<string, { value: ArticleOutput; expiresAt: number }>();

function cacheKey(a: ArticleInput, targetLang: string) {
  if (a.article_id) return `${a.article_id}:${targetLang}`;
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

// --- Provider helpers ---
async function translateWithOpenAI(prompt: string, model?: string) {
  const completion = await openai.chat.completions.create({
    model: model || process.env.OPENAI_MODEL || "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
    temperature: 0,
  });
  return completion.choices[0].message?.content?.trim() || "";
}

async function translateWithGemini(prompt: string, model?: string) {
  const genModel = genAI.getGenerativeModel({
    model: model || process.env.GEMINI_MODEL || "gemini-2.5-flash-lite",
  });
  const response = await genModel.generateContent(prompt);
  return response.response.text().trim();
}

async function translatePrompt(prompt: string): Promise<string> {
  if (provider === "openai") return translateWithOpenAI(prompt);
  return translateWithGemini(prompt);
}

// --- Main translation function ---
export async function translateTextBatch(
  articles: ArticleInput[],
  targetLang: string
): Promise<ArticleOutput[]> {
  if (!articles.length) return [];

  const nonEnglishArticles = articles.filter(
    (a) => a.language && a.language.toLowerCase() !== "en"
  );

  const cachedMap = new Map<string, ArticleOutput>();
  const toTranslate: ArticleInput[] = [];

  nonEnglishArticles.forEach((a) => {
    const cached = getCached(a, targetLang);
    if (cached) cachedMap.set(a.article_id || cacheKey(a, targetLang), cached);
    else toTranslate.push(a);
  });

  if (!toTranslate.length) {
    return articles.map((a) =>
      a.language && a.language.toLowerCase() !== "en"
        ? cachedMap.get(a.article_id || cacheKey(a, targetLang)) || {
            title: a.title,
            description: a.description,
          }
        : { title: a.title, description: a.description }
    );
  }

  const payload = toTranslate.map((a) => ({
    article_id: a.article_id || null,
    title: a.title,
    description: a.description || "",
  }));

  const prompt = `
Translate the following titles and descriptions into ${targetLang}.
Keep them concise and natural.
Return ONLY a JSON array of objects with "article_id", "title", and "description".

${JSON.stringify(payload, null, 2)}
`;

  let translatedArr: ArticleOutput[] = [];

  try {
    const text = await translatePrompt(prompt);

    try {
      const firstBracket = text.indexOf("[");
      const lastBracket = text.lastIndexOf("]") + 1;
      const jsonText =
        firstBracket >= 0 && lastBracket > firstBracket
          ? text.slice(firstBracket, lastBracket)
          : "[]";
      translatedArr = JSON.parse(jsonText);
    } catch (e) {
      console.warn("Failed to parse output, using original text as fallback.");
      translatedArr = toTranslate.map((a) => ({
        article_id: a.article_id || null,
        title: a.title,
        description: a.description || "",
        error: "Failed to parse GPT/Gemini output",
      }));
    }
  } catch (err: any) {
    console.error("Translation error:", err);
    // propagate error to each article
    translatedArr = toTranslate.map((a) => ({
      article_id: a.article_id || null,
      title: a.title,
      description: a.description || "",
      error: err.message || "Translation failed",
    }));
  }

  // Map translations and cache
  const translationMap = new Map<string, ArticleOutput>();
  translatedArr.forEach((t, idx) => {
    const key =
      t.article_id ||
      (toTranslate[idx] &&
        (toTranslate[idx].article_id ||
          cacheKey(toTranslate[idx], targetLang))) ||
      String(idx);
    translationMap.set(String(key), t);

    // Cache only successful translations (no error)
    if (!t.error) {
      const orig = toTranslate[idx];
      if (orig) setCached(orig, targetLang, t);
    }
  });

  // Compose final results
  return articles.map((a) => {
    if (!a.language || a.language.toLowerCase() === "en")
      return { title: a.title, description: a.description };

    const key = a.article_id || cacheKey(a, targetLang);
    const fromCache = cachedMap.get(a.article_id || key);
    if (fromCache) return fromCache;

    const fromTranslation = translationMap.get(a.article_id || key);
    if (fromTranslation) return fromTranslation;

    // fallback
    return { title: a.title, description: a.description };
  });
}
