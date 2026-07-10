"use client";

import { useEffect, useState, useCallback } from "react";
import { useAppStore } from "@/lib/store";
import { cn, timeAgo } from "@/lib/utils";
import type { NotificationItem } from "@/lib/types";

const TYPE_ICONS: Record<string, string> = {
  BREAKING: "⚡",
  KEYWORD_MATCH: "🔍",
  CLUSTER: "🔗",
  SOURCE_ERROR: "⚠",
  AI_REVIEW: "🤖",
};

const TYPE_COLORS: Record<string, string> = {
  BREAKING: "text-brand-red",
  KEYWORD_MATCH: "text-accent-cyan",
  CLUSTER: "text-status-info",
  SOURCE_ERROR: "text-status-high",
  AI_REVIEW: "text-text-secondary",
};

export function NotificationPanel() {
  const { notifOpen, toggleNotifPanel } = useAppStore();
  const [notifs, setNotifs] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      setNotifs(data.notifications ?? []);
      setUnreadCount(data.unreadCount ?? 0);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (notifOpen) load();
  }, [notifOpen, load]);

  const markAllRead = async () => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAllRead: true }),
    });
    setNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const markRead = async (id: string) => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setNotifs((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  if (!notifOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        onClick={toggleNotifPanel}
      />
      <div className="fixed top-12 right-0 w-80 h-[calc(100vh-3rem)] z-50 bg-bg-secondary border-l border-border flex flex-col animate-slide-in-right">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-text-primary">Bildirimler</span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-brand-red text-white rounded-full tabular-nums">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-text-muted hover:text-text-secondary"
                type="button"
              >
                Tümünü okundu işaretle
              </button>
            )}
            <button onClick={toggleNotifPanel} className="text-text-muted hover:text-text-primary" type="button">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {notifs.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-text-muted text-sm">
              Bildirim yok
            </div>
          ) : (
            notifs.map((n) => (
              <button
                key={n.id}
                onClick={() => markRead(n.id)}
                className={cn(
                  "w-full text-left px-4 py-3 border-b border-border hover:bg-bg-elevated transition-colors",
                  !n.isRead && "bg-bg-elevated/30"
                )}
                type="button"
              >
                <div className="flex items-start gap-2">
                  <span className={cn("text-sm mt-0.5", TYPE_COLORS[n.type])}>
                    {TYPE_ICONS[n.type] ?? "•"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm", !n.isRead ? "text-text-primary font-medium" : "text-text-secondary")}>
                      {n.title}
                    </p>
                    {n.body && (
                      <p className="text-xs text-text-muted mt-0.5 truncate">{n.body}</p>
                    )}
                    <p className="text-[10px] text-text-dim mt-1">
                      {timeAgo(n.createdAt)}
                    </p>
                  </div>
                  {!n.isRead && (
                    <span className="flex-none w-1.5 h-1.5 rounded-full bg-brand-red mt-1.5" />
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </>
  );
}
