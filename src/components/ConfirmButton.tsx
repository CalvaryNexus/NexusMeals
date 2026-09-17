"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Two-step confirm that happens inline instead of in a `window.confirm`
 * dialog: the first click swaps the label to the confirmation prompt, a second
 * click within a few seconds runs the action. Clicking elsewhere cancels.
 */
export function ConfirmButton({
  onConfirm,
  children,
  confirmLabel = "Tap again to confirm",
  disabled = false,
  className = "",
  confirmClassName = "",
}: {
  onConfirm: () => void | Promise<void>;
  children: React.ReactNode;
  confirmLabel?: string;
  disabled?: boolean;
  className?: string;
  confirmClassName?: string;
}) {
  const [armed, setArmed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  useEffect(() => {
    if (!armed) return;
    function cancel() {
      setArmed(false);
    }
    document.addEventListener("click", cancel, { capture: true });
    return () => document.removeEventListener("click", cancel, { capture: true });
  }, [armed]);

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (!armed) {
      setArmed(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setArmed(false), 4000);
      return;
    }
    clearTimeout(timer.current);
    setArmed(false);
    void onConfirm();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={armed ? confirmClassName || className : className}
    >
      <span key={armed ? "armed" : "idle"} className="enter-fade">
        {armed ? confirmLabel : children}
      </span>
    </button>
  );
}
