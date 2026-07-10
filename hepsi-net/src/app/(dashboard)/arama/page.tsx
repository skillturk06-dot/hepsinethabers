"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/store";

export default function AramaPage() {
  const { openSearch } = useAppStore();
  useEffect(() => { openSearch(); }, [openSearch]);
  return <div className="flex items-center justify-center h-full text-text-muted text-sm">Arama açılıyor... (Ctrl+K)</div>;
}
