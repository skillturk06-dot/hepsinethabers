"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { StoryCard, StoryCardSkeleton } from "./StoryCard";
import { StoryDrawer } from "./StoryDrawer";
import type { StoryListItem } from "@/lib/types";

interface StatusFeedProps {
  status: string;
  title: string;
  subtitle?: string;
}

export function StatusFeed({ status, title, subtitle }: StatusFeedProps) {
  const { selectedStoryId, setSelectedStoryId } = useAppStore();
  const [stories, setStories] = useState<StoryListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetch(`/api/news?status=${encodeURIComponent(status)}&sort=EN_YENİ&limit=50`)
      .then((r) => r.json())
      .then((d) => setStories(d.stories ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [status]);

  return (
    <div className="flex h-full overflow-hidden">
      <div className={`flex flex-col flex-1 min-w-0 overflow-hidden ${selectedStoryId ? "hidden lg:flex" : "flex"}`}>
        <div className="flex-none px-4 py-2 border-b border-border bg-bg-secondary flex items-center gap-3">
          <div>
            <span className="text-sm font-semibold text-text-primary">{title}</span>
            {subtitle && <span className="text-xs text-text-muted ml-2">{subtitle}</span>}
          </div>
          {!loading && (
            <span className="ml-auto text-xs text-text-muted tabular-nums">{stories.length} haber</span>
          )}
          <button
            onClick={load}
            className="text-xs text-text-muted hover:text-text-secondary transition-colors border border-border rounded px-2 py-1"
            type="button"
          >
            Yenile
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => <StoryCardSkeleton key={i} />)
            : stories.length === 0
            ? (
              <div className="flex flex-col items-center justify-center h-40 gap-2 text-text-muted">
                <p className="text-sm">Bu durumda haber yok</p>
              </div>
            )
            : stories.map((s) => (
                <StoryCard
                  key={s.id}
                  story={s}
                  selected={s.id === selectedStoryId}
                  onClick={() => setSelectedStoryId(s.id)}
                />
              ))
          }
        </div>
      </div>
      {selectedStoryId && <StoryDrawer />}
    </div>
  );
}
