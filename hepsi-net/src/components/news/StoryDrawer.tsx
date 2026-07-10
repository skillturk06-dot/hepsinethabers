"use client";

import { useEffect, useState, useCallback } from "react";
import { useAppStore } from "@/lib/store";
import { cn, timeAgo, formatDateTime, getFaviconUrl, getImportanceBadge, STATUSES, STATUS_LABELS } from "@/lib/utils";
import type { StoryDetail } from "@/lib/types";

interface FactRowProps { label: string; value?: string | null; }
function FactRow({ label, value }: FactRowProps) {
  return (
    <div className="flex gap-3 py-2 border-b border-border/50">
      <span className="flex-none text-[10px] font-bold text-text-muted uppercase tracking-wider w-28">{label}</span>
      <span className="flex-1 text-sm text-text-secondary">{value ?? "Bilgi bulunamadı"}</span>
    </div>
  );
}

export function StoryDrawer() {
  const { selectedStoryId, setSelectedStoryId, openContentStudio, addToast } = useAppStore();
  const [story, setStory] = useState<StoryDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusChanging, setStatusChanging] = useState(false);

  const load = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/news/${id}`);
      const data = await res.json();
      setStory(data);
    } catch {
      addToast({ type: "error", message: "Haber detayı yüklenemedi" });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    if (selectedStoryId) load(selectedStoryId);
    else setStory(null);
  }, [selectedStoryId, load]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedStoryId(null);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [setSelectedStoryId]);

  const changeStatus = async (status: string) => {
    if (!story) return;
    setStatusChanging(true);
    try {
      await fetch(`/api/news/${story.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ editorialStatus: status }),
      });
      setStory((prev) => prev ? { ...prev, editorialStatus: status } : prev);
      addToast({ type: "success", message: `Durum: ${status}` });
    } catch {
      addToast({ type: "error", message: "Durum değiştirilemedi" });
    } finally {
      setStatusChanging(false);
    }
  };

  const hideStory = async () => {
    if (!story) return;
    await fetch(`/api/news/${story.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isHidden: true }),
    });
    addToast({ type: "info", message: "Haber gizlendi" });
    setSelectedStoryId(null);
  };

  if (!selectedStoryId) return null;

  const badge = story ? getImportanceBadge(story.importanceScore) : null;

  return (
    <>
      <div
        className="fixed inset-0 z-20 drawer-overlay lg:hidden"
        onClick={() => setSelectedStoryId(null)}
      />
      <div className="flex-none w-96 border-l border-border bg-bg-secondary flex flex-col h-full overflow-hidden animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border flex-none">
          <button
            onClick={() => setSelectedStoryId(null)}
            className="text-text-muted hover:text-text-primary transition-colors"
            type="button"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          <span className="text-sm font-medium text-text-secondary">Haber Detayı</span>
          {story && (
            <span className={cn("ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded", badge?.className)}>
              {story.importanceScore} {badge?.label}
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton h-4 rounded" />
            ))}
          </div>
        ) : !story ? (
          <div className="flex-1 flex items-center justify-center text-text-muted text-sm">
            Yükleniyor...
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {/* Thumbnail */}
            {story.thumbnailUrl && (
              <div className="w-full h-40 overflow-hidden">
                <img src={story.thumbnailUrl} alt="" className="w-full h-full object-cover" />
              </div>
            )}

            <div className="p-4 space-y-4">
              {/* Source + time */}
              <div className="flex items-center gap-2">
                <img src={getFaviconUrl(story.sourceDomain)} alt={story.sourceName} className="w-4 h-4" />
                <span className="text-xs font-semibold text-text-secondary">{story.sourceName}</span>
                <span className="text-text-dim text-xs">·</span>
                <span className="text-xs text-text-muted tabular-nums">{timeAgo(story.publishedAt)}</span>
                <span className={cn("ml-auto category-badge")}>{story.category}</span>
              </div>

              {/* Headline */}
              <h2 className="text-base font-bold text-text-primary leading-snug">
                {story.headline}
              </h2>

              {/* Breaking badge */}
              {story.isBreaking && (
                <div className="inline-flex items-center gap-1.5 text-brand-red text-xs font-bold border border-brand-red/30 rounded px-2 py-1">
                  <span className="live-dot w-1.5 h-1.5 rounded-full bg-brand-red" />
                  SON DAKİKA
                </div>
              )}

              {/* Snippet */}
              {story.snippet && (
                <p className="text-sm text-text-muted leading-relaxed border-l-2 border-border pl-3">
                  {story.snippet}
                </p>
              )}

              {/* Meta */}
              <div className="text-xs text-text-dim space-y-1">
                <div>Yayınlanma: {formatDateTime(story.publishedAt)}</div>
                <div>Tespit: {formatDateTime(story.detectedAt)}</div>
              </div>

              {/* Cluster members */}
              {story.clusterMembers && story.clusterMembers.length > 0 && (
                <div className="border border-border rounded p-3 bg-bg-elevated/30">
                  <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">
                    {story.clusterMembers.length + 1} KAYNAK AYNI KONUYU İŞLİYOR
                  </div>
                  <div className="space-y-2">
                    {story.clusterMembers.map((m) => (
                      <div key={m.storyId} className="flex items-center gap-2 text-xs text-text-secondary">
                        <span className="text-text-muted">{timeAgo(m.publishedAt)}</span>
                        <span className="font-medium">{m.sourceName}</span>
                        <a
                          href={m.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-auto text-text-muted hover:text-accent-cyan"
                        >
                          ↗
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Facts */}
              <div>
                <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">
                  Haber Gerçekleri
                </div>
                <div className="rounded border border-border overflow-hidden">
                  <FactRow label="Ne Oldu?" value={story.factWhat} />
                  <FactRow label="Nerede?" value={story.factWhere} />
                  <FactRow label="Ne Zaman?" value={story.factWhen} />
                  <FactRow label="Kim/Kimler?" value={story.factWho} />
                  <FactRow label="Sonuç Ne?" value={story.factResult} />
                  {story.factDetails && <FactRow label="Önemli Detaylar" value={story.factDetails} />}
                </div>
              </div>

              {/* Status selector */}
              <div>
                <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">
                  Editöryal Durum
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      onClick={() => changeStatus(s)}
                      disabled={statusChanging}
                      className={cn(
                        "px-2 py-1 text-[10px] font-bold rounded border transition-all",
                        story.editorialStatus === s
                          ? `status-${s}`
                          : "text-text-dim border-border/50 hover:border-border"
                      )}
                      type="button"
                    >
                      {STATUS_LABELS[s]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer actions */}
        {story && (
          <div className="flex-none px-4 py-3 border-t border-border flex gap-2">
            <a
              href={story.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-3 py-2 text-xs font-medium text-text-secondary border border-border rounded hover:border-border-bright hover:text-text-primary transition-colors text-center"
            >
              Kaynağı Aç ↗
            </a>
            <button
              onClick={() => changeStatus("İNCELENİYOR")}
              className="px-3 py-2 text-xs font-medium text-text-secondary border border-border rounded hover:border-border-bright hover:text-text-primary transition-colors"
              type="button"
            >
              İncele
            </button>
            <button
              onClick={() => { openContentStudio(story.id); }}
              className="flex-1 px-3 py-2 text-xs font-bold text-white bg-brand-red hover:bg-brand-red-dim rounded transition-colors"
              type="button"
            >
              İçeriğe Hazırla
            </button>
          </div>
        )}
        {story && (
          <div className="flex-none px-4 pb-3">
            <button
              onClick={hideStory}
              className="w-full px-3 py-1.5 text-xs text-text-dim hover:text-text-muted transition-colors"
              type="button"
            >
              Haberi Gizle
            </button>
          </div>
        )}
      </div>
    </>
  );
}
