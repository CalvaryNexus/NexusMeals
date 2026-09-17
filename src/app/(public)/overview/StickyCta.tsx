"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRightIcon } from "@/components/Icons";

/**
 * Mobile-only action bar. It slides in once the reader is past the hero so the
 * "continue" step is always one tap away without following them down the page
 * from the very first pixel.
 */
export function StickyCta({
  href,
  label,
  note,
}: {
  href: string;
  label: string;
  note?: string;
}) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    function onScroll() {
      const past = window.scrollY > 320;
      const nearBottom =
        window.innerHeight + window.scrollY >
        document.body.offsetHeight - 220;
      setShown(past && !nearBottom);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-30 border-t border-rule bg-paper/92 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md transition-all duration-300 ease-[var(--ease-out-soft)] lg:hidden ${
        shown
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-full opacity-0"
      }`}
    >
      {note && (
        <p className="mb-2 text-center text-xs text-ink-soft">{note}</p>
      )}
      <Link href={href} className="btn btn-primary w-full">
        {label}
        <ArrowRightIcon className="h-4 w-4" />
      </Link>
    </div>
  );
}
