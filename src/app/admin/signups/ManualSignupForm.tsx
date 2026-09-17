"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
  const [date, setDate] = useState(initial?.date ?? weeks?.[0]?.date ?? "");
  const [name, setName] = useState(initial?.name ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [meal, setMeal] = useState(initial?.meal ?? "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const url =
      mode === "create" ? "/api/admin/signups" : `/api/admin/signups/${signupId}`;
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
      setSubmitting(false);
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-xl">
      {mode === "create" && weeks && (
        <div>
          <label htmlFor="date" className="block font-semibold mb-1">
            Week
          </label>
          <select
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="tap-target w-full rounded-[8px] border border-rule px-3 py-2"
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
        <label htmlFor="name" className="block font-semibold mb-1">
          Full name
        </label>
        <input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={120}
          className="tap-target w-full rounded-[8px] border border-rule px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="email" className="block font-semibold mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          maxLength={200}
          className="tap-target w-full rounded-[8px] border border-rule px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="phone" className="block font-semibold mb-1">
          Primary phone
        </label>
        <input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          className="tap-target w-full rounded-[8px] border border-rule px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="meal" className="block font-semibold mb-1">
          Meal description
        </label>
        <textarea
          id="meal"
          value={meal}
          onChange={(e) => setMeal(e.target.value)}
          required
          maxLength={280}
          rows={3}
          className="w-full rounded-[8px] border border-rule px-3 py-2"
        />
      </div>

      <p className="text-ink-soft text-sm rounded-[8px] bg-card border border-card-line p-3">
        Read to the volunteer: &ldquo;{CONSENT_LINE}&rdquo;
      </p>

      {error && <p className="text-need font-semibold">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="tap-target inline-flex items-center justify-center rounded-[8px] bg-navy px-6 py-2.5 text-white font-semibold hover:bg-navy-text transition-colors disabled:opacity-60"
      >
        {submitting ? "Saving..." : mode === "create" ? "Add signup" : "Save changes"}
      </button>
    </form>
  );
}
