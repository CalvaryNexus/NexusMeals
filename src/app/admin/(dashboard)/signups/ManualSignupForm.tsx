"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";
import { AlertIcon, InfoIcon } from "@/components/Icons";
import { formatUsPhone } from "@/lib/phone";

const CONSENT_LINE =
  "Your contact info is only used by the Nexus team to coordinate your meal and send reminders.";

interface WeekOption {
  date: string;
  label: string;
}

export function ManualSignupForm({
  mode,
  signupId,
  weeks,
  initial,
}: {
  mode: "create" | "edit";
  signupId?: string;
  weeks?: WeekOption[];
  initial?: {
    date?: string;
    name: string;
    email: string;
    phone: string;
    meal: string;
  };
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [date, setDate] = useState(initial?.date ?? weeks?.[0]?.date ?? "");
  const [name, setName] = useState(initial?.name ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [meal, setMeal] = useState(initial?.meal ?? "");
  const [error, setError] = useState<string | null>(null);
  const [errorKey, setErrorKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const url =
      mode === "create"
        ? "/api/admin/signups"
        : `/api/admin/signups/${signupId}`;
    const method = mode === "create" ? "POST" : "PATCH";
    const payload =
      mode === "create"
        ? { date, name, email, phone, meal }
        : { name, email, phone, meal };

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      setErrorKey((k) => k + 1);
      setSubmitting(false);
      return;
    }
    toast(mode === "create" ? "Signup added." : "Changes saved.");
    router.push("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="panel max-w-xl space-y-5 p-6">
      {mode === "create" && weeks && (
        <div>
          <label htmlFor="date" className="label">
            Week
          </label>
          <select
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="field"
          >
            {weeks.map((w) => (
              <option key={w.date} value={w.date}>
                {w.label}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label htmlFor="name" className="label">
          Full name
        </label>
        <input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={120}
          autoComplete="off"
          className="field"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className="label">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            maxLength={200}
            autoComplete="off"
            className="field"
          />
        </div>

        <div>
          <label htmlFor="phone" className="label">
            Primary phone
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(formatUsPhone(e.target.value))}
            required
            placeholder="(555) 555-5555"
            autoComplete="off"
            className="field"
          />
        </div>
      </div>

      <div>
        <label htmlFor="meal" className="label">
          Meal description
        </label>
        <textarea
          id="meal"
          value={meal}
          onChange={(e) => setMeal(e.target.value)}
          required
          maxLength={280}
          rows={3}
          className="field"
        />
        <p className="hint text-right tabular-nums">{meal.length}/280</p>
      </div>

      <p className="flex items-start gap-2.5 rounded-[12px] border border-card-line bg-card p-3.5 text-sm text-ink">
        <InfoIcon className="mt-0.5 h-4 w-4 flex-none text-navy-stripe" />
        <span>
          Read to the volunteer: &ldquo;{CONSENT_LINE}&rdquo;
        </span>
      </p>

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

      <button type="submit" disabled={submitting} className="btn btn-primary">
        {submitting && <span className="spinner" aria-hidden />}
        {submitting
          ? "Saving..."
          : mode === "create"
            ? "Add signup"
            : "Save changes"}
      </button>
    </form>
  );
}
