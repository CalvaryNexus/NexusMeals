"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmButton } from "@/components/ConfirmButton";
import { useToast } from "@/components/Toast";
import {
  AlertIcon,
  LockIcon,
  PlusIcon,
  ShieldIcon,
  TrashIcon,
} from "@/components/Icons";
import type { Admin } from "@/lib/types";

export function AccountsPanel({
  admins,
  currentAdminId,
}: {
  admins: Admin[];
  currentAdminId: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"owner" | "viewer">("viewer");
  const [error, setError] = useState<string | null>(null);
  const [errorKey, setErrorKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const res = await fetch("/api/admin/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role }),
    });
    const data = await res.json().catch(() => ({}));
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error ?? "Could not create account.");
      setErrorKey((k) => k + 1);
      return;
    }
    toast(`${email} can now sign in.`);
    setEmail("");
    setPassword("");
    setRole("viewer");
    router.refresh();
  }

  async function toggleDisabled(admin: Admin) {
    const res = await fetch(`/api/admin/accounts/${admin.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ disabled: !admin.disabled }),
    });
    if (!res.ok) {
      toast("Couldn't update that account.", "error");
      return;
    }
    toast(admin.disabled ? "Account enabled." : "Account disabled.");
    router.refresh();
  }

  async function remove(admin: Admin) {
    const res = await fetch(`/api/admin/accounts/${admin.id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      toast("Couldn't delete that account.", "error");
      return;
    }
    toast("Account deleted.");
    router.refresh();
  }

  return (
    <div className="max-w-2xl space-y-4">
      <section className="panel p-6">
        <h2 className="display text-base text-navy-text">Team accounts</h2>
        <ul className="mt-5 divide-y divide-rule">
          {admins.map((a) => (
            <li
              key={a.id}
              className={`flex flex-wrap items-center justify-between gap-3 py-3.5 first:pt-0 last:pb-0 ${
                a.disabled ? "opacity-60" : ""
              }`}
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className={`flex h-9 w-9 flex-none items-center justify-center rounded-full ${
                    a.role === "owner"
                      ? "bg-navy text-white"
                      : "bg-card text-navy-text"
                  }`}
                >
                  <ShieldIcon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-ink">{a.email}</p>
                  <p className="text-xs uppercase tracking-[0.08em] text-ink-faint">
                    {a.role}
                    {a.disabled && " · disabled"}
                    {a.id === currentAdminId && " · you"}
                  </p>
                </div>
              </div>

              <div className="flex flex-none items-center gap-1">
                <button
                  onClick={() => toggleDisabled(a)}
                  className="btn btn-sm btn-ghost"
                >
                  {a.disabled ? "Enable" : "Disable"}
                </button>
                {a.id !== currentAdminId && (
                  <ConfirmButton
                    onConfirm={() => remove(a)}
                    confirmLabel="Tap again to delete"
                    className="btn btn-sm btn-ghost text-[color:var(--need)]"
                    confirmClassName="btn btn-sm btn-danger"
                  >
                    <span className="inline-flex items-center gap-2">
                      <TrashIcon className="h-4 w-4" />
                      Delete
                    </span>
                  </ConfirmButton>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel p-6">
        <h2 className="display text-base text-navy-text">
          Add a team account
        </h2>
        <p className="mt-1 text-sm text-ink-soft">
          Viewers can see the dashboard and add signups. Owners can also change
          the overview, settings, and accounts.
        </p>

        <form onSubmit={handleCreate} className="mt-5 space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="newEmail" className="label">
                Email
              </label>
              <input
                id="newEmail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="off"
                className="field"
              />
            </div>
            <div>
              <label htmlFor="newPassword" className="label">
                Password
              </label>
              <input
                id="newPassword"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                className="field"
              />
              <p className="hint flex items-center gap-1.5">
                <LockIcon className="h-3.5 w-3.5" />
                At least 8 characters.
              </p>
            </div>
          </div>

          <div>
            <p className="label">Role</p>
            <div className="flex gap-2">
              {(["viewer", "owner"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  className="chip capitalize"
                  aria-pressed={role === r}
                  onClick={() => setRole(r)}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p
              key={errorKey}
              role="alert"
              className="shake flex items-center gap-2 rounded-[12px] border border-[color:var(--need)]/30 bg-[color:var(--need)]/8 px-4 py-3 text-sm font-semibold text-[color:var(--need)]"
            >
              <AlertIcon className="h-4 w-4 flex-none" />
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary"
          >
            {submitting ? (
              <span className="spinner" aria-hidden />
            ) : (
              <PlusIcon className="h-4 w-4" />
            )}
            {submitting ? "Creating..." : "Create account"}
          </button>
        </form>
      </section>
    </div>
  );
}
