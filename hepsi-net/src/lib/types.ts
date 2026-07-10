export type Category =
  | "Tümü"
  | "Son Dakika"
  | "Türkiye"
  | "Dünya"
  | "Siyaset"
  | "Ekonomi"
  | "Sağlık"
  | "Teknoloji"
  | "Spor"
  | "Magazin"
  | "Yaşam"
  | "Bilim"
  | "Eğitim"
  | "Otomobil"
  | "Sosyal Medya";

export type EditorialStatus =
  | "YENİ"
  | "İNCELENİYOR"
  | "TASLAK"
  | "HAZIR"
  | "YAYINLANDI"
  | "ATLANDI";

export type ImportanceLevel = "critical" | "high" | "normal";

export type SortMode = "EN_YENİ" | "EN_ÖNEMLİ" | "EN_HIZLI_YÜKSELEN";

export type TimeFilter = "15m" | "1h" | "today" | "24h" | "all";

export interface StoryListItem {
  id: string;
  headline: string;
  snippet?: string | null;
  thumbnailUrl?: string | null;
  publishedAt: Date;
  detectedAt: Date;
  category: string;
  importanceScore: number;
  trendScore: number;
  isBreaking: boolean;
  editorialStatus: string;
  clusterId?: string | null;
  clusterSourceCount?: number;
  sourceName: string;
  sourceDomain: string;
  keywordMatchCount?: number;
}

export interface StoryDetail extends StoryListItem {
  url: string;
  factWhat?: string | null;
  factWhere?: string | null;
  factWhen?: string | null;
  factWho?: string | null;
  factResult?: string | null;
  factDetails?: string | null;
  relatedStories?: RelatedStory[];
  clusterMembers?: ClusterMember[];
}

export interface RelatedStory {
  id: string;
  headline: string;
  sourceName: string;
  publishedAt: Date;
  url: string;
}

export interface ClusterMember {
  storyId: string;
  headline: string;
  sourceName: string;
  publishedAt: Date;
  url: string;
}

export interface NewsFilters {
  category?: string;
  timeFilter?: TimeFilter;
  importance?: "critical" | "high" | "normal" | "all";
  sort?: SortMode;
  hasImage?: boolean;
  isBreaking?: boolean;
  hasCluster?: boolean;
  search?: string;
  page?: number;
}

export interface SourceItem {
  id: string;
  name: string;
  domain: string;
  type: string;
  feedUrl: string;
  active: boolean;
  priority: number;
  lastFetchAt?: Date | null;
  lastErrorAt?: Date | null;
  lastError?: string | null;
  storiesToday: number;
}

export interface KeywordItem {
  id: string;
  term: string;
  priority: string;
  color: string;
  notifyEnabled: boolean;
  category?: string | null;
  weight: number;
  matchCount: number;
}

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body?: string | null;
  storyId?: string | null;
  isRead: boolean;
  createdAt: Date;
}

export interface AnalyticsData {
  todayStories: number;
  lastHourStories: number;
  criticalStories: number;
  preparedContent: number;
  publishedContent: number;
  skippedStories: number;
  categoryDistribution: { category: string; count: number }[];
  topSources: { name: string; count: number }[];
  storiesByHour: { hour: string; count: number }[];
  trendTopics: TrendTopic[];
}

export interface TrendTopic {
  topic: string;
  storyCount: number;
  sourceCount: number;
  velocityPct: number;
  firstSeen: Date;
  lastSeen: Date;
}

export interface ContentDraftData {
  id?: string;
  storyId: string;
  headline?: string;
  overlayText?: string;
  caption?: string;
  hashtags?: string[];
  validationStatus?: string;
  validationNotes?: string;
  instagramUrl?: string;
}

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
}
