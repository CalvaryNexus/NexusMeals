"use client";

import Link from "next/link";
import { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { CloseIcon, MenuIcon } from "@/components/Icons";

interface NavLinkDef {
  href: string;
  label: string;
  exact?: boolean;
}

function PendingHint() {
  const { pending } = useLinkStatus();
  return <span aria-hidden className={`link-hint ${pending ? "is-pending" : ""}`} />;
}

export function AdminNav({
  links,
  email,
  role,
}: {
  links: NavLinkDef[];
  email: string;
  role: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  // Close the drawer whenever navigation lands somewhere new. Adjusting state
  // during render avoids the extra commit an effect would cost here.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setMenuOpen(false);
  }

  function isActive(link: NavLinkDef) {
    return link.exact ? pathname === link.href : pathname.startsWith(link.href);
  }

  async function signOut() {
    setSigningOut(true);
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 bg-navy text-white shadow-[0_1px_0_rgb(255_255_255_/_0.08)]">
      <div className="mx-auto flex max-w-[1140px] items-center justify-between gap-4 px-6 py-3">
        <div className="flex min-w-0 items-center gap-5">
          <Link
            href="/admin"
            className="flex items-center gap-2.5 text-white transition-transform duration-200 hover:-translate-y-px"
          >
            <Logo className="h-6" />
            <span className="hidden text-xs font-bold uppercase tracking-[0.14em] text-white/50 sm:block">
              Admin
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {links.map((link) => {
              const active = isActive(link);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative whitespace-nowrap rounded-[10px] px-2.5 py-2 text-sm font-semibold transition-colors ${
                    active
                      ? "bg-white/12 text-white"
                      : "text-white/70 hover:bg-white/8 hover:text-white"
                  }`}
                >
                  {link.label}
                  <PendingHint />
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <span
            title={`${email} (${role})`}
            className="hidden h-8 w-8 flex-none items-center justify-center rounded-full bg-white/15 text-sm font-bold uppercase text-white sm:flex"
          >
            {email.charAt(0)}
            <span className="sr-only">
              Signed in as {email} ({role})
            </span>
          </span>
          <button
            type="button"
            onClick={signOut}
            disabled={signingOut}
            className="btn btn-sm btn-on-navy"
          >
            {signingOut ? "Signing out..." : "Sign out"}
          </button>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="tap-target -mr-2 flex items-center justify-center rounded-[10px] text-white/80 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
          >
            {menuOpen ? (
              <CloseIcon className="h-5 w-5" />
            ) : (
              <MenuIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={`overflow-hidden border-t border-white/10 transition-[max-height,opacity] duration-300 ease-[var(--ease-out-soft)] lg:hidden ${
          menuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="mx-auto flex max-w-[1140px] flex-col gap-1 px-4 py-3">
          {links.map((link) => {
            const active = isActive(link);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-[10px] px-3 py-2.5 text-sm font-semibold transition-colors ${
                  active ? "bg-white/12 text-white" : "text-white/75"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <p className="mt-2 border-t border-white/10 px-3 pt-3 text-xs text-white/50 xl:hidden">
            {email} · {role}
          </p>
        </nav>
      </div>
    </header>
  );
}
