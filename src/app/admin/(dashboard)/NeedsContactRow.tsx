"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function NeedsContactRow({ signupId }: { signupId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function clear() {
    setBusy(true);
    await fetch(`/api/admin/needs-contact/${signupId}`, { method: "DELETE" });
    router.refresh();
    setBusy(false);
  }

  return (
    <button
      onClick={clear}
      disabled={busy}
      className="tap-target rounded-[8px] px-3 py-1.5 text-sm font-semibold border border-rule bg-white text-ink-soft"
    >
      Clear
    </button>
  );
}
