"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Turnstile } from "@marsidev/react-turnstile";
import { formatDateLong } from "@/lib/schedule";

interface WeekOption {
  date: string;
  label: string;
}

export function SignupForm({
  weeks,
  preselectedDate,
  nearbyMeals,
  turnstileSiteKey,
  consentLine,
}: {
  weeks: WeekOption[];
  preselectedDate: string;
  nearbyMeals: string[];
  turnstileSiteKey: string | undefined;
  consentLine: string;
}) {
  const router = useRouter();
  const [date, setDate] = useState(preselectedDate);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [meal, setMeal] = useState("");
  const [website, setWebsite] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          name,
          email,
          phone,
          meal,
          website,
          turnstileToken,
        }),
      });
      const data = await res.json();
      if (res.status === 409) {
        router.push("/schedule?taken=1");
        return;
      }
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
      router.push(`/thank-you/${data.id}`);
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-xl">
      {nearbyMeals.length > 0 && (
        <div className="rounded-[12px] bg-card border border-card-line p-4 text-sm text-ink">
          <p className="font-semibold mb-1">Meals coming up</p>
          <ul className="list-disc pl-5 space-y-0.5">
            {nearbyMeals.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        </div>
      )}

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
        {date && (
          <p className="text-ink-soft text-sm mt-1">{formatDateLong(date)}</p>
        )}
      </div>

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
          placeholder="(555) 555-5555"
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
        <p className="text-ink-soft text-sm mt-1">{meal.length}/280</p>
      </div>

      {/* Honeypot field, hidden from real users */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input
          id="website"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      {turnstileSiteKey && (
        <Turnstile
          siteKey={turnstileSiteKey}
          onSuccess={setTurnstileToken}
        />
      )}

      {error && <p className="text-need font-semibold">{error}</p>}

      <div>
        <button
          type="submit"
          disabled={submitting}
          className="tap-target w-full sm:w-auto inline-flex items-center justify-center rounded-[8px] bg-navy px-6 py-3 text-white font-semibold hover:bg-navy-text transition-colors disabled:opacity-60"
        >
          {submitting ? "Signing up..." : "Sign up"}
        </button>
        <p className="text-ink-soft text-sm mt-3">{consentLine}</p>
      </div>
    </form>
  );
}
