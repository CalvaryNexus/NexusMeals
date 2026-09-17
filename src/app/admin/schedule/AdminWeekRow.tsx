"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { WeekComputedState } from "@/lib/types";

export function AdminWeekRow({
  date,
  dateLabel,
  state,
  meal,
  hasSignup,
  initialLabel,
  initialArrivalOverride,
  defaultArrivalTime,
}: {
  date: string;
  dateLabel: string;
  state: WeekComputedState;
  meal?: string;
  hasSignup: boolean;
  initialLabel?: string;
  initialArrivalOverride?: string;
  defaultArrivalTime: string;
}) {
  const router = useRouter();
  const [noNexus, setNoNexus] = useState(state === "no_nexus");
  const [label, setLabel] = useState(initialLabel ?? "");
  const [arrival, setArrival] = useState(initialArrivalOverride ?? "");
  const [busy, setBusy] = useState(false);

  async function save(nextNoNexus: boolean) {
    if (nextNoNexus && hasSignup && state !== "no_nexus") {
      const confirmed = confirm(
        "This week already has a signup. Marking it No Nexus will move that signup to Needs contact. Continue?",
      );
      if (!confirmed) return;
    }
    setBusy(true);
    await fetch(`/api/admin/weeks/${date}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        noNexus: nextNoNexus,
        label: nextNoNexus ? label || "No Nexus" : undefined,
        arrivalOverride: arrival || null,
      }),
    });
    setNoNexus(nextNoNexus);
    router.refresh();
    setBusy(false);
  }

  async function saveArrival() {
    setBusy(true);
    await fetch(`/api/admin/weeks/${date}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ arrivalOverride: arrival || null }),
    });
    router.refresh();
    setBusy(false);
  }

  return (
    <div className="rounded-[12px] border border-rule bg-paper p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-ink">{dateLabel}</p>
          {meal && <p className="text-ink-soft text-sm">Meal: {meal}</p>}
          {hasSignup && (
            <p className="text-ok text-sm font-semibold">Has a signup</p>
          )}
        </div>
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input
            type="checkbox"
            checked={noNexus}
            disabled={busy}
            onChange={(e) => save(e.target.checked)}
            className="tap-target"
          />
          No Nexus
        </label>
      </div>

      {noNexus && (
        <div className="mt-3">
          <label className="block text-sm font-semibold mb-1">
            Public label
          </label>
          <div className="flex gap-2">
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Christmas break"
              className="tap-target flex-1 rounded-[8px] border border-rule px-3 py-2"
            />
            <button
              onClick={() => save(true)}
              disabled={busy}
              className="tap-target rounded-[8px] bg-navy px-4 py-2 text-white font-semibold"
            >
              Save
            </button>
          </div>
        </div>
      )}

      <div className="mt-3">
        <label className="block text-sm font-semibold mb-1">
          Arrival time override
        </label>
        <div className="flex gap-2 items-center">
          <input
            type="time"
            value={arrival}
            onChange={(e) => setArrival(e.target.value)}
            className="tap-target rounded-[8px] border border-rule px-3 py-2"
          />
          <span className="text-ink-soft text-sm">
            Default: {defaultArrivalTime}
          </span>
          <button
            onClick={saveArrival}
            disabled={busy}
            className="tap-target rounded-[8px] border border-navy px-4 py-2 text-navy-text font-semibold"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
