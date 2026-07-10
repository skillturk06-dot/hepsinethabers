import Parser from "rss-parser";
import { calculateImportanceScore } from "../scoring/importance";

export interface NormalizedStory {
  externalId: string;
  url: string;
  headline: string;
  snippet?: string;
  thumbnailUrl?: string;
  publishedAt: Date;
  category: string;
  importanceScore: number;
  isBreaking: boolean;
}

const parser = new Parser({
  timeout: 10000,
  headers: {
    "User-Agent": "HepsiNet/1.0 RSS Reader",
  },
  customFields: {
    item: ["media:content", "media:thumbnail", "enclosure"],
  },
});

const CATEGORY_HINTS: Record<string, string[]> = {
  "Son Dakika": ["son dakika", "acil", "breaking"],
  "Siyaset": ["siyaset", "meclis", "hükümet", "cumhurbaşkanı", "bakan", "parti", "seçim", "chp", "akp", "mhp"],
  "Ekonomi": ["ekonomi", "borsa", "döviz", "faiz", "enflasyon", "bütçe", "vergi", "piyasa", "merkez bankası"],
  "Türkiye": ["türkiye", "ankara", "istanbul", "izmir"],
  "Dünya": ["dünya", "abd", "avrupa", "rusya", "ukrayna", "nato", "ab ", "uluslararası"],
  "Sağlık": ["sağlık", "hastane", "doktor", "virüs", "aşı", "kanser", "pandemi"],
  "Teknoloji": ["teknoloji", "yapay zeka", "ai", "yazılım", "uygulama", "telefon", "internet"],
  "Spor": ["spor", "futbol", "basketbol", "voleybol", "galatasaray", "fenerbahçe", "beşiktaş", "trabzonspor"],
  "Magazin": ["magazin", "sanat", "sinema", "dizi", "oyuncu", "şarkıcı"],
  "Eğitim": ["eğitim", "üniversite", "okul", "öğrenci", "ösym", "yks", "lgs"],
  "Bilim": ["bilim", "araştırma", "uzay", "iklim", "çevre", "fizik"],
  "Yaşam": ["yaşam", "hava", "gıda", "tarih", "kültür"],
};

export function detectCategory(headline: string, snippet: string = ""): string {
  const text = `${headline} ${snippet}`.toLowerCase();
  for (const [cat, hints] of Object.entries(CATEGORY_HINTS)) {
    if (hints.some((h) => text.includes(h))) return cat;
  }
  return "Türkiye";
}

function extractThumbnail(item: Record<string, unknown>): string | undefined {
  if (item.enclosure && typeof item.enclosure === "object") {
    const enc = item.enclosure as unknown as Record<string, string>;
    if (enc.url && enc.type?.startsWith("image")) return enc.url;
  }
  const media = item["media:content"] as Record<string, string> | undefined;
  if (media?.url) return media.url;
  const thumb = item["media:thumbnail"] as Record<string, string> | undefined;
  if (thumb?.url) return thumb.url;
  // Extract first img from content
  const content = (item.content ?? item.summary ?? "") as string;
  const imgMatch = content.match(/<img[^>]+src="([^"]+)"/);
  return imgMatch?.[1];
}

export async function fetchRSSFeed(
  feedUrl: string,
  sourceDomain: string
): Promise<NormalizedStory[]> {
  const feed = await parser.parseURL(feedUrl);
  const stories: NormalizedStory[] = [];

  for (const item of feed.items.slice(0, 50)) {
    if (!item.title || !item.link) continue;

    const headline = item.title.replace(/<[^>]*>/g, "").trim();
    const snippet = item.contentSnippet ?? item.summary?.replace(/<[^>]*>/g, "").trim().slice(0, 300);
    const publishedAt = item.pubDate ? new Date(item.pubDate) : new Date();
    const category = detectCategory(headline, snippet ?? "");
    const thumbnailUrl = extractThumbnail(item as unknown as Record<string, unknown>);
    const isBreaking =
      headline.toLowerCase().includes("son dakika") ||
      category === "Son Dakika";

    stories.push({
      externalId: item.guid ?? item.link,
      url: item.link,
      headline,
      snippet,
      thumbnailUrl,
      publishedAt,
      category,
      isBreaking,
      importanceScore: calculateImportanceScore(
        headline,
        snippet,
        category,
        publishedAt,
        1
      ),
    });
  }

  return stories;
}
