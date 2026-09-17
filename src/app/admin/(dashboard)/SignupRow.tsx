"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ConfirmButton } from "@/components/ConfirmButton";
import { useToast } from "@/components/Toast";
import { BellIcon, CheckIcon, PencilIcon, TrashIcon } from "@/components/Icons";

export function SignupRow({
  signupId,
  reminderSent,
}: {
  signupId: string;
  reminderSent: boolean;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

  async function toggleReminder() {
    setBusy(true);
    const res = await fetch(`/api/admin/signups/${signupId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reminderSent: !reminderSent }),
    });
    setBusy(false);
    if (!res.ok) {
      toast("Couldn't update the reminder.", "error");
      return;
    }
    toast(reminderSent ? "Reminder unmarked." : "Marked as reminded.");
    router.refresh();
  }

  async function remove() {
    setBusy(true);
    const res = await fetch(`/api/admin/signups/${signupId}`, {
      method: "DELETE",
    });
    setBusy(false);
    if (!res.ok) {
      toast("Couldn't remove the signup.", "error");
      return;
    }
    toast("Signup removed — the week is open again.");
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={toggleReminder}
        disabled={busy}
        aria-pressed={reminderSent}
        className={`btn btn-sm ${
          reminderSent
            ? "border border-[color:var(--ok)]/30 bg-[color:var(--ok)]/10 text-[color:var(--ok)]"
            : "btn-secondary"
        }`}
      >
        {reminderSent ? (
          <CheckIcon className="h-4 w-4" />
        ) : (
          <BellIcon className="h-4 w-4" />
        )}
        {reminderSent ? "Reminder sent" : "Mark reminder sent"}
      </button>

      <Link href={`/admin/signups/${signupId}`} className="btn btn-sm btn-ghost">
        <PencilIcon className="h-4 w-4" />
        Edit
      </Link>

      <ConfirmButton
        onConfirm={remove}
        disabled={busy}
        confirmLabel="Tap again to remove"
        className="btn btn-sm btn-ghost text-[color:var(--need)]"
        confirmClassName="btn btn-sm btn-danger"
      >
        <span className="inline-flex items-center gap-2">
          <TrashIcon className="h-4 w-4" />
          Remove
        </span>
      </ConfirmButton>
    </div>
  );
}
