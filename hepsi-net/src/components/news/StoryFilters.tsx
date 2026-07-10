"use client";

import { cn, CATEGORIES } from "@/lib/utils";

interface FiltersProps {
  category: string;
  setCategory: (c: string) => void;
  timeFilter: string;
  setTimeFilter: (t: string) => void;
  importance: string;
  setImportance: (i: string) => void;
  sort: string;
  setSort: (s: string) => void;
  hasImage: boolean;
  setHasImage: (v: boolean) => void;
  isBreaking: boolean;
  setIsBreaking: (v: boolean) => void;
  hasCluster: boolean;
  setHasCluster: (v: boolean) => void;
}

const TIME_FILTERS = [
  { value: "", label: "Tümü" },
  { value: "15m", label: "15 dk" },
  { value: "1h", label: "1 saat" },
  { value: "today", label: "Bugün" },
  { value: "24h", label: "24 saat" },
];

const IMPORTANCE_FILTERS = [
  { value: "all", label: "Tümü" },
  { value: "critical", label: "Kritik" },
  { value: "high", label: "Yüksek" },
  { value: "normal", label: "Normal" },
];

const SORT_OPTIONS = [
  { value: "EN_YENİ", label: "En Yeni" },
  { value: "EN_ÖNEMLİ", label: "En Önemli" },
  { value: "EN_HIZLI_YÜKSELEN", label: "En Hızlı Yükselen" },
];

function FilterChip({
  active,
  onClick,
  children,
  red,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  red?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={cn(
        "px-2.5 py-1 text-xs rounded font-medium transition-all whitespace-nowrap",
        active
          ? red
            ? "bg-brand-red text-white"
            : "bg-bg-elevated text-text-primary border border-border-bright"
          : "text-text-muted hover:text-text-secondary hover:bg-bg-elevated/60"
      )}
    >
      {children}
    </button>
  );
}

export function StoryFilters({
  category, setCategory,
  timeFilter, setTimeFilter,
  importance, setImportance,
  sort, setSort,
  hasImage, setHasImage,
  isBreaking, setIsBreaking,
  hasCluster, setHasCluster,
}: FiltersProps) {
  return (
    <div className="flex-none border-b border-border bg-bg-secondary">
      {/* Category row */}
      <div className="flex items-center gap-1 px-3 py-2 overflow-x-auto scrollbar-hide border-b border-border/50">
        {CATEGORIES.map((cat) => (
          <FilterChip
            key={cat}
            active={category === cat}
            onClick={() => setCategory(cat)}
            red={cat === "Son Dakika"}
          >
            {cat}
          </FilterChip>
        ))}
      </div>

      {/* Sub-filters row */}
      <div className="flex items-center gap-3 px-3 py-1.5 overflow-x-auto">
        {/* Time */}
        <div className="flex items-center gap-1">
          {TIME_FILTERS.map((f) => (
            <FilterChip
              key={f.value}
              active={timeFilter === f.value}
              onClick={() => setTimeFilter(f.value)}
            >
              {f.label}
            </FilterChip>
          ))}
        </div>

        <div className="h-3 w-px bg-border" />

        {/* Importance */}
        <div className="flex items-center gap-1">
          {IMPORTANCE_FILTERS.map((f) => (
            <FilterChip
              key={f.value}
              active={importance === f.value}
              onClick={() => setImportance(f.value)}
            >
              {f.label}
            </FilterChip>
          ))}
        </div>

        <div className="h-3 w-px bg-border" />

        {/* Toggles */}
        <FilterChip active={hasImage} onClick={() => setHasImage(!hasImage)}>
          Görselli
        </FilterChip>
        <FilterChip active={isBreaking} onClick={() => setIsBreaking(!isBreaking)}>
          Son Dakika
        </FilterChip>
        <FilterChip active={hasCluster} onClick={() => setHasCluster(!hasCluster)}>
          Çok Kaynaklı
        </FilterChip>

        {/* Sort */}
        <div className="ml-auto flex items-center gap-1">
          {SORT_OPTIONS.map((s) => (
            <FilterChip
              key={s.value}
              active={sort === s.value}
              onClick={() => setSort(s.value)}
            >
              {s.label}
            </FilterChip>
          ))}
        </div>
      </div>
    </div>
  );
}
