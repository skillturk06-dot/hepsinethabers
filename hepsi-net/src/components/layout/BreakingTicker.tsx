"use client";

import { useEffect, useState } from "react";
import type { StoryListItem } from "@/lib/types";

export function BreakingTicker() {
  const [stories, setStories] = useState<StoryListItem[]>([]);

  useEffect(() => {
    const fetch2 = async () => {
      try {
        const res = await fetch("/api/news?breaking=true&limit=10&sort=EN_YENİ");
        const data = await res.json();
        setStories(data.stories ?? []);
      } catch {
        // ignore
      }
    };
    fetch2();
    const t = setInterval(fetch2, 60000);
    return () => clearInterval(t);
  }, []);

  if (stories.length === 0) return null;

  const tickerText = stories.map((s) => s.headline).join("   ●   ");

  return (
    <div className="flex-none h-7 border-b border-border bg-bg flex items-center overflow-hidden">
      {/* Label */}
      <div className="flex-none flex items-center gap-1.5 px-3 border-r border-border bg-brand-red h-full">
        <span className="live-dot w-1.5 h-1.5 rounded-full bg-white" />
        <span className="text-white text-[10px] font-bold tracking-widest uppercase whitespace-nowrap">
          Son Dakika
        </span>
      </div>

      {/* Ticker */}
      <div className="ticker-wrapper flex-1 h-full flex items-center overflow-hidden">
        <div className="ticker-content text-text-secondary text-xs">
          {tickerText}
        </div>
      </div>
    </div>
  );
}
