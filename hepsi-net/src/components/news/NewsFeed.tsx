"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { StoryCard, StoryCardSkeleton } from "./StoryCard";
import { StoryFilters } from "./StoryFilters";
import { StoryDrawer } from "./StoryDrawer";
import { useAppStore } from "@/lib/store";
import type { StoryListItem } from "@/lib/types";

const PAGE_SIZE = 30;

export function NewsFeed() {
  const { selectedStoryId, setSelectedStoryId, refreshSignal, addToast, triggerRefresh } = useAppStore();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Filters
  const [category, setCategory] = useState(searchParams.get("cat") ?? "Tümü");
  const [timeFilter, setTimeFilter] = useState(searchParams.get("time") ?? "");
  const [importance, setImportance] = useState(searchParams.get("imp") ?? "all");
  const [sort, setSort] = useState(searchParams.get("sort") ?? "EN_YENİ");
  const [hasImage, setHasImage] = useState(searchParams.get("img") === "true");
  const [isBreaking, setIsBreaking] = useState(searchParams.get("breaking") === "true");
  const [hasCluster, setHasCluster] = useState(searchParams.get("clustered") === "true");

  const [stories, setStories] = useState<StoryListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIdx, setSelectedIdx] = useState(-1);

  const loaderRef = useRef<HTMLDivElement>(null);
  const lastRefreshSignal = useRef(refreshSignal);

  const buildUrl = useCallback(
    (p: number) => {
      const params = new URLSearchParams();
      if (category !== "Tümü") params.set("category", category);
      if (timeFilter) params.set("time", timeFilter);
      if (importance !== "all") params.set("importance", importance);
      if (sort !== "EN_YENİ") params.set("sort", sort);
      if (hasImage) params.set("hasImage", "true");
      if (isBreaking) params.set("breaking", "true");
      if (hasCluster) params.set("clustered", "true");
      params.set("page", String(p));
      params.set("limit", String(PAGE_SIZE));
      return `/api/news?${params}`;
    },
    [category, timeFilter, importance, sort, hasImage, isBreaking, hasCluster]
  );

  const load = useCallback(
    async (pageNum: number, append = false) => {
      if (append) setLoadingMore(true);
      else setLoading(true);
      setError(null);

      try {
        const res = await fetch(buildUrl(pageNum));
        if (!res.ok) throw new Error("Haber akışı alınamadı");
        const data = await res.json();
        const newStories: StoryListItem[] = data.stories ?? [];
        setStories((prev) => (append ? [...prev, ...newStories] : newStories));
        setTotal(data.total ?? 0);
        setPage(pageNum);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Bilinmeyen hata");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [buildUrl]
  );

  // Initial load and filter changes
  useEffect(() => {
    setSelectedIdx(-1);
    load(1);
  }, [category, timeFilter, importance, sort, hasImage, isBreaking, hasCluster, load]);

  // Auto-refresh signal
  useEffect(() => {
    if (refreshSignal !== lastRefreshSignal.current) {
      lastRefreshSignal.current = refreshSignal;
      load(1);
    }
  }, [refreshSignal, load]);

  // Auto-refresh every 2 minutes
  useEffect(() => {
    const t = setInterval(() => triggerRefresh(), 120000);
    return () => clearInterval(t);
  }, [triggerRefresh]);

  // Open story from URL
  useEffect(() => {
    const sid = searchParams.get("story");
    if (sid) setSelectedStoryId(sid);
  }, [searchParams, setSelectedStoryId]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(tag)) return;

      if (e.key === "j" || e.key === "J") {
        setSelectedIdx((i) => Math.min(i + 1, stories.length - 1));
      } else if (e.key === "k" || e.key === "K") {
        setSelectedIdx((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && selectedIdx >= 0) {
        setSelectedStoryId(stories[selectedIdx]?.id ?? null);
      } else if (e.key === "c" || e.key === "C") {
        const sid = selectedStoryId ?? stories[selectedIdx]?.id;
        if (sid) useAppStore.getState().openContentStudio(sid);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [stories, selectedIdx, selectedStoryId, setSelectedStoryId]);

  // Infinite scroll
  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && stories.length < total && !loadingMore) {
          load(page + 1, true);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loaderRef, stories.length, total, loadingMore, load, page]);

  return (
    <div className="flex h-full overflow-hidden">
      {/* Feed panel */}
      <div className={`flex flex-col flex-1 min-w-0 overflow-hidden ${selectedStoryId ? "hidden lg:flex" : "flex"}`}>
        <StoryFilters
          category={category} setCategory={setCategory}
          timeFilter={timeFilter} setTimeFilter={setTimeFilter}
          importance={importance} setImportance={setImportance}
          sort={sort} setSort={setSort}
          hasImage={hasImage} setHasImage={setHasImage}
          isBreaking={isBreaking} setIsBreaking={setIsBreaking}
          hasCluster={hasCluster} setHasCluster={setHasCluster}
        />

        {/* Status bar */}
        <div className="flex-none flex items-center justify-between px-4 py-1.5 border-b border-border bg-bg text-xs text-text-muted">
          <span className="tabular-nums">
            {loading ? "Yükleniyor..." : `${total} haber`}
          </span>
          <button
            onClick={() => load(1)}
            className="flex items-center gap-1 hover:text-text-secondary transition-colors"
            type="button"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
            Yenile
          </button>
        </div>

        {/* Stories list */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => <StoryCardSkeleton key={i} />)
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-40 gap-3 text-text-muted">
              <p className="text-sm">{error}</p>
              <button
                onClick={() => load(1)}
                className="text-xs border border-border rounded px-3 py-1.5 hover:border-border-bright transition-colors"
                type="button"
              >
                Tekrar Dene
              </button>
            </div>
          ) : stories.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-2 text-text-muted">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
              </svg>
              <p className="text-sm">Bu filtrelere uygun haber bulunamadı</p>
            </div>
          ) : (
            <>
              {stories.map((story, idx) => (
                <StoryCard
                  key={story.id}
                  story={story}
                  selected={story.id === selectedStoryId || idx === selectedIdx}
                  onClick={() => {
                    setSelectedStoryId(story.id);
                    setSelectedIdx(idx);
                  }}
                />
              ))}
              {loadingMore && (
                <div className="flex items-center justify-center py-4">
                  <div className="w-4 h-4 border border-text-muted border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              {stories.length >= total && stories.length > 0 && (
                <div className="py-4 text-center text-xs text-text-dim">
                  {total} haberin tamamı yüklendi
                </div>
              )}
              <div ref={loaderRef} className="h-1" />
            </>
          )}
        </div>
      </div>

      {/* Detail drawer (inline on large screens) */}
      {selectedStoryId && <StoryDrawer />}
    </div>
  );
}
