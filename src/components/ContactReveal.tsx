"use client";

import { useRef, useState } from "react";
import { MailIcon } from "./Icons";

/**
 * Shows a "Contact" button that swaps to the email address once clicked.
 *
 * Note this is a decluttering device, not spam protection: the address is
 * rendered by the server into the page payload, so anything reading the HTML
 * can still find it. Keeping it out of the source would mean fetching it on
 * click instead.
 */
export function ContactReveal({
  email,
  label = "Contact",
  variant = "default",
  className = "",
}: {
  email: string;
  label?: string;
  variant?: "default" | "on-navy";
  className?: string;
}) {
  const [revealed, setRevealed] = useState(false);
  const linkRef = useRef<HTMLAnchorElement>(null);

  const tone =
    variant === "on-navy"
      ? "text-white/90 hover:text-white"
      : "text-navy-text hover:text-navy";

  if (revealed) {
    return (
      <a
        ref={linkRef}
        href={`mailto:${email}`}
        className={`link-underline inline-flex items-center gap-2 text-sm font-semibold enter-fade ${tone} ${className}`}
      >
        <MailIcon className="h-4 w-4 flex-none opacity-70" />
        {email}
      </a>
    );
  }

  return (
    <button
      type="button"
      aria-expanded={false}
      onClick={() => {
        setRevealed(true);
        // Hand focus to the address so keyboard users land on the link they
        // just asked for rather than on nothing.
        requestAnimationFrame(() => linkRef.current?.focus());
      }}
      className={`inline-flex items-center gap-2 text-sm font-semibold transition-colors ${tone} ${className}`}
    >
      <MailIcon className="h-4 w-4 flex-none opacity-70" />
      <span className="link-underline">{label}</span>
    </button>
  );
}
