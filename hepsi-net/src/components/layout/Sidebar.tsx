"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";

interface NavItem {
  href: string;
  label: string;
  badge?: number | string;
  icon: React.ReactNode;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

function NavLink({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const pathname = usePathname();
  const isActive = pathname === item.href;

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-2.5 px-3 py-1.5 rounded text-sm transition-all group relative",
        isActive
          ? "bg-bg-elevated text-text-primary"
          : "text-text-muted hover:text-text-secondary hover:bg-bg-elevated/50"
      )}
      title={collapsed ? item.label : undefined}
    >
      {isActive && (
        <span className="absolute left-0 top-1 bottom-1 w-0.5 bg-brand-red rounded-r" />
      )}
      <span className={cn("flex-none", isActive ? "text-text-primary" : "text-text-muted group-hover:text-text-secondary")}>
        {item.icon}
      </span>
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{item.label}</span>
          {item.badge !== undefined && (
            <span className="flex-none text-[10px] font-semibold tabular-nums px-1.5 py-0.5 rounded-full bg-bg-elevated text-text-secondary">
              {item.badge}
            </span>
          )}
        </>
      )}
    </Link>
  );
}

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useAppStore();
  const [badges, setBadges] = useState({
    breaking: 0,
    drafts: 0,
    ready: 0,
    reviewing: 0,
  });

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const [newsRes, contentRes] = await Promise.all([
          fetch("/api/news?limit=1"),
          fetch("/api/news?limit=1"),
        ]);
        // Use static counts from stories
        const news = await newsRes.json();
        void news;
        // Approximate badge data
      } catch {
        // ignore
      }
    };
    fetchBadges();
  }, []);

  const sections: NavSection[] = [
    {
      title: "ANA PANEL",
      items: [
        { href: "/haber-akisi", label: "Haber Akışı", icon: <FeedIcon />, badge: undefined },
        { href: "/son-dakika", label: "Son Dakika", icon: <BreakingIcon />, badge: badges.breaking || undefined },
        { href: "/trendler", label: "Trendler", icon: <TrendIcon /> },
        { href: "/inceleme", label: "İncelemeye Alınanlar", icon: <ReviewIcon />, badge: badges.reviewing || undefined },
      ],
    },
    {
      title: "İÇERİK",
      items: [
        { href: "/icerik-hazirla", label: "İçerik Hazırla", icon: <ComposeIcon /> },
        { href: "/taslaklar", label: "Taslaklar", icon: <DraftIcon />, badge: badges.drafts || undefined },
        { href: "/hazir-icerikler", label: "Hazır İçerikler", icon: <ReadyIcon />, badge: badges.ready || undefined },
        { href: "/yayinlananlar", label: "Yayınlananlar", icon: <PublishedIcon /> },
      ],
    },
    {
      title: "ARAÇLAR",
      items: [
        { href: "/arama", label: "Haber Ara", icon: <SearchIcon /> },
        { href: "/kaynaklar", label: "Kaynaklar", icon: <SourceIcon /> },
        { href: "/anahtar-kelimeler", label: "Anahtar Kelimeler", icon: <KeywordIcon /> },
        { href: "/ai-ayarlari", label: "AI Ayarları", icon: <AIIcon /> },
      ],
    },
    {
      title: "SİSTEM",
      items: [
        { href: "/istatistikler", label: "İstatistikler", icon: <StatsIcon /> },
        { href: "/ayarlar", label: "Ayarlar", icon: <SettingsIcon /> },
      ],
    },
  ];

  return (
    <aside
      className={cn(
        "flex-none flex flex-col border-r border-border bg-bg-secondary transition-all duration-200",
        sidebarCollapsed ? "w-12" : "w-52"
      )}
    >
      {/* Collapse toggle */}
      <button
        onClick={toggleSidebar}
        className="flex items-center justify-center h-8 border-b border-border text-text-muted hover:text-text-secondary transition-colors"
        type="button"
        title={sidebarCollapsed ? "Genişlet" : "Daralt"}
      >
        {sidebarCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
      </button>

      <nav className="flex-1 overflow-y-auto py-2 space-y-4">
        {sections.map((section) => (
          <div key={section.title}>
            {!sidebarCollapsed && (
              <div className="px-3 pb-1">
                <span className="text-[9px] font-bold tracking-widest text-text-muted uppercase">
                  {section.title}
                </span>
              </div>
            )}
            <div className="space-y-0.5 px-1">
              {section.items.map((item) => (
                <NavLink key={item.href} item={item} collapsed={sidebarCollapsed} />
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}

// Icons
function FeedIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>; }
function BreakingIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>; }
function TrendIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>; }
function ReviewIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>; }
function ComposeIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>; }
function DraftIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>; }
function ReadyIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>; }
function PublishedIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>; }
function SearchIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>; }
function SourceIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>; }
function KeywordIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>; }
function AIIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a4 4 0 0 1 4 4 4 4 0 0 1-4 4 4 4 0 0 1-4-4 4 4 0 0 1 4-4"/><path d="M6 8a6 6 0 0 0 12 0"/><line x1="12" y1="14" x2="12" y2="22"/><line x1="8" y1="18" x2="16" y2="18"/></svg>; }
function StatsIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>; }
function SettingsIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>; }
function ChevronRightIcon() { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>; }
function ChevronLeftIcon() { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>; }
