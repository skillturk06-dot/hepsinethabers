"use client";

import { create } from "zustand";
import type { ToastMessage } from "./types";

interface AppStore {
  // Selected story
  selectedStoryId: string | null;
  setSelectedStoryId: (id: string | null) => void;

  // Content studio
  contentStudioStoryId: string | null;
  openContentStudio: (storyId: string) => void;
  closeContentStudio: () => void;

  // Global search
  searchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;

  // Sidebar
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;

  // Toast
  toasts: ToastMessage[];
  addToast: (msg: Omit<ToastMessage, "id">) => void;
  removeToast: (id: string) => void;

  // Notification panel
  notifOpen: boolean;
  toggleNotifPanel: () => void;

  // Keyboard help
  keyboardHelpOpen: boolean;
  toggleKeyboardHelp: () => void;

  // Feed refresh signal
  refreshSignal: number;
  triggerRefresh: () => void;
}

export const useAppStore = create<AppStore>((set) => ({
  selectedStoryId: null,
  setSelectedStoryId: (id) => set({ selectedStoryId: id }),

  contentStudioStoryId: null,
  openContentStudio: (storyId) => set({ contentStudioStoryId: storyId }),
  closeContentStudio: () => set({ contentStudioStoryId: null }),

  searchOpen: false,
  openSearch: () => set({ searchOpen: true }),
  closeSearch: () => set({ searchOpen: false }),

  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  toasts: [],
  addToast: (msg) =>
    set((s) => ({
      toasts: [...s.toasts, { ...msg, id: Math.random().toString(36).slice(2) }],
    })),
  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  notifOpen: false,
  toggleNotifPanel: () => set((s) => ({ notifOpen: !s.notifOpen })),

  keyboardHelpOpen: false,
  toggleKeyboardHelp: () => set((s) => ({ keyboardHelpOpen: !s.keyboardHelpOpen })),

  refreshSignal: 0,
  triggerRefresh: () => set((s) => ({ refreshSignal: s.refreshSignal + 1 })),
}));
