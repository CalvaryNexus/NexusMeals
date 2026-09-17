"use client";

import Link from "next/link";
import { AlertIcon } from "@/components/Icons";

export default function PublicError({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto flex max-w-[1140px] flex-col items-start px-6 py-16">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--need)]/10 text-[color:var(--need)] enter-pop">
        <AlertIcon className="h-6 w-6" />
      </span>
      <h1 className="display mt-5 text-2xl text-navy-text sm:text-3xl">
        Something went wrong
      </h1>
      <p className="mt-2 max-w-prose text-ink-soft">
        The page didn&apos;t load. Try again — if it keeps happening, reach out
        to the Nexus team and we&apos;ll get your week reserved by hand.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" onClick={reset} className="btn btn-primary">
          Try again
        </button>
        <Link href="/schedule" className="btn btn-secondary">
          Back to the schedule
        </Link>
      </div>
    </main>
  );
}
