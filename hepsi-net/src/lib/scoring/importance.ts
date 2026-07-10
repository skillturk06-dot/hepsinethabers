export interface ScoringConfig {
  keywords: { term: string; weight: number }[];
  categoryWeights: Record<string, number>;
  recencyBoost: boolean;
}

const DEFAULT_BREAKING_KEYWORDS = [
  { term: "son dakika", weight: 30 },
  { term: "açıklama", weight: 10 },
  { term: "deprem", weight: 25 },
  { term: "yangın", weight: 20 },
  { term: "kaza", weight: 18 },
  { term: "öldü", weight: 22 },
  { term: "hayatını kaybetti", weight: 22 },
  { term: "istifa", weight: 20 },
  { term: "operasyon", weight: 18 },
  { term: "yasak", weight: 15 },
  { term: "karar", weight: 8 },
  { term: "zam", weight: 12 },
  { term: "indirim", weight: 8 },
  { term: "rekor", weight: 10 },
  { term: "cumhurbaşkanı", weight: 20 },
  { term: "bakanlık", weight: 12 },
  { term: "gözaltı", weight: 18 },
  { term: "tutuklama", weight: 18 },
  { term: "saldırı", weight: 22 },
  { term: "patlama", weight: 25 },
  { term: "acil", weight: 20 },
  { term: "alarm", weight: 15 },
];

const DEFAULT_CATEGORY_WEIGHTS: Record<string, number> = {
  "Son Dakika": 30,
  "Siyaset": 20,
  "Ekonomi": 15,
  "Türkiye": 10,
  "Dünya": 8,
  "Sağlık": 6,
  "Teknoloji": 5,
  "Spor": 5,
  "Yaşam": 3,
  "Magazin": 2,
  "Eğitim": 4,
  "Bilim": 4,
  "Otomobil": 2,
  "Sosyal Medya": 3,
};

export function calculateImportanceScore(
  headline: string,
  snippet: string | null | undefined,
  category: string,
  publishedAt: Date,
  sourceCount: number = 1,
  customKeywords: { term: string; weight: number }[] = []
): number {
  const text = `${headline} ${snippet ?? ""}`.toLowerCase();
  let score = 0;

  // Keyword matching
  const allKeywords = [...DEFAULT_BREAKING_KEYWORDS, ...customKeywords];
  for (const kw of allKeywords) {
    if (text.includes(kw.term.toLowerCase())) {
      score += kw.weight;
    }
  }

  // Category weight
  score += DEFAULT_CATEGORY_WEIGHTS[category] ?? 5;

  // Source count boost
  if (sourceCount > 1) {
    score += Math.min(sourceCount * 5, 25);
  }

  // Recency boost
  const ageMinutes = (Date.now() - publishedAt.getTime()) / 60000;
  if (ageMinutes < 15) score += 20;
  else if (ageMinutes < 60) score += 12;
  else if (ageMinutes < 360) score += 5;

  return Math.min(Math.max(Math.round(score), 0), 100);
}

export function getImportanceLabel(score: number): {
  label: string;
  level: "critical" | "high" | "normal";
} {
  if (score >= 75) return { label: "KRİTİK", level: "critical" };
  if (score >= 50) return { label: "YÜKSEK", level: "high" };
  return { label: "NORMAL", level: "normal" };
}

export function normalizeHeadline(headline: string): string {
  return headline
    .toLowerCase()
    .replace(/[^\w\sğüşıöçĞÜŞİÖÇ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function computeSimilarity(a: string, b: string): number {
  const na = normalizeHeadline(a);
  const nb = normalizeHeadline(b);

  const setA = new Set(na.split(" ").filter((w) => w.length > 3));
  const setB = new Set(nb.split(" ").filter((w) => w.length > 3));

  if (setA.size === 0 || setB.size === 0) return 0;

  const intersection = new Set(Array.from(setA).filter((w) => setB.has(w)));
  const union = new Set([...Array.from(setA), ...Array.from(setB)]);

  return intersection.size / union.size;
}

export const SIMILARITY_THRESHOLD = 0.45;
