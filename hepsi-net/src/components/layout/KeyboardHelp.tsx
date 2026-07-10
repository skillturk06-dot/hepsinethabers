"use client";

import { useAppStore } from "@/lib/store";

const shortcuts = [
  { key: "J", desc: "Sonraki haber" },
  { key: "K", desc: "Önceki haber" },
  { key: "Enter", desc: "Seçili haberi aç" },
  { key: "C", desc: "İçerik hazırla" },
  { key: "R", desc: "Yenile" },
  { key: "/", desc: "Ara" },
  { key: "Ctrl+K", desc: "Hızlı arama" },
  { key: "Esc", desc: "Kapat / İptal" },
  { key: "?", desc: "Kısayol yardımı" },
];

export function KeyboardHelp() {
  const { keyboardHelpOpen, toggleKeyboardHelp } = useAppStore();
  if (!keyboardHelpOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 drawer-overlay" onClick={toggleKeyboardHelp} />
      <div className="relative bg-bg-secondary border border-border rounded-lg p-6 w-80 animate-fade-in shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-text-primary">Klavye Kısayolları</h2>
          <button onClick={toggleKeyboardHelp} className="text-text-muted hover:text-text-primary" type="button">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div className="space-y-2">
          {shortcuts.map((s) => (
            <div key={s.key} className="flex items-center justify-between">
              <span className="text-text-muted text-sm">{s.desc}</span>
              <kbd className="text-[11px] text-text-secondary bg-bg-elevated border border-border rounded px-2 py-0.5 font-mono">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
