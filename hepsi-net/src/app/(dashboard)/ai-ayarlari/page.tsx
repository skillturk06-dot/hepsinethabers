"use client";

import { useEffect, useState } from "react";

export default function AIAyarlariPage() {
  const [status, setStatus] = useState<{ configured: boolean } | null>(null);

  useEffect(() => {
    fetch("/api/ai/status").then((r) => r.json()).then(setStatus);
  }, []);

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-2xl mx-auto space-y-4">
        <h1 className="text-lg font-bold text-text-primary">AI Ayarları</h1>

        <div className="border border-border rounded bg-bg-secondary p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-text-primary">Anthropic Claude</span>
            {status?.configured ? (
              <span className="text-status-normal text-xs font-bold border border-status-normal/30 rounded px-2 py-0.5">✓ Aktif</span>
            ) : (
              <span className="text-brand-red text-xs font-bold border border-brand-red/30 rounded px-2 py-0.5">Yapılandırılmamış</span>
            )}
          </div>

          {!status?.configured && (
            <div className="bg-bg-elevated rounded p-3 text-xs text-text-secondary space-y-2">
              <p className="font-semibold text-text-primary">AI'yı etkinleştirmek için:</p>
              <p>1. <code className="bg-bg text-accent-cyan rounded px-1">.env.local</code> dosyasına ekleyin:</p>
              <code className="block bg-bg rounded p-2 text-accent-cyan">ANTHROPIC_API_KEY=sk-ant-...</code>
              <p>2. Uygulamayı yeniden başlatın</p>
              <p className="text-text-muted">AI olmadan içerikler manuel olarak düzenlenebilir.</p>
            </div>
          )}

          <div className="text-xs text-text-muted space-y-1">
            <div className="flex gap-2"><span className="text-text-dim">Model:</span><span>{process.env.NEXT_PUBLIC_AI_MODEL ?? "claude-sonnet-5"}</span></div>
            <div className="flex gap-2"><span className="text-text-dim">Güvenlik:</span><span>API anahtarı yalnızca sunucu tarafında kullanılır</span></div>
            <div className="flex gap-2"><span className="text-text-dim">Editöryal kurallar:</span><span>AI sistem talimatları ile zorlanır</span></div>
          </div>
        </div>

        <div className="border border-border rounded bg-bg-secondary p-4 space-y-2">
          <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">AI Editöryal Kısıtlamalar</div>
          {[
            "Yalnızca kaynak gerçekler kullanılır",
            "İsim, sayı, tarih, konum icat edilmez",
            "İddialar korunur ('iddia edildi' → kesinleşmiş yapılmaz)",
            "Tabloid dil kullanılmaz",
            "Tam olarak 3 hashtag üretilir",
            "Resmi Türkçe haber dili kullanılır",
          ].map((rule) => (
            <div key={rule} className="flex items-center gap-2 text-xs text-text-secondary">
              <span className="text-status-normal">✓</span> {rule}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
