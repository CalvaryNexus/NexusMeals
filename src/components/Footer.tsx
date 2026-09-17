import Link from "next/link";
import { Logo } from "./Logo";
import { HeartIcon, MailIcon, PhoneIcon } from "./Icons";

export function Footer({
  contactEmail,
  contactPhone,
}: {
  contactEmail: string;
  contactPhone: string;
}) {
  return (
    <footer className="mt-auto bg-navy text-white">
      <div className="mx-auto max-w-[1140px] px-6 py-10">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Logo className="h-8 text-white" />
            <p className="mt-3 flex items-center gap-1.5 max-w-[42ch] text-sm text-white/70">
              <HeartIcon className="h-4 w-4 flex-none text-sun" />
              Sunday dinner for our students, brought by people like you.
            </p>
          </div>

          <div className="sm:text-right">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/50">
              Questions?
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:items-end">
              <a
                href={`mailto:${contactEmail}`}
                className="link-underline inline-flex items-center gap-2 text-sm font-semibold text-white/90 transition-colors hover:text-white"
              >
                <MailIcon className="h-4 w-4 flex-none opacity-70" />
                {contactEmail}
              </a>
              <a
                href={`tel:${contactPhone}`}
                className="link-underline inline-flex items-center gap-2 text-sm font-semibold text-white/90 transition-colors hover:text-white"
              >
                <PhoneIcon className="h-4 w-4 flex-none opacity-70" />
                {contactPhone}
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-white/12 pt-5 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>Nexus Meals</p>
          <Link
            href="/admin"
            className="transition-colors hover:text-white/80"
          >
            Team sign in
          </Link>
        </div>
      </div>
    </footer>
  );
}
