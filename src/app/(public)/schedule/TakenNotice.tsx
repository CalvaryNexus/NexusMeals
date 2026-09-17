"use client";

import { useState } from "react";
import { AlertIcon, CloseIcon } from "@/components/Icons";

/**
 * Shown when a signup lost the race for a week. Previously this redirect
 * landed on the schedule with no explanation at all.
 */
export function TakenNotice() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div
      role="status"
      className="mb-6 flex items-start gap-3 rounded-[14px] border border-[color:var(--warn)]/30 bg-[color:var(--warn)]/8 px-4 py-3.5 enter-up"
    >
      <AlertIcon className="mt-0.5 h-5 w-5 flex-none text-[color:var(--warn)]" />
      <div className="flex-1 text-sm">
        <p className="font-semibold text-ink">
          Someone claimed that Sunday a moment before you did.
        </p>
        <p className="mt-0.5 text-ink-soft">
          Nothing was saved. Pick another open week below — there are still
          plenty that need a meal.
        </p>
      </div>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        className="-m-1 flex-none rounded-full p-1 text-ink-faint transition-colors hover:bg-black/5 hover:text-ink"
      >
        <CloseIcon className="h-4 w-4" />
      </button>
    </div>
  );
}
