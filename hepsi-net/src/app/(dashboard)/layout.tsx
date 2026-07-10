"use client";

import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { BreakingTicker } from "@/components/layout/BreakingTicker";
import { ToastContainer } from "@/components/layout/ToastContainer";
import { NotificationPanel } from "@/components/layout/NotificationPanel";
import { GlobalSearch } from "@/components/layout/GlobalSearch";
import { KeyboardHelp } from "@/components/layout/KeyboardHelp";
import { ContentStudio } from "@/components/content/ContentStudio";
import { useAppStore } from "@/lib/store";
import { useEffect } from "react";

function KeyboardHandler() {
  const { openSearch, triggerRefresh, keyboardHelpOpen, toggleKeyboardHelp } = useAppStore();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      const isInput = ["INPUT", "TEXTAREA", "SELECT"].includes(tag) || (e.target as HTMLElement).isContentEditable;
      if (isInput) return;

      if (e.key === "/" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        openSearch();
      }
      if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        triggerRefresh();
      }
      if (e.key === "?" || (e.key === "h" && e.shiftKey)) {
        toggleKeyboardHelp();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [openSearch, triggerRefresh, keyboardHelpOpen, toggleKeyboardHelp]);

  return null;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { contentStudioStoryId } = useAppStore();

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header />
      <BreakingTicker />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-hidden relative">
          {children}
        </main>
      </div>

      <ToastContainer />
      <NotificationPanel />
      <GlobalSearch />
      <KeyboardHelp />
      <KeyboardHandler />

      {contentStudioStoryId && <ContentStudio storyId={contentStudioStoryId} />}
    </div>
  );
}
