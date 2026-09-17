"use client";

import { useEffect, useState } from "react";

/**
 * Desktop side rail for the overview. Highlights whichever section is
 * currently in view so a long read keeps its place.
 */
export function OverviewNav({
  sections,
}: {
  sections: { id: string; title: string }[];
}) {
  const [active, setActive] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    const nodes = sections
      .map((s) => document.getElementById(s.id))
      .filter((n): n is HTMLElement => !!n);
    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      // Bias the band toward the top of the viewport so the highlight tracks
      // what the reader is actually looking at.
      { rootMargin: "-88px 0px -55% 0px", threshold: 0 },
    );
    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, [sections]);

  return (
    <nav
      aria-label="On this page"
      className="sticky top-[calc(var(--nav-h)+24px)]"
    >
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-ink-faint">
        On this page
      </p>
      <ul className="space-y-0.5 border-l border-rule">
        {sections.map((s) => {
          const current = active === s.id;
          return (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                aria-current={current ? "true" : undefined}
                className={`relative -ml-px block border-l-2 py-1.5 pl-4 text-sm transition-all duration-200 ${
                  current
                    ? "border-navy-stripe font-semibold text-navy-text"
                    : "border-transparent text-ink-soft hover:border-card-line hover:text-navy-text"
                }`}
              >
                {s.title}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
