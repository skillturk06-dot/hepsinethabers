import { Suspense } from "react";
import { NewsFeed } from "@/components/news/NewsFeed";

export default function HaberAkisiPage() {
  return (
    <div className="h-full overflow-hidden">
      <Suspense fallback={<div className="flex items-center justify-center h-full text-text-muted">Yükleniyor...</div>}>
        <NewsFeed />
      </Suspense>
    </div>
  );
}
