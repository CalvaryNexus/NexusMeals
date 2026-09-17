"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function SignupRow({
  signupId,
  reminderSent,
}: {
  signupId: string;
  reminderSent: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function toggleReminder() {
    setBusy(true);
    await fetch(`/api/admin/signups/${signupId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reminderSent: !reminderSent }),
    });
    router.refresh();
    setBusy(false);
  }

  async function remove() {
    if (!confirm("Remove this signup? This reopens the week.")) return;
    setBusy(true);
    await fetch(`/api/admin/signups/${signupId}`, { method: "DELETE" });
    router.refresh();
    setBusy(false);
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <button
        onClick={toggleReminder}
        disabled={busy}
        className={`tap-target rounded-[8px] px-3 py-1.5 text-sm font-semibold border ${
          reminderSent
            ? "bg-ok/10 text-ok border-ok/30"
            : "bg-white text-ink-soft border-rule"
        }`}
      >
        {reminderSent ? "Reminder sent" : "Mark reminder sent"}
      </button>
      <Link
        href={`/admin/signups/${signupId}`}
        className="text-navy-text underline text-sm font-semibold"
      >
        Edit
      </Link>
      <button
        onClick={remove}
        disabled={busy}
        className="text-need underline text-sm font-semibold"
      >
        Remove
      </button>
    </div>
  );
}
