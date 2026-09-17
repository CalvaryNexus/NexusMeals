"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Turnstile } from "@marsidev/react-turnstile";
import {
  AlertIcon,
  ArrowRightIcon,
  CalendarIcon,
  CheckIcon,
  ClockIcon,
  LockIcon,
  SparkIcon,
} from "@/components/Icons";
import { formatUsPhone, isValidUsPhone } from "@/lib/phone";

interface WeekOption {
  date: string;
  label: string;
  shortLabel: string;
  arrivalLabel: string;
  relative: string;
}

type FieldName = "name" | "email" | "phone" | "meal";

const MEAL_MAX = 280;

function validateField(field: FieldName, value: string): string | null {
  const v = value.trim();
  switch (field) {
    case "name":
      if (!v) return "Please tell us who to expect.";
      if (v.length > 120) return "That name is a little too long.";
      return null;
    case "email":
      if (!v) return "We need an email to send your recap.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Check that email address.";
      return null;
    case "phone":
      if (!v) return "A phone number lets us reach you that Sunday.";
      if (!isValidUsPhone(v)) return "Enter a 10-digit US phone number.";
      return null;
    case "meal":
      if (!v) return "Even a rough idea helps — you can change it later.";
      if (v.length > MEAL_MAX) return `Keep it under ${MEAL_MAX} characters.`;
      return null;
  }
}

