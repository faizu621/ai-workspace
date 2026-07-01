"use client";

import React from "react";
import { create } from "zustand";
import { AnimatePresence, motion } from "framer-motion";
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from "lucide-react";

export interface Toast {
  id: string;
  title: string;
  description?: string;
  type?: "default" | "success" | "warning" | "destructive" | "info";
  duration?: number;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  dismissToast: (id: string) => void;
}

const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (t) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { ...t, id };
    
    set((state) => ({ toasts: [...state.toasts, newToast] }));
    
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((x) => x.id !== id) }));
    }, t.duration || 4000);
  },
  dismissToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((x) => x.id !== id) })),
}));

export const toast = (t: Omit<Toast, "id">) => {
  useToastStore.getState().addToast(t);
};

export const ToastProvider: React.FC = () => {
  const { toasts, dismissToast } = useToastStore();

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => {
          let Icon = Info;
          let iconColor = "text-blue-500";
          let borderColor = "border-border";

          if (t.type === "success") {
            Icon = CheckCircle;
            iconColor = "text-emerald-500";
            borderColor = "border-emerald-500/25";
          } else if (t.type === "warning") {
            Icon = AlertTriangle;
            iconColor = "text-amber-500";
            borderColor = "border-amber-500/25";
          } else if (t.type === "destructive") {
            Icon = AlertCircle;
            iconColor = "text-rose-500";
            borderColor = "border-rose-500/25";
          }

          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
              className={`flex items-start gap-3 p-4 rounded-xl border bg-card/95 backdrop-blur-md text-foreground shadow-lg pointer-events-auto ${borderColor}`}
            >
              <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${iconColor}`} />
              <div className="flex-1">
                <h4 className="text-sm font-semibold leading-tight">{t.title}</h4>
                {t.description && (
                  <p className="mt-1 text-xs text-muted-foreground leading-normal">
                    {t.description}
                  </p>
                )}
              </div>
              <button
                onClick={() => dismissToast(t.id)}
                className="text-muted-foreground hover:text-foreground shrink-0 rounded-lg p-0.5 hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
