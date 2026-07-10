"use client";

import { useEffect, useState, useCallback } from "react";
import { useAppStore } from "@/lib/store";

function LiveClock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const update = () => {
      setTime(
        new Date().toLocaleTimeString("tr-TR", {
          timeZone: "Europe/Istanbul",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="tabular-nums text-text-secondary font-mono text-sm">
      {time}
    </span>
  );
}

function LastRefresh({ signal }: { signal: number }) {
  const [lastRefresh, setLastRefresh] = useState("");
  useEffect(() => {
    setLastRefresh(
      new Date().toLocaleTimeString("tr-TR", {
        timeZone: "Europe/Istanbul",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    );
  }, [signal]);
  if (!lastRefresh) return null;
  return (
    <span className="text-text-muted text-xs tabular-nums">
      Son güncelleme {lastRefresh}
    </span>
  );
}

export function Header() {
  const { openSearch, toggleNotifPanel, toggleKeyboardHelp, refreshSignal } =
    useAppStore();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnread = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications?unread=true");
      const data = await res.json();
      setUnreadCount(data.unreadCount ?? 0);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchUnread();
    const t = setInterval(fetchUnread, 30000);
    return () => clearInterval(t);
  }, [fetchUnread, refreshSignal]);

  return (
    <header className="flex-none h-12 flex items-center px-4 gap-4 border-b border-border bg-bg-secondary z-30">
      {/* Logo */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-brand-red font-black text-lg tracking-tight leading-none">
            HEPSİ
          </span>
          <span className="text-text-primary font-black text-lg tracking-tight leading-none">
            NET
          </span>
        </div>
        <div className="h-4 w-px bg-border" />
        <span className="text-text-muted text-xs font-medium tracking-widest uppercase">
          Haber Merkezi
        </span>
      </div>

      {/* Center status */}
      <div className="flex-1 flex items-center justify-center gap-4">
        <div className="flex items-center gap-2">
          <span className="live-dot w-2 h-2 rounded-full bg-brand-red inline-block" />
          <span className="text-brand-red text-xs font-semibold tracking-widest">
            CANLI
          </span>
        </div>
        <LiveClock />
        <LastRefresh signal={refreshSignal} />
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1">
        {/* Search */}
        <button
          onClick={openSearch}
          className="w-8 h-8 flex items-center justify-center rounded text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors"
          title="Ara (Ctrl+K)"
          type="button"
        >
          <SearchIcon />
        </button>

        {/* Notifications */}
        <button
          onClick={toggleNotifPanel}
          className="relative w-8 h-8 flex items-center justify-center rounded text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors"
          title="Bildirimler"
          type="button"
        >
          <BellIcon />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-brand-red text-white text-[9px] font-bold rounded-full flex items-center justify-center tabular-nums">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {/* Keyboard shortcuts */}
        <button
          onClick={toggleKeyboardHelp}
          className="w-8 h-8 flex items-center justify-center rounded text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors"
          title="Klavye kısayolları"
          type="button"
        >
          <KeyboardIcon />
        </button>

        {/* Settings */}
        <a
          href="/ayarlar"
          className="w-8 h-8 flex items-center justify-center rounded text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors"
          title="Ayarlar"
        >
          <SettingsIcon />
        </a>

        {/* Admin avatar */}
        <div className="w-7 h-7 rounded bg-brand-red-dim flex items-center justify-center text-white text-xs font-bold ml-1">
          AD
        </div>
      </div>
    </header>
  );
}

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
  );
}
function BellIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}
function SettingsIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}
function KeyboardIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M16 12h.01M7 16h10" />
    </svg>
  );
}
