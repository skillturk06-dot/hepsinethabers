"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useAppStore } from "@/lib/store";
import { cn, timeAgo } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface SearchResults {
  stories: { id: string; headline: string; category: string; publishedAt: Date; sourceName: string }[];
  sources: { id: string; name: string; domain: string; active: boolean }[];
  keywords: { id: string; term: string; priority: string; color: string }[];
}

export function GlobalSearch() {
  const { searchOpen, closeSearch, setSelectedStoryId } = useAppStore();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (searchOpen) {
      setQuery("");
      setResults(null);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [searchOpen]);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setResults(null); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.results ?? null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 200);
    return () => clearTimeout(debounceRef.current);
  }, [query, search]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        if (searchOpen) closeSearch();
        else useAppStore.getState().openSearch();
      }
      if (e.key === "Escape" && searchOpen) closeSearch();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [searchOpen, closeSearch]);

  if (!searchOpen) return null;

  const hasResults = results && (
    results.stories.length + results.sources.length + results.keywords.length > 0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24">
      <div className="fixed inset-0 drawer-overlay" onClick={closeSearch} />
      <div className="relative w-full max-w-2xl bg-bg-secondary border border-border rounded-lg shadow-2xl overflow-hidden animate-fade-in">
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted flex-none">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Haber, kaynak, anahtar kelime ara..."
            className="flex-1 bg-transparent text-text-primary placeholder-text-muted text-sm outline-none"
          />
          {loading && (
            <div className="w-4 h-4 border border-text-muted border-t-transparent rounded-full animate-spin" />
          )}
          <kbd className="text-[10px] text-text-dim border border-border rounded px-1.5 py-0.5">ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {!query && (
            <div className="px-4 py-8 text-center text-text-muted text-sm">
              Aramak için yazmaya başlayın
            </div>
          )}

          {query && !hasResults && !loading && (
            <div className="px-4 py-8 text-center text-text-muted text-sm">
              "{query}" için sonuç bulunamadı
            </div>
          )}

          {results && results.stories.length > 0 && (
            <div>
              <div className="px-4 py-2 text-[10px] font-bold tracking-widest text-text-muted uppercase border-b border-border">
                Haberler
              </div>
              {results.stories.map((story) => (
                <button
                  key={story.id}
                  onClick={() => {
                    setSelectedStoryId(story.id);
                    router.push(`/haber-akisi?story=${story.id}`);
                    closeSearch();
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-bg-elevated transition-colors border-b border-border/50"
                  type="button"
                >
                  <div className="flex items-start gap-3">
                    <span className="category-badge mt-0.5 flex-none">{story.category}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-text-primary truncate">{story.headline}</p>
                      <p className="text-xs text-text-muted mt-0.5">
                        {story.sourceName} · {timeAgo(story.publishedAt)}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {results && results.sources.length > 0 && (
            <div>
              <div className="px-4 py-2 text-[10px] font-bold tracking-widest text-text-muted uppercase border-b border-border">
                Kaynaklar
              </div>
              {results.sources.map((src) => (
                <button
                  key={src.id}
                  onClick={() => { router.push("/kaynaklar"); closeSearch(); }}
                  className="w-full text-left px-4 py-2.5 hover:bg-bg-elevated transition-colors border-b border-border/50"
                  type="button"
                >
                  <div className="flex items-center gap-3">
                    <img src={`https://www.google.com/s2/favicons?sz=16&domain=${src.domain}`} alt="" className="w-4 h-4" />
                    <span className="text-sm text-text-primary">{src.name}</span>
                    <span className="text-xs text-text-muted">{src.domain}</span>
                    <span className={cn("ml-auto text-[10px] font-medium", src.active ? "text-status-normal" : "text-text-muted")}>
                      {src.active ? "Aktif" : "Pasif"}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {results && results.keywords.length > 0 && (
            <div>
              <div className="px-4 py-2 text-[10px] font-bold tracking-widest text-text-muted uppercase border-b border-border">
                Anahtar Kelimeler
              </div>
              {results.keywords.map((kw) => (
                <button
                  key={kw.id}
                  onClick={() => { router.push("/anahtar-kelimeler"); closeSearch(); }}
                  className="w-full text-left px-4 py-2.5 hover:bg-bg-elevated transition-colors border-b border-border/50"
                  type="button"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full" style={{ background: kw.color }} />
                    <span className="text-sm text-text-primary">{kw.term}</span>
                    <span className="ml-auto text-[10px] text-text-muted">{kw.priority}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 px-4 py-2 border-t border-border text-[10px] text-text-dim">
          <span><kbd className="border border-border rounded px-1">↑↓</kbd> seçin</span>
          <span><kbd className="border border-border rounded px-1">Enter</kbd> aç</span>
          <span><kbd className="border border-border rounded px-1">Esc</kbd> kapat</span>
          <span className="ml-auto">Ctrl+K ile aç</span>
        </div>
      </div>
    </div>
  );
}
