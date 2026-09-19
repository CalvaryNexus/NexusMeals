"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ConfirmButton } from "@/components/ConfirmButton";
import { useToast } from "@/components/Toast";
import {
  ClockIcon,
  MailIcon,
  MoonIcon,
  PencilIcon,
  PhoneIcon,
  TrashIcon,
  UsersIcon,
} from "@/components/Icons";
import type { WeekComputedState } from "@/lib/types";

export function AdminWeekRow({
  date,
  dateLabel,
  relative,
  state,
  meal,
  hasSignup,
  signupId,
  signupName,
  signupEmail,
  signupPhone,
  initialLabel,
  initialArrivalOverride,
  defaultArrivalTime,
}: {
  date: string;
  dateLabel: string;
  relative: string;
  state: WeekComputedState;
  meal?: string;
  hasSignup: boolean;
  signupId?: string;
  signupName?: string;
  signupEmail?: string;
  signupPhone?: string;
  initialLabel?: string;
  initialArrivalOverride?: string;
  defaultArrivalTime: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [noNexus, setNoNexus] = useState(state === "no_nexus");
  const [label, setLabel] = useState(initialLabel ?? "");
  const [arrival, setArrival] = useState(initialArrivalOverride ?? "");
  const [busy, setBusy] = useState(false);
  const [showArrival, setShowArrival] = useState(
    Boolean(initialArrivalOverride),
  );

  async function patch(body: Record<string, unknown>, message: string) {
    setBusy(true);
    const res = await fetch(`/api/admin/weeks/${date}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setBusy(false);
    if (!res.ok) {
      toast("That didn't save. Please try again.", "error");
      return false;
    }
    toast(message);
    router.refresh();
    return true;
  }

  async function save(nextNoNexus: boolean) {
    if (nextNoNexus && hasSignup && state !== "no_nexus") {
      const confirmed = confirm(
        "This week already has a signup. Marking it No Nexus will move that signup to Needs contact. Continue?",
      );
      if (!confirmed) return;
    }
    const ok = await patch(
      {
        noNexus: nextNoNexus,
        label: nextNoNexus ? label || "No Nexus" : undefined,
        arrivalOverride: arrival || null,
      },
      nextNoNexus ? "Marked as No Nexus." : "Week is back on the schedule.",
    );
    if (ok) setNoNexus(nextNoNexus);
  }

  async function removeSignup() {
    if (!signupId) return;
    setBusy(true);
    const res = await fetch(`/api/admin/signups/${signupId}`, {
      method: "DELETE",
    });
    setBusy(false);
    if (!res.ok) {
      toast("Couldn't remove that meal. Please try again.", "error");
      return;
    }
    toast("Meal removed — this Sunday is open for signups again.");
    router.refresh();
  }

  async function saveArrival() {
    await patch(
      { arrivalOverride: arrival || null },
      arrival
        ? "Arrival time override saved."
        : "Arrival time back to the default.",
    );
  }

  return (
    <div
      className={`panel p-5 transition-opacity ${noNexus ? "opacity-80" : ""} ${
        busy ? "opacity-60" : ""
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-[200px] flex-1">
          <p className="font-semibold text-ink">{dateLabel}</p>
          <p className="mt-0.5 text-sm font-semibold text-navy-stripe">
            {relative}
          </p>

        </div>

        {/* A real switch reads better than a bare checkbox in a dense list. */}
        <label className="flex cursor-pointer select-none items-center gap-2.5 text-sm font-semibold text-ink">
          <MoonIcon className="h-4 w-4 text-ink-faint" />
          No Nexus
          <input
            type="checkbox"
            checked={noNexus}
            disabled={busy}
            onChange={(e) => save(e.target.checked)}
            className="peer sr-only"
          />
          <span
            aria-hidden
            className="relative h-6 w-11 flex-none rounded-full bg-rule transition-colors duration-200 after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-[var(--shadow-1)] after:transition-transform after:duration-200 after:ease-[var(--ease-spring)] after:content-[''] peer-checked:bg-navy peer-checked:after:translate-x-5 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-navy-stripe"
          />
        </label>
      </div>

      {hasSignup && signupId && (
        <div className="mt-4 rounded-[12px] bg-paper-sunk p-4">
          <p className="text-sm text-ink">
            <span className="font-semibold text-navy-text">Meal:</span> {meal}
          </p>

          <div className="mt-2.5 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-ink-soft">
            {signupName && (
              <span className="inline-flex items-center gap-1.5">
                <UsersIcon className="h-3.5 w-3.5 flex-none" />
                {signupName}
              </span>
            )}
            {signupPhone && (
              <a
                href={`tel:${signupPhone}`}
                className="link-underline inline-flex items-center gap-1.5 text-navy-text"
              >
                <PhoneIcon className="h-3.5 w-3.5 flex-none" />
                {signupPhone}
              </a>
            )}
            {signupEmail && (
              <a
                href={`mailto:${signupEmail}`}
                className="link-underline inline-flex items-center gap-1.5 text-navy-text"
              >
                <MailIcon className="h-3.5 w-3.5 flex-none" />
                {signupEmail}
              </a>
            )}
          </div>

          <div className="mt-3.5 flex flex-wrap items-center gap-2">
            <Link
              href={`/admin/signups/${signupId}`}
              className="btn btn-sm btn-secondary"
            >
              <PencilIcon className="h-4 w-4" />
              Edit meal
            </Link>
            <ConfirmButton
              onConfirm={removeSignup}
              disabled={busy}
              confirmLabel="Tap again to remove the meal"
              className="btn btn-sm btn-ghost text-[color:var(--need)]"
              confirmClassName="btn btn-sm btn-danger"
            >
              <span className="inline-flex items-center gap-2">
                <TrashIcon className="h-4 w-4" />
                Remove meal
              </span>
            </ConfirmButton>
            <span className="text-xs text-ink-faint">
              Reopens the Sunday for signups. The night stays on the schedule.
            </span>
          </div>
        </div>
      )}

      <div
        className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-[var(--ease-out-soft)] ${
          noNexus ? "mt-4 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="min-h-0">
          <label htmlFor={`label-${date}`} className="label">
            Public label
          </label>
          <div className="flex flex-wrap gap-2">
            <input
              id={`label-${date}`}
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Christmas break"
              className="field flex-1"
            />
            <button
              onClick={() => save(true)}
              disabled={busy}
              className="btn btn-primary btn-sm"
            >
              Save label
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 border-t border-rule pt-4">
        {!showArrival ? (
          <button
            type="button"
            onClick={() => setShowArrival(true)}
            className="btn btn-ghost btn-sm -ml-3 text-ink-soft"
          >
            <ClockIcon className="h-4 w-4" />
            Override arrival time
            <span className="text-ink-faint">({defaultArrivalTime})</span>
          </button>
        ) : (
          <div className="enter-fade">
            <label htmlFor={`arrival-${date}`} className="label">
              <span className="inline-flex items-center gap-1.5">
                <ClockIcon className="h-3.5 w-3.5" />
                Arrival time override
              </span>
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <input
                id={`arrival-${date}`}
                type="time"
                value={arrival}
                onChange={(e) => setArrival(e.target.value)}
                className="field w-auto"
              />
              <button
                onClick={saveArrival}
                disabled={busy}
                className="btn btn-secondary btn-sm"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setArrival("");
                  setShowArrival(false);
                  if (initialArrivalOverride) {
                    void patch(
                      { arrivalOverride: null },
                      "Arrival time back to the default.",
                    );
                  }
                }}
                disabled={busy}
                className="btn btn-ghost btn-sm"
              >
                {initialArrivalOverride ? "Clear" : "Cancel"}
              </button>
              <span className="text-sm text-ink-faint">
                Default: {defaultArrivalTime}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
