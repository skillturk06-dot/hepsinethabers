"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function ToastContainer() {
  const { toasts, removeToast } = useAppStore();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onDismiss={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function Toast({
  type,
  message,
  onDismiss,
}: {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
  onDismiss: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  const colors = {
    success: "bg-bg-elevated border-status-normal/40 text-status-normal",
    error: "bg-bg-elevated border-brand-red/40 text-brand-red",
    info: "bg-bg-elevated border-accent-cyan/30 text-accent-cyan",
    warning: "bg-bg-elevated border-status-high/40 text-status-high",
  };

  const icons = {
    success: "✓",
    error: "✕",
    info: "ℹ",
    warning: "⚠",
  };

  return (
    <div
      className={cn(
        "toast-enter flex items-center gap-2 px-3 py-2 rounded border text-sm shadow-xl min-w-48",
        colors[type]
      )}
    >
      <span className="font-bold text-xs">{icons[type]}</span>
      <span className="text-text-primary">{message}</span>
      <button
        onClick={onDismiss}
        className="ml-auto text-text-muted hover:text-text-secondary"
        type="button"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  );
}
