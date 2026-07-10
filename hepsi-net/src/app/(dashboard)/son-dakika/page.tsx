"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { StoryCard, StoryCardSkeleton } from "@/components/news/StoryCard";
import { StoryDrawer } from "@/components/news/StoryDrawer";
import type { StoryListItem } from "@/lib/types";

export default function SonDakikaPage() {
  const { selectedStoryId, setSelectedStoryId } = useAppStore();
  const [stories, setStories] = useState<StoryListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/news?breaking=true&sort=EN_YENİ&limit=50")
      .then((r) => r.json())
      .then((d) => setStories(d.stories ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex h-full overflow-hidden">
      <div className={`flex flex-col flex-1 min-w-0 overflow-hidden ${selectedStoryId ? "hidden lg:flex" : "flex"}`}>
        <div className="flex-none px-4 py-2 border-b border-border bg-bg-secondary flex items-center gap-2">
          <span className="live-dot w-2 h-2 rounded-full bg-brand-red inline-block" />
          <span className="text-brand-red text-xs font-bold tracking-widest">SON DAKİKA</span>
          {!loading && <span className="ml-auto text-xs text-text-muted tabular-nums">{stories.length} haber</span>}
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => <StoryCardSkeleton key={i} />)
            : stories.length === 0
            ? <div className="flex items-center justify-center h-40 text-text-muted text-sm">Son dakika haberi yok</div>
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
