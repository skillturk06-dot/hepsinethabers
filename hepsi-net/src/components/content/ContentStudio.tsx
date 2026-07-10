"use client";

import { useEffect, useState, useCallback } from "react";
import { useAppStore } from "@/lib/store";
import { cn, getFaviconUrl, timeAgo } from "@/lib/utils";
import type { StoryDetail } from "@/lib/types";

interface GeneratedContent {
  headline: string;
  overlayText: string;
  caption: string;
  hashtags: string[];
}

interface ValidationResult {
  namesMatch: boolean;
  numbersMatch: boolean;
  locationsMatch: boolean;
  datesMatch: boolean;
  allegationsPreserved: boolean;
  hashtagCount: number;
  prohibitedPhrases: string[];
  missingDetails: string[];
  status: "GÜVENLİ" | "KONTROL GEREKİYOR";
  notes: string[];
}

const AI_ACTIONS = [
  { key: "DAHA_RESMI", label: "Daha Resmi", field: "caption" as const },
  { key: "DAHA_KISA", label: "Daha Kısa", field: "caption" as const },
  { key: "MERAK_UYANDIR", label: "Merak Uyandır", field: "overlayText" as const },
  { key: "BAŞLIĞI_DEĞİŞTİR", label: "Başlığı Değiştir", field: "headline" as const },
  { key: "AÇIKLAMAYI_YENİDEN_YAZ", label: "Açıklamayı Yeniden Yaz", field: "caption" as const },
  { key: "FARKLI_VERSİYON", label: "Farklı Versiyon", field: "caption" as const },
  { key: "ÖNEMLİ_DETAYLARI_KORU", label: "Detayları Koru", field: "caption" as const },
];

function ValidationPanel({ validation }: { validation: ValidationResult }) {
  const checks = [
    { label: "İsimler uyumlu", ok: validation.namesMatch },
    { label: "Sayılar uyumlu", ok: validation.numbersMatch },
    { label: "Konum uyumlu", ok: validation.locationsMatch },
    { label: "Tarih uyumlu", ok: validation.datesMatch },
    { label: "İddialar korundu", ok: validation.allegationsPreserved },
    { label: `Hashtag sayısı (${validation.hashtagCount}/3)`, ok: validation.hashtagCount === 3 },
  ];

  return (
    <div className={cn(
      "rounded border p-3 space-y-2",
      validation.status === "GÜVENLİ"
        ? "border-status-normal/30 bg-status-normal/5"
        : "border-status-high/30 bg-status-high/5"
    )}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Doğrulama</span>
        <span className={cn(
          "text-[10px] font-bold px-2 py-0.5 rounded border",
          validation.status === "GÜVENLİ"
            ? "text-status-normal border-status-normal/30"
            : "text-status-high border-status-high/30"
        )}>
          {validation.status}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-1">
        {checks.map((c) => (
          <div key={c.label} className="flex items-center gap-1.5 text-xs">
            <span className={c.ok ? "text-status-normal" : "text-brand-red"}>
              {c.ok ? "✓" : "✕"}
            </span>
            <span className={c.ok ? "text-text-secondary" : "text-text-muted"}>{c.label}</span>
          </div>
        ))}
      </div>
      {validation.prohibitedPhrases.length > 0 && (
        <div className="text-xs text-status-high">
          Yasaklı ifade: {validation.prohibitedPhrases.join(", ")}
        </div>
      )}
      {validation.notes.map((n, i) => (
        <div key={i} className="text-xs text-text-muted flex items-start gap-1">
          <span className="text-status-high">!</span> {n}
        </div>
      ))}
    </div>
  );
}

