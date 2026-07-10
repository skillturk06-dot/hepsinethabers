"use client";

import { Suspense } from "react";
import { NewsFeed } from "@/components/news/NewsFeed";

export default function IcerikHazirlaPage() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-none px-4 py-2 border-b border-border bg-bg-elevated/50 text-xs text-text-muted flex items-center gap-2">
        <span className="text-accent-cyan font-bold">İÇERİK HAZIRLAMA MODU</span>
        <span>—</span>
        <span>Bir haber seçin, sağ panelden "İçeriğe Hazırla" butonuna tıklayın</span>
      </div>
      <div className="flex-1 overflow-hidden">
        <Suspense fallback={null}>
          <NewsFeed />
        </Suspense>
      </div>
    </div>
  );
}
