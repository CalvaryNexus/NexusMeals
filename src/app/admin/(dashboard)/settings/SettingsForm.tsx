"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";
import { AlertIcon } from "@/components/Icons";
import { formatUsPhone } from "@/lib/phone";
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

function Fieldset({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="panel p-6">
      <legend className="sr-only">{title}</legend>
      <h2 className="display text-base text-navy-text">{title}</h2>
      {description && (
        <p className="mt-1 text-sm text-ink-soft">{description}</p>
      )}
      <div className="mt-5 space-y-5">{children}</div>
    </fieldset>
  );
}

export function SettingsForm({ initial }: { initial: Settings }) {
  const router = useRouter();
  const { toast } = useToast();
  const [form, setForm] = useState<Settings>(initial);
  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function set<K extends keyof Settings>(key: K, value: Settings[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setDirty(true);
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
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      return;
    }
    setDirty(false);
    toast("Settings saved.");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
      <Fieldset
        title="Where and who"
        description="Shown on the public pages and in every calendar invite."
      >
        <div>
          <label htmlFor="address" className="label">
            Address
          </label>
          <input
            id="address"
            value={form.address}
            onChange={(e) => set("address", e.target.value)}
            className="field"
          />
        </div>
        <div>
          <label htmlFor="entrance" className="label">
            Entrance
          </label>
          <input
            id="entrance"
            value={form.entrance}
            onChange={(e) => set("entrance", e.target.value)}
            className="field"
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="contactEmail" className="label">
              Contact email
            </label>
            <input
              id="contactEmail"
              type="email"
              value={form.contactEmail}
              onChange={(e) => set("contactEmail", e.target.value)}
              className="field"
            />
          </div>
          <div>
            <label htmlFor="contactPhone" className="label">
              Contact phone
            </label>
            <input
              id="contactPhone"
              value={form.contactPhone}
              onChange={(e) => set("contactPhone", formatUsPhone(e.target.value))}
              className="field"
            />
          </div>
        </div>
      </Fieldset>

      <Fieldset
        title="Signup cutoff"
        description="After this moment each week, the upcoming Sunday stops accepting public signups."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="cutoffDay" className="label">
              Cutoff day
            </label>
            <select
              id="cutoffDay"
              value={form.cutoffDay}
              onChange={(e) => set("cutoffDay", Number(e.target.value))}
              className="field"
            >
              {DAYS.map((d, i) => (
                <option key={d} value={i}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="cutoffTime" className="label">
              Cutoff time
            </label>
            <input
              id="cutoffTime"
              type="time"
              value={form.cutoffTime}
              onChange={(e) => set("cutoffTime", e.target.value)}
              className="field"
            />
          </div>
        </div>
        <p className="hint">
          Signups close {DAYS[form.cutoffDay]} at {form.cutoffTime}, America/Chicago.
        </p>
      </Fieldset>

      <Fieldset title="Window and retention">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="scheduleWindowWeeks" className="label">
              Schedule window (weeks)
            </label>
            <input
              id="scheduleWindowWeeks"
              type="number"
              min={1}
              max={52}
              value={form.scheduleWindowWeeks}
              onChange={(e) =>
                set("scheduleWindowWeeks", Number(e.target.value))
              }
              className="field"
            />
            <p className="hint">How many Sundays the public schedule shows.</p>
          </div>
          <div>
            <label htmlFor="retentionDays" className="label">
              Data retention (days)
            </label>
            <input
              id="retentionDays"
              type="number"
              min={1}
              value={form.retentionDays}
              onChange={(e) => set("retentionDays", Number(e.target.value))}
              className="field"
            />
            <p className="hint">
              Names, emails, and phone numbers are wiped this long after a
              Sunday.
            </p>
          </div>
        </div>
      </Fieldset>

      {error && (
        <p
          role="alert"
          className="flex items-center gap-2 rounded-[12px] border border-[color:var(--need)]/30 bg-[color:var(--need)]/8 px-4 py-3 text-sm font-semibold text-[color:var(--need)]"
        >
          <AlertIcon className="h-4 w-4 flex-none" />
          {error}
        </p>
      )}

      {/* Sticky save bar: settings pages are long, the button shouldn't hide
          at the bottom. */}
      <div className="sticky bottom-0 -mx-1 flex items-center gap-3 rounded-[14px] border border-rule bg-paper/92 px-4 py-3 backdrop-blur-md">
        <button type="submit" disabled={submitting} className="btn btn-primary">
          {submitting && <span className="spinner" aria-hidden />}
          {submitting ? "Saving..." : "Save settings"}
        </button>
        <span
          className={`text-sm transition-opacity duration-200 ${
            dirty ? "text-[color:var(--warn)] opacity-100" : "opacity-0"
          }`}
        >
          Unsaved changes
        </span>
      </div>
    </form>
  );
}