function ContentField({
  label,
  value,
  onChange,
  multiline,
  maxLength,
  onCopy,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  maxLength?: number;
  onCopy: () => void;
}) {
  const { addToast } = useAppStore();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    addToast({ type: "success", message: "Kopyalandı" });
    onCopy();
  };

  return (
    <div className="content-field p-3 space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
          {label}
        </label>
        <div className="flex items-center gap-2">
          {maxLength && (
            <span className={cn("text-[10px] tabular-nums", value.length > maxLength ? "text-brand-red" : "text-text-dim")}>
              {value.length}/{maxLength}
            </span>
          )}
          <button
            onClick={handleCopy}
            className="text-text-dim hover:text-text-secondary transition-colors p-0.5"
            title="Kopyala"
            type="button"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
          </button>
        </div>
      </div>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-text-primary text-sm resize-none outline-none min-h-24 leading-relaxed"
          rows={6}
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-text-primary text-sm outline-none"
        />
      )}
    </div>
  );
}

export function ContentStudio({ storyId }: { storyId: string }) {
  const { closeContentStudio, addToast } = useAppStore();
  const [story, setStory] = useState<StoryDetail | null>(null);
  const [content, setContent] = useState<GeneratedContent>({
    headline: "",
    overlayText: "",
    caption: "",
    hashtags: ["", "", ""],
  });
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [generating, setGenerating] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);

  const loadStory = useCallback(async () => {
    const res = await fetch(`/api/news/${storyId}`);
    const data = await res.json();
    setStory(data);

    // Load existing draft
    const draftRes = await fetch(`/api/content?storyId=${storyId}`);
    const draft = await draftRes.json();
    if (draft) {
      setDraftId(draft.id);
      setContent({
        headline: draft.headline ?? "",
        overlayText: draft.overlayText ?? "",
        caption: draft.caption ?? "",
        hashtags: draft.hashtags?.length === 3 ? draft.hashtags : ["", "", ""],
      });
      if (draft.validationNotes) {
        try { setValidation(JSON.parse(draft.validationNotes)); } catch { /* ignore */ }
      }
    }
  }, [storyId]);

  useEffect(() => {
    loadStory();
  }, [loadStory]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeContentStudio();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [closeContentStudio]);

  const generate = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storyId }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 503) {
          addToast({ type: "warning", message: "AI yapılandırılmamış. İçeriği manuel düzenleyebilirsiniz." });
        } else {
          addToast({ type: "error", message: data.error ?? "AI üretimi başarısız" });
        }
        return;
      }
      setContent(data.content);
      setValidation(data.validation);
      setDraftId(data.draftId);
      addToast({ type: "success", message: "İçerik üretildi" });
    } catch {
      addToast({ type: "error", message: "AI bağlantı hatası" });
    } finally {
      setGenerating(false);
    }
  };

  const runAction = async (action: string, field: string) => {
    setActionLoading(action);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storyId, action, field, currentContent: content }),
      });
      const data = await res.json();
      if (!res.ok) {
        addToast({ type: "error", message: data.error ?? "İşlem başarısız" });
        return;
      }
      if (field === "headline") setContent((c) => ({ ...c, headline: data.value }));
      else if (field === "overlayText") setContent((c) => ({ ...c, overlayText: data.value }));
      else if (field === "caption") setContent((c) => ({ ...c, caption: data.value }));
      else if (field === "hashtags") setContent((c) => ({ ...c, hashtags: data.value }));
    } catch {
      addToast({ type: "error", message: "AI bağlantı hatası" });
    } finally {
      setActionLoading(null);
    }
  };

  const save = async (status?: string) => {
    setSaving(true);
    try {
      await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storyId,
          ...content,
          ...(status && { editorialStatus: status }),
        }),
      });
      if (status === "HAZIR") {
        await fetch(`/api/news/${storyId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ editorialStatus: "HAZIR" }),
        });
      }
      addToast({ type: "success", message: status === "HAZIR" ? "İçerik hazır olarak işaretlendi" : "Taslak kaydedildi" });
    } catch {
      addToast({ type: "error", message: "Kaydetme başarısız" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex">
      <div className="fixed inset-0 drawer-overlay" onClick={closeContentStudio} />
      <div className="relative ml-auto w-full max-w-5xl bg-bg-secondary border-l border-border flex flex-col animate-slide-in-right shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-border flex-none bg-bg-tertiary">
          <button
            onClick={closeContentStudio}
            className="text-text-muted hover:text-text-primary transition-colors"
            type="button"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          <span className="text-sm font-semibold text-text-primary">İçerik Stüdyosu</span>
          <span className="text-text-muted text-xs">—</span>
          <span className="text-xs text-text-muted truncate max-w-sm">{story?.headline ?? "Yükleniyor..."}</span>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={generate}
              disabled={generating}
              className="flex items-center gap-2 px-4 py-1.5 bg-brand-red hover:bg-brand-red-dim text-white text-xs font-bold rounded transition-colors disabled:opacity-50"
              type="button"
            >
              {generating ? (
                <>
                  <div className="w-3 h-3 border border-white/50 border-t-white rounded-full animate-spin" />
                  Üretiliyor...
                </>
              ) : (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                  </svg>
                  AI ile Üret
                </>
              )}
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Source panel */}
          <div className="w-72 flex-none border-r border-border overflow-y-auto p-4 space-y-4">
            {story ? (
              <>
                <div>
                  <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Kaynak</div>
                  <div className="flex items-center gap-2 mb-2">
                    <img src={getFaviconUrl(story.sourceDomain)} alt={story.sourceName} className="w-4 h-4" />
                    <span className="text-xs font-medium text-text-secondary">{story.sourceName}</span>
                    <span className="text-[10px] text-text-muted">{timeAgo(story.publishedAt)}</span>
                  </div>
                  <p className="text-sm font-semibold text-text-primary leading-snug">{story.headline}</p>
                  {story.snippet && (
                    <p className="text-xs text-text-muted mt-2 leading-relaxed">{story.snippet}</p>
                  )}
                </div>

                {story.clusterMembers && story.clusterMembers.length > 0 && (
                  <div>
                    <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">
                      İlgili Kaynaklar ({story.clusterMembers.length})
                    </div>
                    <div className="space-y-2">
                      {story.clusterMembers.map((m) => (
                        <div key={m.storyId} className="flex items-start gap-2 text-xs border border-border rounded p-2">
                          <div className="flex-1">
                            <span className="font-medium text-text-secondary">{m.sourceName}</span>
                            <p className="text-text-muted text-[11px] mt-0.5 line-clamp-2">{m.headline}</p>
                          </div>
                          <a href={m.url} target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-accent-cyan flex-none">↗</a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Gerçekler</div>
                  <div className="space-y-2 text-xs">
                    {story.factWhat && <div><span className="text-text-dim">Ne: </span><span className="text-text-secondary">{story.factWhat}</span></div>}
                    {story.factWhere && <div><span className="text-text-dim">Nerede: </span><span className="text-text-secondary">{story.factWhere}</span></div>}
                    {story.factWhen && <div><span className="text-text-dim">Ne zaman: </span><span className="text-text-secondary">{story.factWhen}</span></div>}
                    {story.factWho && <div><span className="text-text-dim">Kim: </span><span className="text-text-secondary">{story.factWho}</span></div>}
                    {story.factResult && <div><span className="text-text-dim">Sonuç: </span><span className="text-text-secondary">{story.factResult}</span></div>}
                    {!story.factWhat && !story.factWhere && !story.factWhen && (
                      <span className="text-text-dim">Çıkarılan gerçek bulunamadı</span>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-4 rounded" />)}
              </div>
            )}
          </div>

          {/* Right: Content editor */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* AI Actions */}
            <div className="flex flex-wrap gap-1.5">
              {AI_ACTIONS.map((action) => (
                <button
                  key={action.key}
                  onClick={() => runAction(action.key, action.field)}
                  disabled={actionLoading === action.key || generating}
                  className="px-2.5 py-1 text-xs rounded border border-border text-text-muted hover:text-text-primary hover:border-border-bright transition-all disabled:opacity-40"
                  type="button"
                >
                  {actionLoading === action.key ? (
                    <span className="flex items-center gap-1">
                      <div className="w-2.5 h-2.5 border border-text-muted border-t-transparent rounded-full animate-spin" />
                      {action.label}
                    </span>
                  ) : action.label}
                </button>
              ))}
            </div>

            {/* No AI configured note */}
            {!process.env.NEXT_PUBLIC_AI_CONFIGURED && (
              <div className="text-xs text-text-muted border border-border rounded p-2 bg-bg-elevated/30">
                <span className="text-status-high">AI yapılandırılmamış.</span>{" "}
                İçerikleri manuel olarak düzenleyebilirsiniz. AI için ANTHROPIC_API_KEY ortam değişkeni gerekli.
              </div>
            )}

            <ContentField
              label="Başlık"
              value={content.headline}
              onChange={(v) => setContent((c) => ({ ...c, headline: v }))}
              maxLength={80}
              onCopy={() => {}}
            />

            <ContentField
              label="Post Üstü Yazı (Instagram Görseli)"
              value={content.overlayText}
              onChange={(v) => setContent((c) => ({ ...c, overlayText: v }))}
              maxLength={120}
              onCopy={() => {}}
            />

            <ContentField
              label="Post Altı Açıklama (Instagram Altyazı)"
              value={content.caption}
              onChange={(v) => setContent((c) => ({ ...c, caption: v }))}
              multiline
              onCopy={() => {}}
            />

            {/* Hashtags */}
            <div className="content-field p-3 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                  Hashtagler (tam 3 adet)
                </label>
                <button
                  onClick={async () => {
                    await navigator.clipboard.writeText(content.hashtags.join(" "));
                    addToast({ type: "success", message: "Kopyalandı" });
                  }}
                  className="text-text-dim hover:text-text-secondary transition-colors"
                  title="Kopyala"
                  type="button"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                </button>
              </div>
              <div className="flex gap-2 flex-wrap">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex items-center">
                    <input
                      value={content.hashtags[i] ?? ""}
                      onChange={(e) => {
                        const tags = [...content.hashtags];
                        let v = e.target.value;
                        if (!v.startsWith("#") && v) v = "#" + v;
                        tags[i] = v;
                        setContent((c) => ({ ...c, hashtags: tags }));
                      }}
                      placeholder={`#hashtag${i + 1}`}
                      className="bg-bg-elevated border border-border rounded px-2 py-1 text-sm text-accent-cyan font-medium w-36 outline-none focus:border-border-bright"
                    />
                  </div>
                ))}
              </div>
              {content.hashtags.filter(h => h && h !== "#").length !== 3 && (
                <p className="text-[10px] text-brand-red">Editöryal kural: Tam olarak 3 hashtag gereklidir</p>
              )}
            </div>

            {/* Validation */}
            {validation && <ValidationPanel validation={validation} />}
          </div>
        </div>

        {/* Footer */}
        <div className="flex-none flex items-center gap-3 px-5 py-3 border-t border-border bg-bg-tertiary">
          <button
            onClick={closeContentStudio}
            className="px-4 py-2 text-xs text-text-muted border border-border rounded hover:border-border-bright transition-colors"
            type="button"
          >
            Kapat
          </button>
          <button
            onClick={() => save()}
            disabled={saving}
            className="px-4 py-2 text-xs text-text-primary border border-border rounded hover:border-border-bright transition-colors"
            type="button"
          >
            {saving ? "Kaydediliyor..." : "Taslak Kaydet"}
          </button>
          <button
            onClick={() => save("HAZIR")}
            disabled={saving}
            className="ml-auto px-6 py-2 text-xs font-bold text-white bg-status-normal hover:bg-status-normal/80 rounded transition-colors"
            type="button"
          >
            Hazır Olarak İşaretle
          </button>
        </div>
      </div>
    </div>
  );
}
