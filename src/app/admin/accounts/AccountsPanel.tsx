"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Admin } from "@/lib/types";

export function AccountsPanel({
  admins,
  currentAdminId,
}: {
  admins: Admin[];
  currentAdminId: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"owner" | "viewer">("viewer");
  const [error, setError] = useState<string | null>(null);
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
    if (!res.ok) {
      setError(data.error ?? "Could not create account.");
      setSubmitting(false);
      return;
    }
    setEmail("");
    setPassword("");
    setRole("viewer");
    setSubmitting(false);
    router.refresh();
  }

  async function toggleDisabled(id: string, disabled: boolean) {
    await fetch(`/api/admin/accounts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ disabled }),
    });
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Delete this account? This can't be undone.")) return;
    await fetch(`/api/admin/accounts/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <section>
        <h2 className="font-heading text-navy-text text-xl mb-3">
          Team accounts
        </h2>
        <div className="space-y-2">
          {admins.map((a) => (
            <div
              key={a.id}
              className="rounded-[12px] border border-rule bg-paper p-4 flex flex-wrap items-center justify-between gap-3"
            >
              <div>
                <p className="font-semibold">{a.email}</p>
                <p className="text-ink-soft text-sm">
                  {a.role} {a.disabled && "(disabled)"}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => toggleDisabled(a.id, !a.disabled)}
                  className="text-sm font-semibold underline text-navy-text"
                >
                  {a.disabled ? "Enable" : "Disable"}
                </button>
                {a.id !== currentAdminId && (
                  <button
                    onClick={() => remove(a.id)}
                    className="text-sm font-semibold underline text-need"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-heading text-navy-text text-xl mb-3">
          Add a team account
        </h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block font-semibold mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="tap-target w-full rounded-[8px] border border-rule px-3 py-2"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="tap-target w-full rounded-[8px] border border-rule px-3 py-2"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "owner" | "viewer")}
              className="tap-target w-full rounded-[8px] border border-rule px-3 py-2"
            >
              <option value="viewer">Viewer</option>
              <option value="owner">Owner</option>
            </select>
          </div>
          {error && <p className="text-need font-semibold">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="tap-target inline-flex items-center justify-center rounded-[8px] bg-navy px-6 py-2.5 text-white font-semibold hover:bg-navy-text transition-colors disabled:opacity-60"
          >
            {submitting ? "Creating..." : "Create account"}
          </button>
        </form>
      </section>
    </div>
  );
}
