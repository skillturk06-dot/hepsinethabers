"use client";

import { useEffect, useState } from "react";
import { cn, timeAgo } from "@/lib/utils";
import type { SourceItem } from "@/lib/types";
import { useAppStore } from "@/lib/store";

export default function KaynaklarPage() {
  const { addToast } = useAppStore();
  const [sources, setSources] = useState<SourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ name: "", domain: "", feedUrl: "", type: "RSS", priority: 5 });
  const [saving, setSaving] = useState(false);
  const [ingesting, setIngesting] = useState<string | null>(null);

  const load = async () => {
    const res = await fetch("/api/sources");
    setSources(await res.json());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggleActive = async (id: string, active: boolean) => {
    await fetch(`/api/sources/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    setSources((prev) => prev.map((s) => s.id === id ? { ...s, active: !active } : s));
  };

  const ingest = async (id: string) => {
    setIngesting(id);
    await fetch("/api/ingest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sourceId: id }),
    });
    addToast({ type: "info", message: "Veri çekme başlatıldı" });
    setIngesting(null);
    setTimeout(load, 3000);
  };

  const addSource = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      addToast({ type: "success", message: "Kaynak eklendi" });
      setAddOpen(false);
      setForm({ name: "", domain: "", feedUrl: "", type: "RSS", priority: 5 });
      load();
    } catch {
      addToast({ type: "error", message: "Kaynak eklenemedi" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-bold text-text-primary">Kaynaklar</h1>
            <p className="text-text-muted text-sm mt-1">RSS ve Atom feed kaynakları</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { fetch("/api/ingest", { method: "POST" }); addToast({ type: "info", message: "Tüm kaynaklar güncelleniyor" }); }}
              className="px-3 py-2 text-xs border border-border rounded text-text-secondary hover:border-border-bright hover:text-text-primary transition-colors"
              type="button"
            >
              Tümünü Güncelle
            </button>
            <button
              onClick={() => setAddOpen(true)}
              className="px-3 py-2 text-xs bg-brand-red text-white font-bold rounded hover:bg-brand-red-dim transition-colors"
              type="button"
            >
              + Kaynak Ekle
            </button>
          </div>
        </div>

        {/* Add form */}
        {addOpen && (
          <div className="mb-4 p-4 border border-border rounded bg-bg-secondary space-y-3">
            <div className="text-sm font-semibold text-text-primary">Yeni Kaynak</div>
            <div className="grid grid-cols-2 gap-3">
              <input
                placeholder="İsim (Anadolu Ajansı)"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="px-3 py-2 bg-bg-elevated border border-border rounded text-sm text-text-primary outline-none focus:border-border-bright"
              />
              <input
                placeholder="Domain (aa.com.tr)"
                value={form.domain}
                onChange={(e) => setForm((f) => ({ ...f, domain: e.target.value }))}
                className="px-3 py-2 bg-bg-elevated border border-border rounded text-sm text-text-primary outline-none focus:border-border-bright"
              />
              <input
                placeholder="Feed URL (RSS/Atom)"
                value={form.feedUrl}
                onChange={(e) => setForm((f) => ({ ...f, feedUrl: e.target.value }))}
                className="col-span-2 px-3 py-2 bg-bg-elevated border border-border rounded text-sm text-text-primary outline-none focus:border-border-bright"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={addSource} disabled={saving} className="px-4 py-2 bg-brand-red text-white text-xs font-bold rounded" type="button">
                {saving ? "Ekleniyor..." : "Ekle"}
              </button>
              <button onClick={() => setAddOpen(false)} className="px-4 py-2 text-xs text-text-muted border border-border rounded" type="button">
                İptal
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-14 rounded" />)}
          </div>
        ) : (
          <div className="border border-border rounded overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-bg-elevated">
                  <th className="text-left px-4 py-2 text-[10px] font-bold text-text-muted uppercase tracking-wider">Kaynak</th>
                  <th className="text-left px-4 py-2 text-[10px] font-bold text-text-muted uppercase tracking-wider">Tip</th>
                  <th className="text-left px-4 py-2 text-[10px] font-bold text-text-muted uppercase tracking-wider">Bugün</th>
                  <th className="text-left px-4 py-2 text-[10px] font-bold text-text-muted uppercase tracking-wider">Son Güncelleme</th>
                  <th className="text-left px-4 py-2 text-[10px] font-bold text-text-muted uppercase tracking-wider">Durum</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody>
                {sources.map((src) => (
                  <tr key={src.id} className="border-b border-border hover:bg-bg-elevated/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <img src={`https://www.google.com/s2/favicons?sz=16&domain=${src.domain}`} alt="" className="w-4 h-4" />
                        <div>
                          <div className="text-sm font-medium text-text-primary">{src.name}</div>
                          <div className="text-[11px] text-text-muted">{src.domain}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="category-badge">{src.type}</span>
                    </td>
                    <td className="px-4 py-3 tabular-nums text-sm text-text-secondary">{src.storiesToday}</td>
                    <td className="px-4 py-3 text-sm text-text-muted">
                      {src.lastFetchAt ? timeAgo(src.lastFetchAt) : "—"}
                      {src.lastError && (
                        <div className="text-[10px] text-brand-red mt-0.5 truncate max-w-32">{src.lastError}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleActive(src.id, src.active)}
                        className={cn(
                          "text-[10px] font-bold px-2 py-0.5 rounded border transition-colors",
                          src.active
                            ? "text-status-normal border-status-normal/30 hover:bg-status-normal/10"
                            : "text-text-muted border-border hover:border-border-bright"
                        )}
                        type="button"
                      >
                        {src.active ? "Aktif" : "Pasif"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => ingest(src.id)}
                        disabled={ingesting === src.id}
                        className="text-[10px] text-text-muted hover:text-text-secondary transition-colors border border-border/50 hover:border-border rounded px-2 py-1"
                        type="button"
                      >
                        {ingesting === src.id ? "Çekiliyor..." : "Güncelle"}
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
