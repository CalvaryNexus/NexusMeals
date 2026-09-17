"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { ArrowRightIcon } from "./Icons";

const LINKS = [
  { href: "/schedule", label: "Schedule", shortLabel: "Schedule" },
  { href: "/overview", label: "What to know", shortLabel: "Details" },
];

/**
 * Sits on top of the navy hero and blends into it. Once the page scrolls past
 * the hero it turns into a solid, blurred bar so the nav never fights the
 * content behind it.
 */
export function SiteNav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 24);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      data-scrolled={scrolled ? "true" : undefined}
      className="group sticky top-0 z-40 transition-[background-color,box-shadow,backdrop-filter] duration-300 data-[scrolled]:bg-paper/85 data-[scrolled]:shadow-[0_1px_0_var(--rule),0_8px_24px_-16px_rgb(28_50_106_/_0.4)] data-[scrolled]:backdrop-blur-md"
    >
      <nav className="mx-auto flex h-[var(--nav-h)] max-w-[1140px] items-center justify-between gap-4 px-6">
        <Link
          href="/schedule"
          aria-label="Nexus Meals home"
          className="flex items-center rounded-[10px] text-white transition-[color,transform] duration-300 hover:-translate-y-px group-data-[scrolled]:text-navy"
        >
          <Logo className="h-6 sm:h-8" />
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          {LINKS.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`relative rounded-[10px] px-2 py-2 text-[13px] font-semibold transition-colors sm:px-3 sm:text-sm ${
                  active
                    ? "text-white group-data-[scrolled]:text-navy-text"
                    : "text-white/70 hover:text-white group-data-[scrolled]:text-ink-soft group-data-[scrolled]:hover:text-navy-text"
                }`}
              >
                <span className="hidden sm:inline">{link.label}</span>
                <span className="sm:hidden">{link.shortLabel}</span>
                <span
                  aria-hidden
                  className={`absolute inset-x-2 -bottom-0.5 h-0.5 origin-left rounded-full bg-sun transition-transform duration-300 ease-[var(--ease-out-soft)] sm:inset-x-3 ${
                    active ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </Link>
            );
          })}

          <Link
            href="/signup"
            className="btn btn-sm ml-0.5 gap-1.5 px-3 bg-white font-semibold text-navy-text shadow-[var(--shadow-1)] hover:bg-card group-data-[scrolled]:bg-navy group-data-[scrolled]:text-white"
          >
            Sign up
            <ArrowRightIcon className="hidden h-3.5 w-3.5 sm:block" />
          </Link>
        </div>
      </nav>
    </div>
  );
}
