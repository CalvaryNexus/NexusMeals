"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RichTextEditor } from "@/components/RichTextEditor";
import { ListEditor } from "@/components/ListEditor";
import { useToast } from "@/components/Toast";
import { AlertIcon, ArrowRightIcon } from "@/components/Icons";
import type { Overview } from "@/lib/types";

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="panel p-6">
      <h2 className="display text-base text-navy-text">{title}</h2>
      {description && (
        <p className="mt-1 text-sm text-ink-soft">{description}</p>
      )}
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}

export function OverviewForm({ initial }: { initial: Overview }) {
  const router = useRouter();
  const { toast } = useToast();
  const [form, setForm] = useState<Overview>(initial);
  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function set<K extends keyof Overview>(key: K, value: Overview[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setDirty(true);
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
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      return;
    }
    setDirty(false);
    toast("Overview saved.");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
      <Section
        title="The basics"
        description="Headcount and the shape of the evening."
      >
        <div>
          <label htmlFor="headcount" className="label">
            Nexus headcount
          </label>
          <input
            id="headcount"
            type="number"
            min={0}
            value={form.headcount}
            onChange={(e) => set("headcount", Number(e.target.value))}
            className="field w-40"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="arrivalTime" className="label">
              Arrival time
            </label>
            <input
              id="arrivalTime"
              type="time"
              value={form.arrivalTime}
              onChange={(e) => set("arrivalTime", e.target.value)}
              className="field"
            />
          </div>
          <div>
            <label htmlFor="readyTime" className="label">
              Ready to serve
            </label>
            <input
              id="readyTime"
              type="time"
              value={form.readyTime}
              onChange={(e) => set("readyTime", e.target.value)}
              className="field"
            />
          </div>
          <div>
            <label htmlFor="endTime" className="label">
              Event end
            </label>
            <input
              id="endTime"
              type="time"
              value={form.endTime}
              onChange={(e) => set("endTime", e.target.value)}
              className="field"
            />
          </div>
        </div>
      </Section>

      <Section
        title="Guidance for volunteers"
        description="The parts people read before deciding what to cook."
      >
        <RichTextEditor
          label="What teens like"
          value={form.whatTeensLike}
          onChange={(v) => set("whatTeensLike", v)}
        />

        <div>
          <label htmlFor="spiceGuidance" className="label">
            Spice guidance
          </label>
          <textarea
            id="spiceGuidance"
            value={form.spiceGuidance}
            onChange={(e) => set("spiceGuidance", e.target.value)}
            rows={2}
            className="field"
          />
        </div>

        <ListEditor
          label="Dietary needs"
          items={form.dietaryNeeds}
          onChange={(v) => set("dietaryNeeds", v)}
          withCount
          placeholder="e.g. Gluten free"
          addLabel="Add a dietary need"
        />

        <ListEditor
          label="Meal ideas students love"
          items={form.mealIdeas}
          onChange={(v) => set("mealIdeas", v)}
          placeholder="e.g. Taco bar"
          addLabel="Add a meal idea"
        />
      </Section>

      <Section
        title="Who brings what"
        description="Keeps volunteers from double-buying paper plates."
      >
        <ListEditor
          label="Provided by Nexus"
          items={form.providedByNexus}
          onChange={(v) => set("providedByNexus", v)}
          addLabel="Add an item"
        />
        <ListEditor
          label="Please bring"
          items={form.pleaseBring}
          onChange={(v) => set("pleaseBring", v)}
          addLabel="Add an item"
        />
        <ListEditor
          label="Current needs"
          items={form.currentNeeds}
          onChange={(v) => set("currentNeeds", v)}
          addLabel="Add a current need"
        />
      </Section>

      <Section title="Notes">
        <RichTextEditor
          label="Teaming-up note and other notes"
          value={form.teamingUpNote}
          onChange={(v) => set("teamingUpNote", v)}
        />
      </Section>

      {error && (
        <p
          role="alert"
          className="flex items-center gap-2 rounded-[12px] border border-[color:var(--need)]/30 bg-[color:var(--need)]/8 px-4 py-3 text-sm font-semibold text-[color:var(--need)]"
        >
          <AlertIcon className="h-4 w-4 flex-none" />
          {error}
        </p>
      )}

      <div className="sticky bottom-0 -mx-1 flex flex-wrap items-center gap-3 rounded-[14px] border border-rule bg-paper/92 px-4 py-3 backdrop-blur-md">
        <button type="submit" disabled={submitting} className="btn btn-primary">
          {submitting && <span className="spinner" aria-hidden />}
          {submitting ? "Saving..." : "Save overview"}
        </button>
        <span
          className={`text-sm transition-opacity duration-200 ${
            dirty ? "text-[color:var(--warn)] opacity-100" : "opacity-0"
          }`}
        >
          Unsaved changes
        </span>
        <Link
          href="/overview"
          target="_blank"
          className="link-underline ml-auto inline-flex items-center gap-1.5 text-sm font-semibold text-navy-text"
        >
          View the public page
          <ArrowRightIcon className="h-3.5 w-3.5" />
        </Link>
      </div>
    </form>
  );
}
