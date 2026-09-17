"use client";

import { useEffect, useRef, useState } from "react";
import { CheckIcon, CopyIcon } from "./Icons";

/**
 * Copies a value and confirms it in place. Used for phone numbers and emails
 * on the admin dashboard, where the next step is usually pasting into a text
 * message.
 */
export function CopyButton({
  value,
  label,
  className = "",
}: {
  value: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      return;
    }
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1600);
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? "Copied" : `Copy ${label ?? value}`}
      className={`inline-flex items-center gap-1.5 rounded-[8px] px-2 py-1 text-xs font-semibold transition-colors ${
        copied
          ? "text-[color:var(--ok)]"
          : "text-ink-faint hover:bg-black/5 hover:text-navy-text"
      } ${className}`}
    >
      <span key={copied ? "y" : "n"} className="enter-pop inline-flex">
        {copied ? (
          <CheckIcon className="h-3.5 w-3.5" />
        ) : (
          <CopyIcon className="h-3.5 w-3.5" />
        )}
      </span>
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
