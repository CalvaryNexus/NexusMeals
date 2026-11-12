import Link from "next/link";
import { Logo } from "./Logo";
import { ContactReveal } from "./ContactReveal";

/**
 * Deliberately one line on desktop. The wordmark already says who this is, so
 * it needs no tagline, and the page below deserves the vertical space more
 * than the footer does.
 */
export function Footer({ contactEmail }: { contactEmail: string }) {
  return (
    <footer className="mt-auto bg-navy text-white">
      <div className="mx-auto flex max-w-[1140px] flex-col gap-5 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
        <Logo className="h-7 flex-none text-white" />

        <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:gap-7">
          <ContactReveal email={contactEmail} variant="on-navy" />

          {/* Set apart so it doesn't read as another way to reach the team. */}
          <Link
            href="/admin"
            className="border-t border-white/12 pt-3 text-xs text-white/45 transition-colors hover:text-white/80 sm:border-l sm:border-t-0 sm:pl-7 sm:pt-0"
          >
            Team sign in
          </Link>
        </div>
      </div>
    </footer>
  );
}
