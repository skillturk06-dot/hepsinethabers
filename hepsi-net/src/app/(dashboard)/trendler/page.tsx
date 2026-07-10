"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { TrendTopic } from "@/lib/types";

export default function TrendlerPage() {
  const [trends, setTrends] = useState<TrendTopic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then((d) => { setTrends(d.trendTopics ?? []); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-lg font-bold text-text-primary">Trend Radarı</h1>
          <p className="text-text-muted text-sm mt-1">Son 24 saatte hızla yükselen konular</p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton h-16 rounded" />
            ))}
          </div>
        ) : trends.length === 0 ? (
          <div className="text-center py-16 text-text-muted">Trend verisi bulunamadı</div>
        ) : (
          <div className="space-y-2">
            {trends.map((trend, idx) => (
              <a
                key={trend.topic}
                href={`/haber-akisi?q=${encodeURIComponent(trend.topic)}`}
                className="flex items-center gap-4 px-4 py-3 border border-border rounded bg-bg-secondary hover:bg-bg-elevated hover:border-border-bright transition-all group"
              >
                <span className="text-text-dim text-sm font-bold w-6 text-right tabular-nums">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-text-primary">{trend.topic}</span>
                    <span className={cn(
                      "text-xs font-bold",
                      trend.velocityPct > 200 ? "text-brand-red" : trend.velocityPct > 100 ? "text-status-high" : "text-status-normal"
                    )}>
                      ↑ %{trend.velocityPct}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-[11px] text-text-muted">
                    <span className="tabular-nums">{trend.storyCount} haber</span>
                    <span>·</span>
                    <span className="tabular-nums">{trend.sourceCount} kaynak</span>
                  </div>
                </div>

                {/* Bar */}
                <div className="flex-none w-24 h-1.5 bg-bg-elevated rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-red rounded-full"
                    style={{ width: `${Math.min((trend.velocityPct / 300) * 100, 100)}%` }}
                  />
                </div>

                <svg className="flex-none text-text-dim group-hover:text-text-muted transition-colors" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
