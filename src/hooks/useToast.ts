"use client";

import { useState, useCallback } from "react";

export type ToastVariant = "default" | "destructive" | "success";

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
}

// Simple global state for toasts (no context needed — works with Radix Toast)
let toastListeners: Array<(toast: ToastMessage) => void> = [];

export function emitToast(toast: Omit<ToastMessage, "id">) {
  const id = Math.random().toString(36).slice(2);
  const msg: ToastMessage = { id, variant: "default", ...toast };
  toastListeners.forEach((fn) => fn(msg));
}

export function useToastEmitter() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const subscribe = useCallback(() => {
    const handler = (toast: ToastMessage) => {
      setToasts((prev) => [...prev, toast]);
    };
    toastListeners.push(handler);
    return () => {
      toastListeners = toastListeners.filter((fn) => fn !== handler);
    };
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, subscribe, dismiss };
}
