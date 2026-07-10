import { formatDistanceToNow, format } from "date-fns";
import { tr } from "date-fns/locale";

export function timeAgo(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true, locale: tr });
}

export function formatTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "HH:mm");
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "d MMM yyyy, HH:mm", { locale: tr });
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function getFaviconUrl(domain: string): string {
  return `https://www.google.com/s2/favicons?sz=32&domain=${domain}`;
}

export function getImportanceBadge(score: number): {
  label: string;
  className: string;
} {
  if (score >= 75) return { label: "KRİTİK", className: "badge-critical" };
  if (score >= 50) return { label: "YÜKSEK", className: "badge-high" };
  return { label: "NORMAL", className: "badge-normal" };
}

export const CATEGORIES = [
  "Tümü",
  "Son Dakika",
  "Türkiye",
  "Dünya",
  "Siyaset",
  "Ekonomi",
  "Sağlık",
  "Teknoloji",
  "Spor",
  "Magazin",
  "Yaşam",
  "Bilim",
  "Eğitim",
  "Otomobil",
  "Sosyal Medya",
] as const;

export const STATUS_LABELS: Record<string, string> = {
  "YENİ": "Yeni",
  "İNCELENİYOR": "İnceleniyor",
  "TASLAK": "Taslak",
  "HAZIR": "Hazır",
  "YAYINLANDI": "Yayınlandı",
  "ATLANDI": "Atlandı",
};

export const STATUSES = ["YENİ", "İNCELENİYOR", "TASLAK", "HAZIR", "YAYINLANDI", "ATLANDI"] as const;
