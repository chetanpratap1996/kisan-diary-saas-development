"use client";

import * as React from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ToastVariant = "success" | "error" | "info" | "default";

interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface Toast extends ToastOptions {
  id: string;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const ToastContext = React.createContext<{
  toast: (options: ToastOptions) => void;
  dismiss: (id: string) => void;
} | null>(null);

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const toast = React.useCallback((options: ToastOptions) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev.slice(-4), { ...options, id }]); // keep max 5
  }, []);

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      <ToastPrimitives.Provider swipeDirection="right">
        {children}

        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}

        <ToastPrimitives.Viewport
          className="fixed bottom-20 right-4 z-[9999] flex flex-col gap-2 w-[min(calc(100vw-32px),360px)] outline-none"
          aria-label="Notifications"
        />
      </ToastPrimitives.Provider>
    </ToastContext.Provider>
  );
}

// ─── Toast Item ───────────────────────────────────────────────────────────────

const VARIANT_STYLES: Record<ToastVariant, { bg: string; icon: React.ReactNode }> = {
  success: {
    bg: "bg-green-600",
    icon: <CheckCircle2 className="w-5 h-5 text-white shrink-0" />,
  },
  error: {
    bg: "bg-red-600",
    icon: <AlertCircle className="w-5 h-5 text-white shrink-0" />,
  },
  info: {
    bg: "bg-blue-600",
    icon: <Info className="w-5 h-5 text-white shrink-0" />,
  },
  default: {
    bg: "bg-gray-900",
    icon: <Info className="w-5 h-5 text-white shrink-0" />,
  },
};

function ToastItem({
  toast: t,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: () => void;
}) {
  const { bg, icon } = VARIANT_STYLES[t.variant ?? "default"];

  return (
    <ToastPrimitives.Root
      duration={t.duration ?? 4000}
      onOpenChange={(open) => { if (!open) onDismiss(); }}
      className={cn(
        "group pointer-events-auto flex items-start gap-3 w-full rounded-2xl p-4 shadow-xl",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full",
        "data-[state=open]:slide-in-from-bottom-full",
        bg
      )}
      aria-live="assertive"
    >
      {icon}
      <div className="flex-1 min-w-0">
        <ToastPrimitives.Title className="text-sm font-semibold text-white leading-snug">
          {t.title}
        </ToastPrimitives.Title>
        {t.description && (
          <ToastPrimitives.Description className="text-xs text-white/80 mt-0.5 leading-relaxed">
            {t.description}
          </ToastPrimitives.Description>
        )}
      </div>
      <ToastPrimitives.Close
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="text-white/70 hover:text-white transition-colors shrink-0 -mt-0.5"
      >
        <X className="w-4 h-4" />
      </ToastPrimitives.Close>
    </ToastPrimitives.Root>
  );
}
