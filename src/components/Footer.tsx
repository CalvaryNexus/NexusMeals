import Link from "next/link";
import { Logo } from "./Logo";
import { MailIcon, PhoneIcon } from "./Icons";

/**
 * Deliberately one line on desktop. The wordmark already says who this is, and
 * the mail/phone icons already say "questions", so neither needs a label — and
 * the page below deserves the vertical space more than the footer does.
 */
export function Footer({
  contactEmail,
  contactPhone,
}: {
  contactEmail: string;
  contactPhone: string;
}) {
  return (
    <footer className="mt-auto bg-navy text-white">
      <div className="mx-auto flex max-w-[1140px] flex-col gap-5 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
        <Logo className="h-7 flex-none text-white" />

        <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:gap-7">
          <a
            href={`mailto:${contactEmail}`}
            className="link-underline inline-flex items-center gap-2 font-semibold text-white/90 transition-colors hover:text-white"
          >
            <MailIcon className="h-4 w-4 flex-none opacity-70" />
            {contactEmail}
          </a>
          <a
            href={`tel:${contactPhone}`}
            className="link-underline inline-flex items-center gap-2 font-semibold text-white/90 transition-colors hover:text-white"
          >
            <PhoneIcon className="h-4 w-4 flex-none opacity-70" />
            {contactPhone}
          </a>

          {/* Set apart so it doesn't read as a third way to contact the team. */}
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
