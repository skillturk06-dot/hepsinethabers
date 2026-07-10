"use client";

import { useEffect, useState } from "react";
import type { AnalyticsData } from "@/lib/types";

function StatCard({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div className="bg-bg-secondary border border-border rounded p-4">
      <div className="text-2xl font-bold text-text-primary tabular-nums">{value}</div>
      <div className="text-xs text-text-muted mt-1 font-medium">{label}</div>
      {sub && <div className="text-[10px] text-text-dim mt-0.5">{sub}</div>}
    </div>
  );
}

export default function IstatistiklerPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto grid grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-24 rounded" />)}
      </div>
    </div>
  );

  if (!data) return <div className="flex items-center justify-center h-full text-text-muted">Veri yüklenemedi</div>;

  const maxHour = Math.max(...(data.storiesByHour.map((h) => h.count) || [1]));

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-lg font-bold text-text-primary">İstatistikler</h1>
          <p className="text-text-muted text-sm mt-1">Demo verisi — gerçek kaynak entegrasyonu sonrası canlı</p>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <StatCard label="Bugün Gelen Haber" value={data.todayStories} />
          <StatCard label="Son 1 Saatte" value={data.lastHourStories} />
          <StatCard label="Kritik Haber" value={data.criticalStories} sub="Önem skoru ≥75" />
          <StatCard label="Hazırlanan İçerik" value={data.preparedContent} />
          <StatCard label="Yayınlanan" value={data.publishedContent} />
          <StatCard label="Atlanan" value={data.skippedStories} />
        </div>

        {/* Stories by hour */}
        <div className="border border-border rounded p-4 bg-bg-secondary">
          <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4">Son 24 Saatte Haber Dağılımı</div>
          {data.storiesByHour.length === 0 ? (
            <div className="text-text-muted text-sm text-center py-6">Veri yok</div>
          ) : (
            <div className="flex items-end gap-1 h-24">
              {data.storiesByHour.map((h) => (
                <div key={h.hour} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-brand-red/40 hover:bg-brand-red/60 rounded-sm transition-colors"
                    style={{ height: `${Math.max((h.count / maxHour) * 80, 4)}px` }}
                    title={`${h.hour}: ${h.count} haber`}
                  />
                  <span className="text-[8px] text-text-dim tabular-nums">{h.hour.slice(0, 2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Category distribution */}
          <div className="border border-border rounded p-4 bg-bg-secondary">
            <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Kategori Dağılımı</div>
            <div className="space-y-2">
              {data.categoryDistribution.slice(0, 8).map((c) => {
                const maxCat = Math.max(...data.categoryDistribution.map((x) => x.count));
                return (
                  <div key={c.category} className="flex items-center gap-2">
                    <span className="text-xs text-text-secondary w-24 truncate">{c.category}</span>
                    <div className="flex-1 h-1.5 bg-bg-elevated rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent-cyan/60 rounded-full"
                        style={{ width: `${(c.count / maxCat) * 100}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-text-muted tabular-nums w-6 text-right">{c.count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top sources */}
          <div className="border border-border rounded p-4 bg-bg-secondary">
            <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">En Aktif Kaynaklar (Bugün)</div>
            <div className="space-y-2">
              {data.topSources.map((s, i) => (
                <div key={s.name} className="flex items-center gap-2">
                  <span className="text-[10px] text-text-dim w-4 tabular-nums">{i + 1}</span>
                  <span className="text-xs text-text-secondary flex-1 truncate">{s.name}</span>
                  <span className="text-[11px] text-text-muted tabular-nums">{s.count}</span>
                </div>
              ))}
              {data.topSources.length === 0 && <div className="text-text-muted text-sm">Bugün haber yok</div>}
            </div>
          </div>
        </div>

        {/* Trend topics */}
        {data.trendTopics.length > 0 && (
          <div className="border border-border rounded p-4 bg-bg-secondary">
            <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Trend Konular</div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {data.trendTopics.slice(0, 8).map((t) => (
                <div key={t.topic} className="border border-border rounded p-3 hover:border-border-bright transition-colors">
                  <div className="text-sm font-semibold text-text-primary">{t.topic}</div>
                  <div className="text-xs text-status-high mt-1">↑ %{t.velocityPct}</div>
                  <div className="text-[10px] text-text-muted mt-1 tabular-nums">{t.storyCount} haber · {t.sourceCount} kaynak</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