export function SignupForm({
  weeks,
  preselectedDate,
  nearbyMeals,
  mealIdeas,
  turnstileSiteKey,
  consentLine,
}: {
  weeks: WeekOption[];
  preselectedDate: string;
  nearbyMeals: { date: string; label: string; meal: string }[];
  mealIdeas: string[];
  turnstileSiteKey: string | undefined;
  consentLine: string;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  const [date, setDate] = useState(preselectedDate);
  const [values, setValues] = useState<Record<FieldName, string>>({
    name: "",
    email: "",
    phone: "",
    meal: "",
  });
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({});
  const [website, setWebsite] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [errorKey, setErrorKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const selected = useMemo(
    () => weeks.find((w) => w.date === date),
    [weeks, date],
  );

  // Drives the little progress meter above the submit button.
  const completed = (["name", "email", "phone", "meal"] as FieldName[]).filter(
    (f) => validateField(f, values[f]) === null,
  ).length;
  const progress = Math.round((completed / 4) * 100);

  function setField(field: FieldName, value: string) {
    setValues((v) => ({ ...v, [field]: value }));
    // Only clear errors while typing; don't start yelling before a blur.
    if (touched[field]) {
      setErrors((e) => ({ ...e, [field]: validateField(field, value) ?? undefined }));
    }
  }

  function blurField(field: FieldName) {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors((e) => ({
      ...e,
      [field]: validateField(field, values[field]) ?? undefined,
    }));
  }

  function fieldProps(field: FieldName) {
    const invalid = Boolean(errors[field]);
    return {
      id: field,
      value: values[field],
      onBlur: () => blurField(field),
      "aria-invalid": invalid,
      "aria-describedby": invalid ? `${field}-error` : undefined,
      className: `field ${invalid ? "field-invalid" : ""}`,
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const nextErrors: Partial<Record<FieldName, string>> = {};
    for (const field of ["name", "email", "phone", "meal"] as FieldName[]) {
      const message = validateField(field, values[field]);
      if (message) nextErrors[field] = message;
    }
    setErrors(nextErrors);
    setTouched({ name: true, email: true, phone: true, meal: true });

    const firstInvalid = Object.keys(nextErrors)[0];
    if (firstInvalid) {
      setFormError("A couple of fields still need a look.");
      setErrorKey((k) => k + 1);
      formRef.current
        ?.querySelector<HTMLElement>(`#${firstInvalid}`)
        ?.focus({ preventScroll: false });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          name: values.name,
          email: values.email,
          phone: values.phone,
          meal: values.meal,
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
        setFormError(data.error ?? "Something went wrong. Please try again.");
        setErrorKey((k) => k + 1);
        setSubmitting(false);
        return;
      }
      router.push(`/thank-you/${data.id}`);
    } catch {
      setFormError("Something went wrong. Please try again.");
      setErrorKey((k) => k + 1);
      setSubmitting(false);
    }
  }

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-10">
      <form ref={formRef} onSubmit={handleSubmit} noValidate className="max-w-xl">
        {/* --- Step 1: the week ------------------------------------------ */}
        <fieldset className="card p-5">
          <legend className="sr-only">Choose a Sunday</legend>
          <div className="flex items-center gap-2.5">
            <StepDot n={1} done={Boolean(date)} />
            <h2 className="display text-base text-navy-text">Your Sunday</h2>
          </div>

          <div className="mt-4">
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

          {selected && (
            <div
              key={selected.date}
              className="mt-4 flex items-start gap-3 rounded-[12px] border border-card-line bg-card px-4 py-3 enter-scale"
            >
              <CalendarIcon className="mt-0.5 h-5 w-5 flex-none text-navy-stripe" />
              <div className="text-sm">
                <p className="font-semibold text-navy-text">{selected.label}</p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-ink-soft">
                  <span className="font-medium text-navy-stripe">
                    {selected.relative}
                  </span>
                  <span className="inline-flex items-center gap-1 whitespace-nowrap">
                    <ClockIcon className="h-3.5 w-3.5" />
                    Arrive by {selected.arrivalLabel}
                  </span>
                </p>
              </div>
            </div>
          )}
        </fieldset>

        {/* --- Step 2: who you are --------------------------------------- */}
        <fieldset className="card mt-4 p-5">
          <legend className="sr-only">Your details</legend>
          <div className="flex items-center gap-2.5">
            <StepDot
              n={2}
              done={
                !validateField("name", values.name) &&
                !validateField("email", values.email) &&
                !validateField("phone", values.phone)
              }
            />
            <h2 className="display text-base text-navy-text">About you</h2>
          </div>

          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="name" className="label">
                Full name
              </label>
              <input
                {...fieldProps("name")}
                onChange={(e) => setField("name", e.target.value)}
                maxLength={120}
                autoComplete="name"
                placeholder="Jordan Reyes"
              />
              <FieldError field="name" message={errors.name} />
            </div>

            <div className="sm:grid sm:grid-cols-2 sm:gap-4 space-y-4 sm:space-y-0">
              <div>
                <label htmlFor="email" className="label">
                  Email
                </label>
                <input
                  {...fieldProps("email")}
                  type="email"
                  inputMode="email"
                  onChange={(e) => setField("email", e.target.value)}
                  maxLength={200}
                  autoComplete="email"
                  placeholder="you@example.com"
                />
                <FieldError field="email" message={errors.email} />
              </div>

              <div>
                <label htmlFor="phone" className="label">
                  Primary phone
                </label>
                <input
                  {...fieldProps("phone")}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  onChange={(e) => setField("phone", formatUsPhone(e.target.value))}
                  placeholder="(555) 555-5555"
                />
                <FieldError field="phone" message={errors.phone} />
              </div>
            </div>
          </div>
        </fieldset>

        {/* --- Step 3: the meal ------------------------------------------ */}
        <fieldset className="card mt-4 p-5">
          <legend className="sr-only">Your meal</legend>
          <div className="flex items-center gap-2.5">
            <StepDot n={3} done={!validateField("meal", values.meal)} />
            <h2 className="display text-base text-navy-text">The meal</h2>
          </div>

          <div className="mt-4">
            <label htmlFor="meal" className="label">
              What are you bringing?
            </label>
            <textarea
              {...fieldProps("meal")}
              onChange={(e) => setField("meal", e.target.value)}
              maxLength={MEAL_MAX}
              rows={3}
              placeholder="Taco bar with ground beef, rice, and all the toppings"
            />
            <div className="mt-1.5 flex items-center justify-between gap-3">
              <FieldError field="meal" message={errors.meal} />
              <span
                className={`ml-auto text-xs tabular-nums transition-colors ${
                  values.meal.length > MEAL_MAX - 30
                    ? "font-semibold text-[color:var(--warn)]"
                    : "text-ink-faint"
                }`}
              >
                {values.meal.length}/{MEAL_MAX}
              </span>
            </div>

            {mealIdeas.length > 0 && !values.meal && (
              <div className="mt-3">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-ink-soft">
                  <SparkIcon className="h-3.5 w-3.5 text-sun" />
                  Stuck? Start from one of these
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {mealIdeas.slice(0, 6).map((idea) => (
                    <button
                      key={idea}
                      type="button"
                      onClick={() => {
                        setField("meal", idea);
                        setTouched((t) => ({ ...t, meal: true }));
                        setErrors((e) => ({ ...e, meal: undefined }));
                      }}
                      className="chip btn-sm"
                    >
                      {idea}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </fieldset>

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
          <div className="mt-4">
            <Turnstile siteKey={turnstileSiteKey} onSuccess={setTurnstileToken} />
          </div>
        )}

        {formError && (
          <p
            key={errorKey}
            role="alert"
            className="shake mt-4 flex items-center gap-2 rounded-[12px] border border-[color:var(--need)]/30 bg-[color:var(--need)]/8 px-4 py-3 text-sm font-semibold text-[color:var(--need)]"
          >
            <AlertIcon className="h-4 w-4 flex-none" />
            {formError}
          </p>
        )}

        <div className="mt-6">
          {/* Quiet progress meter: reassurance, not pressure. */}
          <div className="mb-3 flex items-center gap-3">
            <div
              className="h-1.5 flex-1 overflow-hidden rounded-full bg-paper-sunk"
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Form completion"
            >
              <div
                className="h-full rounded-full bg-navy-stripe transition-[width] duration-500 ease-[var(--ease-out-soft)]"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs font-semibold tabular-nums text-ink-faint">
              {completed}/4
            </span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary btn-lg w-full sm:w-auto"
          >
            {submitting ? (
              <>
                <span className="spinner" aria-hidden />
                Reserving your Sunday...
              </>
            ) : (
              <>
                Sign up{selected ? ` for ${selected.shortLabel}` : ""}
                <ArrowRightIcon className="h-4 w-4" />
              </>
            )}
          </button>

          <p className="hint mt-3 flex items-start gap-2">
            <LockIcon className="mt-0.5 h-4 w-4 flex-none text-ink-faint" />
            {consentLine}
          </p>
        </div>
      </form>

      {/* --- Side rail --------------------------------------------------- */}
      <aside className="mt-8 lg:mt-0">
        <div className="lg:sticky lg:top-[calc(var(--nav-h)+24px)] space-y-4">
          {nearbyMeals.length > 0 && (
            <div className="panel p-5">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-ink-faint">
                Already on the menu
              </p>
              <p className="mt-1.5 text-sm text-ink-soft">
                So you can bring something different.
              </p>
              <ul className="mt-3 space-y-3">
                {nearbyMeals.map((m) => (
                  <li key={m.date} className="text-sm">
                    <p className="font-semibold text-navy-text">{m.label}</p>
                    <p className="text-ink-soft">{m.meal}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="panel bg-paper-sunk p-5">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-ink-faint">
              What happens next
            </p>
            <ol className="mt-3 space-y-2.5 text-sm text-ink-soft">
              {[
                "Your Sunday is reserved the moment you submit.",
                "You'll get a recap page with the address and a calendar invite.",
                "The Nexus team follows up before your week.",
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <CheckIcon className="mt-0.5 h-4 w-4 flex-none text-[color:var(--ok)]" />
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </aside>
    </div>
  );
}

function StepDot({ n, done }: { n: number; done: boolean }) {
  return (
    <span
      className={`flex h-6 w-6 flex-none items-center justify-center rounded-full text-xs font-bold transition-colors duration-300 ${
        done
          ? "bg-[color:var(--ok)] text-white"
          : "bg-paper-sunk text-ink-faint ring-1 ring-rule"
      }`}
      aria-hidden
    >
      {done ? (
        <span className="enter-pop">
          <CheckIcon className="h-3.5 w-3.5" strokeWidth={3} />
        </span>
      ) : (
        n
      )}
    </span>
  );
}

function FieldError({
  field,
  message,
}: {
  field: FieldName;
  message?: string;
}) {
  if (!message) return null;
  return (
    <p id={`${field}-error`} className="error-text enter-fade">
      <AlertIcon className="h-3.5 w-3.5 flex-none" />
      {message}
    </p>
  );
}
