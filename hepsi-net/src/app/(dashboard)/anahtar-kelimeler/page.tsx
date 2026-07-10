"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { KeywordItem } from "@/lib/types";
import { useAppStore } from "@/lib/store";

const PRIORITIES = ["LOW", "NORMAL", "HIGH", "CRITICAL"];
const PRIORITY_COLORS: Record<string, string> = {
  LOW: "text-text-muted",
  NORMAL: "text-accent-cyan",
  HIGH: "text-status-high",
  CRITICAL: "text-brand-red",
};

export default function AnahtarKelimelerPage() {
  const { addToast } = useAppStore();
  const [keywords, setKeywords] = useState<KeywordItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ term: "", priority: "NORMAL", color: "#EF4444", notifyEnabled: true, weight: 5 });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const res = await fetch("/api/keywords");
    setKeywords(await res.json());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!form.term.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setForm({ term: "", priority: "NORMAL", color: "#EF4444", notifyEnabled: true, weight: 5 });
      addToast({ type: "success", message: "Anahtar kelime eklendi" });
      load();
    } catch {
      addToast({ type: "error", message: "Eklenemedi" });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    await fetch(`/api/keywords/${id}`, { method: "DELETE" });
    setKeywords((prev) => prev.filter((k) => k.id !== id));
    addToast({ type: "info", message: "Silindi" });
  };

  const toggle = async (id: string, notifyEnabled: boolean) => {
    await fetch(`/api/keywords/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notifyEnabled: !notifyEnabled }),
    });
    setKeywords((prev) => prev.map((k) => k.id === id ? { ...k, notifyEnabled: !k.notifyEnabled } : k));
  };

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-lg font-bold text-text-primary">Anahtar Kelimeler</h1>
          <p className="text-text-muted text-sm mt-1">İzleme listesi — eşleşince bildirim gönderilir</p>
        </div>

        {/* Add form */}
        <div className="p-4 border border-border rounded bg-bg-secondary mb-4 space-y-3">
          <div className="text-xs font-bold text-text-muted uppercase tracking-wider">Yeni Kelime Ekle</div>
          <div className="flex gap-3 flex-wrap">
            <input
              placeholder="Kelime veya ifade..."
              value={form.term}
              onChange={(e) => setForm((f) => ({ ...f, term: e.target.value }))}
              onKeyDown={(e) => e.key === "Enter" && add()}
              className="flex-1 min-w-40 px-3 py-2 bg-bg-elevated border border-border rounded text-sm text-text-primary outline-none focus:border-border-bright"
            />
            <select
              value={form.priority}
              onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
              className="px-3 py-2 bg-bg-elevated border border-border rounded text-sm text-text-primary outline-none"
            >
              {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <input
              type="number"
              value={form.weight}
              onChange={(e) => setForm((f) => ({ ...f, weight: parseInt(e.target.value) }))}
              min={1} max={20}
              title="Ağırlık (1-20)"
              className="w-16 px-3 py-2 bg-bg-elevated border border-border rounded text-sm text-text-primary outline-none text-center"
            />
            <input
              type="color"
              value={form.color}
              onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
              className="w-10 h-10 rounded border border-border bg-bg-elevated cursor-pointer"
              title="Renk"
            />
            <button
              onClick={add}
              disabled={saving || !form.term.trim()}
              className="px-4 py-2 bg-brand-red text-white text-xs font-bold rounded hover:bg-brand-red-dim disabled:opacity-50 transition-colors"
              type="button"
            >
              {saving ? "Ekleniyor..." : "Ekle"}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-12 rounded" />)}
          </div>
        ) : keywords.length === 0 ? (
          <div className="text-center py-16 text-text-muted text-sm">Henüz anahtar kelime eklenmedi</div>
        ) : (
          <div className="border border-border rounded overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-bg-elevated">
                  <th className="text-left px-4 py-2 text-[10px] font-bold text-text-muted uppercase tracking-wider">Kelime</th>
                  <th className="text-left px-4 py-2 text-[10px] font-bold text-text-muted uppercase tracking-wider">Öncelik</th>
                  <th className="text-left px-4 py-2 text-[10px] font-bold text-text-muted uppercase tracking-wider">Ağırlık</th>
                  <th className="text-left px-4 py-2 text-[10px] font-bold text-text-muted uppercase tracking-wider">Eşleşme</th>
                  <th className="text-left px-4 py-2 text-[10px] font-bold text-text-muted uppercase tracking-wider">Bildirim</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody>
                {keywords.map((kw) => (
                  <tr key={kw.id} className="border-b border-border hover:bg-bg-elevated/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full flex-none" style={{ background: kw.color }} />
                        <span className="text-sm font-medium text-text-primary">{kw.term}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("text-xs font-bold", PRIORITY_COLORS[kw.priority])}>{kw.priority}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-text-secondary tabular-nums">{kw.weight}</td>
                    <td className="px-4 py-3 text-sm text-text-secondary tabular-nums">{kw.matchCount}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggle(kw.id, kw.notifyEnabled)}
                        className={cn(
                          "text-[10px] font-bold px-2 py-0.5 rounded border transition-colors",
                          kw.notifyEnabled
                            ? "text-status-normal border-status-normal/30"
                            : "text-text-muted border-border"
                        )}
                        type="button"
                      >
                        {kw.notifyEnabled ? "Açık" : "Kapalı"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => remove(kw.id)}
                        className="text-text-dim hover:text-brand-red transition-colors"
                        type="button"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
