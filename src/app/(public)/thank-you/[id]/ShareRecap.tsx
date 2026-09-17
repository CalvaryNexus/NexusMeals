"use client";

import { useToast } from "@/components/Toast";
import { CopyIcon } from "@/components/Icons";

/**
 * Copies the whole recap as plain text — most volunteers immediately forward
 * these details to whoever is cooking with them.
 */
export function ShareRecap({ text }: { text: string }) {
  const { toast } = useToast();

  async function share() {
    try {
      await navigator.clipboard.writeText(text);
      toast("Details copied — paste them anywhere.");
    } catch {
      toast("Couldn't copy automatically. Select the text instead.", "error");
    }
  }

  return (
    <button type="button" onClick={share} className="btn btn-ghost btn-sm">
      <CopyIcon className="h-4 w-4" />
      Copy the details
    </button>
  );
}
