"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";

export default function AyarlarPage() {
  const { addToast } = useAppStore();
  const [aiConfigured, setAiConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/ai/status").then((r) => r.json()).then((d) => setAiConfigured(d.configured)).catch(() => setAiConfigured(false));
  }, []);

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-lg font-bold text-text-primary">Ayarlar</h1>
          <p className="text-text-muted text-sm mt-1">Platform yapılandırması</p>
        </div>

        {/* General */}
        <SettingsSection title="GENEL">
          <SettingsRow label="Platform Adı" description="Dashboard başlık">
            <input defaultValue="HEPSİ NET" className="px-3 py-1.5 bg-bg-elevated border border-border rounded text-sm text-text-primary outline-none w-48" />
          </SettingsRow>
          <SettingsRow label="Zaman Dilimi" description="Haber saatleri için">
            <select defaultValue="Europe/Istanbul" className="px-3 py-1.5 bg-bg-elevated border border-border rounded text-sm text-text-primary outline-none">
              <option value="Europe/Istanbul">Europe/Istanbul (UTC+3)</option>
            </select>
          </SettingsRow>
        </SettingsSection>

        {/* Ingestion */}
        <SettingsSection title="HABer ÇEKME">
          <SettingsRow label="Yenileme Aralığı" description="Kaynaklar ne sıklıkla kontrol edilsin">
            <select defaultValue="300000" className="px-3 py-1.5 bg-bg-elevated border border-border rounded text-sm text-text-primary outline-none">
              <option value="60000">1 dakika</option>
              <option value="300000">5 dakika</option>
              <option value="600000">10 dakika</option>
              <option value="1800000">30 dakika</option>
            </select>
          </SettingsRow>
          <SettingsRow label="Veri Çekme" description="Manuel güncelleme başlat">
            <button
              onClick={() => {
                fetch("/api/ingest", { method: "POST" });
                addToast({ type: "info", message: "Veri çekme başlatıldı" });
              }}
              className="px-4 py-1.5 border border-border rounded text-xs text-text-secondary hover:border-border-bright hover:text-text-primary transition-colors"
              type="button"
            >
              Şimdi Güncelle
            </button>
          </SettingsRow>
        </SettingsSection>

        {/* Editorial */}
        <SettingsSection title="EDİTÖRYEL">
          <SettingsRow label="Hashtag Sayısı" description="İçerik başına hashtag">
            <select defaultValue="3" className="px-3 py-1.5 bg-bg-elevated border border-border rounded text-sm text-text-primary outline-none">
              <option value="3">3 (zorunlu kural)</option>
            </select>
          </SettingsRow>
          <SettingsRow label="Yasaklı İfadeler" description="AI içeriğinde kullanılmayacak ifadeler">
            <div className="text-xs text-text-muted max-w-xs">
              gündem oldu, sosyal medyayı salladı, bomba gibi düştü, şoke etti
              <br /><span className="text-text-dim">(Ayarlar API'nden düzenlenebilir)</span>
            </div>
          </SettingsRow>
        </SettingsSection>

        {/* AI */}
        <SettingsSection title="YAPay ZEKA">
          <SettingsRow label="AI Sağlayıcı" description="İçerik üretim motoru">
            <span className="text-sm text-text-secondary">Anthropic Claude</span>
          </SettingsRow>
          <SettingsRow label="Model" description="Aktif AI modeli">
            <span className="text-sm text-text-secondary font-mono">{process.env.NEXT_PUBLIC_AI_MODEL ?? "claude-sonnet-5"}</span>
          </SettingsRow>
          <SettingsRow label="API Durumu" description="ANTHROPIC_API_KEY ortam değişkeni">
            {aiConfigured === null ? (
              <span className="text-text-muted text-xs">Kontrol ediliyor...</span>
            ) : aiConfigured ? (
              <span className="text-status-normal text-xs font-bold">✓ Yapılandırıldı</span>
            ) : (
              <div>
                <span className="text-brand-red text-xs font-bold">✕ Yapılandırılmamış</span>
                <p className="text-[10px] text-text-muted mt-0.5">ANTHROPIC_API_KEY ortam değişkeni gerekli. İçerikler manuel düzenlenebilir.</p>
              </div>
            )}
          </SettingsRow>
          <SettingsRow label="Gizlilik" description="API anahtarı güvenliği">
            <span className="text-xs text-text-muted">API anahtarı asla istemciye gönderilmez. Yalnızca sunucu tarafında kullanılır.</span>
          </SettingsRow>
        </SettingsSection>

        {/* Database */}
        <SettingsSection title="VERİTABANI">
          <SettingsRow label="Sağlayıcı" description="ORM">
            <span className="text-sm text-text-secondary">PostgreSQL · Prisma</span>
          </SettingsRow>
          <SettingsRow label="Demo Verisi" description="Seed durumu">
            <div className="text-xs text-text-muted">
              Demo verileri aktif (haber/kaynak/anahtar kelimeler). Gerçek RSS kaynakları eklendikçe gerçek data öncelik alır.
            </div>
          </SettingsRow>
        </SettingsSection>
      </div>
    </div>
  );
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-border rounded bg-bg-secondary">
      <div className="px-4 py-2 border-b border-border">
        <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{title}</span>
      </div>
      <div className="divide-y divide-border">{children}</div>
    </div>
  );
}

function SettingsRow({ label, description, children }: { label: string; description: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4 px-4 py-3">
      <div className="flex-none w-44">
        <div className="text-sm font-medium text-text-primary">{label}</div>
        <div className="text-[11px] text-text-muted mt-0.5">{description}</div>
      </div>
      <div className="flex-1 flex items-center">{children}</div>
    </div>
  );
}
