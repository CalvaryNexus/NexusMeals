"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";
import { CheckIcon } from "@/components/Icons";

export function NeedsContactRow({ signupId }: { signupId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

  async function clear() {
    setBusy(true);
    const res = await fetch(`/api/admin/needs-contact/${signupId}`, {
      method: "DELETE",
    });
    setBusy(false);
    if (!res.ok) {
      toast("Couldn't clear that.", "error");
      return;
    }
    toast("Marked as handled.");
    router.refresh();
  }

  return (
    <button onClick={clear} disabled={busy} className="btn btn-sm btn-secondary">
      {busy ? <span className="spinner" aria-hidden /> : <CheckIcon className="h-4 w-4" />}
      Mark handled
    </button>
  );
}
