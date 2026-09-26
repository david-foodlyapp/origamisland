import { API_BASE_URL } from "../config";
import type { Language } from "../i18n";
import type { NewsApiItem, NewsCard } from "../types";

export function formatNewsDate(dateString: string, language: Language) {
  const locales: Record<Language, string> = {
    en: "en-US", ka: "ka-GE", ru: "ru-RU", zh: "zh-CN",
    he: "he-IL", it: "it-IT", de: "de-DE", ar: "ar-SA"
  };
  const formatted = new Intl.DateTimeFormat(locales[language], {
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(new Date(dateString));
  return language === "ka" ? formatted : formatted.toUpperCase();
}

export function formatNewsFallbackTitle(slug: string) {
  const normalized = slug.replace(/[-_]+/g, " ").trim();
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

async function fetchApi<T>(path: string, signal: AbortSignal): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, { signal });
  if (!response.ok) {
    throw new Error(`${path} request failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export async function fetchNews(language: Language, categoryFallback: string, signal: AbortSignal): Promise<NewsCard[]> {
  const payload = await fetchApi<{ data: NewsApiItem[] }>(`/news?locale=${language}`, signal);
  return payload.data
    .filter((item) => item.image_url && item.status !== "inactive")
    .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
    .map((item) => ({
      id: item.id,
      slug: item.slug,
      title: item.title?.trim() || formatNewsFallbackTitle(item.slug),
      excerpt: item.excerpt?.trim() || "",
      image: item.image_url,
      date: formatNewsDate(item.published_at, language),
      category: item.category?.name || categoryFallback
    }));
}

export async function fetchNewsDetail(slug: string, language: Language, signal: AbortSignal): Promise<NewsApiItem> {
  const payload = await fetchApi<{ data: NewsApiItem }>(`/news/${encodeURIComponent(slug)}?locale=${language}`, signal);
  return payload.data;
}
