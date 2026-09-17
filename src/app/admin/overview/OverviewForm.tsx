"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RichTextEditor } from "@/components/RichTextEditor";
import { ListEditor } from "@/components/ListEditor";
import type { Overview } from "@/lib/types";

export function OverviewForm({ initial }: { initial: Overview }) {
  const router = useRouter();
  const [form, setForm] = useState<Overview>(initial);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function set<K extends keyof Overview>(key: K, value: Overview[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const res = await fetch("/api/admin/overview", {
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
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div>
        <label className="block font-semibold mb-1">Nexus headcount</label>
        <input
          type="number"
          min={0}
          value={form.headcount}
          onChange={(e) => set("headcount", Number(e.target.value))}
          className="tap-target w-40 rounded-[8px] border border-rule px-3 py-2"
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block font-semibold mb-1">Arrival time</label>
          <input
            type="time"
            value={form.arrivalTime}
            onChange={(e) => set("arrivalTime", e.target.value)}
            className="tap-target w-full rounded-[8px] border border-rule px-3 py-2"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Ready to serve</label>
          <input
            type="time"
            value={form.readyTime}
            onChange={(e) => set("readyTime", e.target.value)}
            className="tap-target w-full rounded-[8px] border border-rule px-3 py-2"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Event end</label>
          <input
            type="time"
            value={form.endTime}
            onChange={(e) => set("endTime", e.target.value)}
            className="tap-target w-full rounded-[8px] border border-rule px-3 py-2"
          />
        </div>
      </div>

      <RichTextEditor
        label="What teens like"
        value={form.whatTeensLike}
        onChange={(v) => set("whatTeensLike", v)}
      />

      <div>
        <label className="block font-semibold mb-1">Spice guidance</label>
        <textarea
          value={form.spiceGuidance}
          onChange={(e) => set("spiceGuidance", e.target.value)}
          rows={2}
          className="w-full rounded-[8px] border border-rule px-3 py-2"
        />
      </div>

      <ListEditor
        label="Dietary needs"
        items={form.dietaryNeeds}
        onChange={(v) => set("dietaryNeeds", v)}
        withCount
      />

      <ListEditor
        label="Meal ideas students love"
        items={form.mealIdeas}
        onChange={(v) => set("mealIdeas", v)}
      />

      <ListEditor
        label="Provided by Nexus"
        items={form.providedByNexus}
        onChange={(v) => set("providedByNexus", v)}
      />

      <ListEditor
        label="Please bring"
        items={form.pleaseBring}
        onChange={(v) => set("pleaseBring", v)}
      />

      <ListEditor
        label="Current needs"
        items={form.currentNeeds}
        onChange={(v) => set("currentNeeds", v)}
      />

      <RichTextEditor
        label="Teaming-up note and other notes"
        value={form.teamingUpNote}
        onChange={(v) => set("teamingUpNote", v)}
      />

      {error && <p className="text-need font-semibold">{error}</p>}
      {saved && <p className="text-ok font-semibold">Saved.</p>}

      <button
        type="submit"
        disabled={submitting}
        className="tap-target inline-flex items-center justify-center rounded-[8px] bg-navy px-6 py-2.5 text-white font-semibold hover:bg-navy-text transition-colors disabled:opacity-60"
      >
        {submitting ? "Saving..." : "Save overview"}
      </button>
    </form>
  );
}
