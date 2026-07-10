"use client";

import { useEffect, useState } from "react";
import { cn, timeAgo, formatDateTime } from "@/lib/utils";
import { useAppStore } from "@/lib/store";

interface PublishedStory {
  id: string;
  headline: string;
  category: string;
  editorialStatus: string;
  publishedAt: Date;
  url: string;
  sourceName: string;
  contentDrafts: {
    id: string;
    headline?: string | null;
    caption?: string | null;
    hashtags: string[];
    instagramUrl?: string | null;
  }[];
}

export default function YayinlananlarPage() {
  const { addToast } = useAppStore();
  const [stories, setStories] = useState<PublishedStory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/news?status=YAYINLANDI&sort=EN_YENİ&limit=50").then((r) => r.json()),
      fetch("/api/news?status=HAZIR&sort=EN_YENİ&limit=50").then((r) => r.json()),
    ])
      .then(([published, ready]) => {
        const all = [...(published.stories ?? []), ...(ready.stories ?? [])];
        all.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
        setStories(all);
      })
      .finally(() => setLoading(false));
  }, []);

  const setInstagramUrl = async (storyId: string, url: string) => {
    await fetch("/api/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storyId, instagramUrl: url }),
    });
    addToast({ type: "success", message: "Instagram URL kaydedildi" });
  };

  if (loading) return (
    <div className="h-full flex items-center justify-center">
      <div className="w-5 h-5 border border-text-muted border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-lg font-bold text-text-primary">Yayınlananlar</h1>
          <p className="text-text-muted text-sm mt-1">Hazırlanan ve yayınlanan içerikler</p>
        </div>

        {stories.length === 0 ? (
          <div className="text-center py-16 text-text-muted">
            <p>Henüz yayınlanan içerik yok</p>
            <p className="text-xs mt-2">İçerik Stüdyosu'ndan hazırlanan içerikler burada görünür</p>
          </div>
        ) : (
          <div className="space-y-3">
            {stories.map((story) => (
              <div key={story.id} className="border border-border rounded bg-bg-secondary p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="category-badge">{story.category}</span>
                      <span className={cn(
                        "text-[10px] font-bold px-1.5 py-0.5 rounded border",
                        `status-${story.editorialStatus}`
                      )}>
                        {story.editorialStatus}
                      </span>
                      <span className="text-[11px] text-text-muted ml-auto tabular-nums">
                        {timeAgo(story.publishedAt)}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-text-primary">{story.headline}</h3>
                    <p className="text-[11px] text-text-muted mt-0.5">{story.sourceName}</p>
                  </div>
                  <a
                    href={story.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-none text-text-muted hover:text-accent-cyan text-xs"
                  >
                    Kaynak ↗
                  </a>
                </div>

                {/* Instagram URL input */}
                <div className="flex items-center gap-2">
                  <input
                    placeholder="Instagram post URL'si (isteğe bağlı)..."
                    className="flex-1 px-3 py-1.5 bg-bg-elevated border border-border rounded text-xs text-text-primary outline-none focus:border-border-bright"
                    onBlur={(e) => {
                      if (e.target.value) setInstagramUrl(story.id, e.target.value);
                    }}
                  />
                  <span className="text-[10px] text-text-dim">Instagram URL</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
