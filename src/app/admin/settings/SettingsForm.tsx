"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Settings } from "@/lib/types";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function SettingsForm({ initial }: { initial: Settings }) {
  const router = useRouter();
  const [form, setForm] = useState<Settings>(initial);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function set<K extends keyof Settings>(key: K, value: Settings[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      setSubmitting(false);
      return;
    }
    setSaved(true);
    setSubmitting(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-xl">
      <div>
        <label className="block font-semibold mb-1">Address</label>
        <input
          value={form.address}
          onChange={(e) => set("address", e.target.value)}
          className="tap-target w-full rounded-[8px] border border-rule px-3 py-2"
        />
      </div>
      <div>
        <label className="block font-semibold mb-1">Entrance</label>
        <input
          value={form.entrance}
          onChange={(e) => set("entrance", e.target.value)}
          className="tap-target w-full rounded-[8px] border border-rule px-3 py-2"
        />
      </div>
      <div>
        <label className="block font-semibold mb-1">Contact email</label>
        <input
          type="email"
          value={form.contactEmail}
          onChange={(e) => set("contactEmail", e.target.value)}
          className="tap-target w-full rounded-[8px] border border-rule px-3 py-2"
        />
      </div>
      <div>
        <label className="block font-semibold mb-1">Contact phone</label>
        <input
          value={form.contactPhone}
          onChange={(e) => set("contactPhone", e.target.value)}
          className="tap-target w-full rounded-[8px] border border-rule px-3 py-2"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block font-semibold mb-1">Signup cutoff day</label>
          <select
            value={form.cutoffDay}
            onChange={(e) => set("cutoffDay", Number(e.target.value))}
            className="tap-target w-full rounded-[8px] border border-rule px-3 py-2"
          >
            {DAYS.map((d, i) => (
              <option key={d} value={i}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-1">Cutoff time</label>
          <input
            type="time"
            value={form.cutoffTime}
            onChange={(e) => set("cutoffTime", e.target.value)}
            className="tap-target w-full rounded-[8px] border border-rule px-3 py-2"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block font-semibold mb-1">
            Schedule window (weeks)
          </label>
          <input
            type="number"
            min={1}
            max={52}
            value={form.scheduleWindowWeeks}
            onChange={(e) => set("scheduleWindowWeeks", Number(e.target.value))}
            className="tap-target w-full rounded-[8px] border border-rule px-3 py-2"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">
            Data retention (days)
          </label>
          <input
            type="number"
            min={1}
            value={form.retentionDays}
            onChange={(e) => set("retentionDays", Number(e.target.value))}
            className="tap-target w-full rounded-[8px] border border-rule px-3 py-2"
          />
        </div>
      </div>

      {error && <p className="text-need font-semibold">{error}</p>}
      {saved && <p className="text-ok font-semibold">Saved.</p>}

      <button
        type="submit"
        disabled={submitting}
        className="tap-target inline-flex items-center justify-center rounded-[8px] bg-navy px-6 py-2.5 text-white font-semibold hover:bg-navy-text transition-colors disabled:opacity-60"
      >
        {submitting ? "Saving..." : "Save settings"}
      </button>
    </form>
  );
}
