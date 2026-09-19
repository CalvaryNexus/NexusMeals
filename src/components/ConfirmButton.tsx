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
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  useEffect(() => {
    if (!armed) return;
    function onDocumentClick(event: MouseEvent) {
      // Never disarm on our own click. This listener must not run before
      // React dispatches the button's onClick — a capture-phase listener
      // would disarm first, and React would then dispatch with the
      // re-rendered (disarmed) handler, so the confirm could never fire.
      if (buttonRef.current?.contains(event.target as Node)) return;
      setArmed(false);
    }
    document.addEventListener("click", onDocumentClick);
    return () => document.removeEventListener("click", onDocumentClick);
  }, [armed]);

  function handleClick() {
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
      ref={buttonRef}
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
