"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { AlertIcon, CheckCircleIcon, CloseIcon, InfoIcon } from "./Icons";

type ToastTone = "success" | "error" | "info";

interface Toast {
  id: number;
  tone: ToastTone;
  message: string;
}

interface ToastApi {
  toast: (message: string, tone?: ToastTone) => void;
}

/**
 * Defaults to a no-op so a client component can call `useToast()` without
 * caring whether a provider happens to be mounted above it.
 */
const ToastContext = createContext<ToastApi>({ toast: () => {} });

export function useToast(): ToastApi {
  return useContext(ToastContext);
}

const TONE_STYLES: Record<ToastTone, { wrap: string; icon: React.ReactNode }> = {
  success: {
    wrap: "border-[color:var(--ok)]/30 bg-[color:var(--ok)]/8 text-[color:var(--ok)]",
    icon: <CheckCircleIcon className="h-5 w-5" />,
  },
  error: {
    wrap: "border-[color:var(--need)]/30 bg-[color:var(--need)]/8 text-[color:var(--need)]",
    icon: <AlertIcon className="h-5 w-5" />,
  },
  info: {
    wrap: "border-card-line bg-card text-navy-text",
    icon: <InfoIcon className="h-5 w-5" />,
  },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, tone: ToastTone = "success") => {
      const id = nextId.current++;
      setToasts((list) => [...list.slice(-2), { id, tone, message }]);
      window.setTimeout(() => dismiss(id), 4200);
    },
    [dismiss],
  );

  const api = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 px-4 pb-4 sm:items-end sm:px-6 sm:pb-6"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-[14px] border bg-paper px-4 py-3 shadow-[var(--shadow-3)] ${TONE_STYLES[t.tone].wrap}`}
            style={{ animation: "nm-toast-in 320ms var(--ease-spring) both" }}
          >
            <span className="mt-0.5 flex-none">{TONE_STYLES[t.tone].icon}</span>
            <p className="flex-1 text-sm font-semibold text-ink">{t.message}</p>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss"
              className="-m-1 flex-none rounded-full p-1 text-ink-faint transition-colors hover:bg-black/5 hover:text-ink"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
