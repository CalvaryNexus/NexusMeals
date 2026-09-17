"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/CopyButton";
import { SearchIcon, UsersIcon } from "@/components/Icons";

export interface VolunteerRow {
  id: string;
  dateLabel: string;
  name: string;
  email: string;
  phone: string;
  meal: string;
}

/**
 * Past volunteers, with client-side search. The list is already loaded, so
 * filtering happens as you type rather than round-tripping to the server.
 */
export function VolunteersTable({ rows }: { rows: VolunteerRow[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [r.dateLabel, r.name, r.email, r.phone, r.meal]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [rows, query]);

  if (rows.length === 0) {
    return (
      <div className="panel flex items-center gap-3 px-5 py-8 text-ink-soft">
        <UsersIcon className="h-5 w-5 flex-none" />
        No past volunteers yet.
      </div>
    );
  }

  return (
    <div>
      <div className="relative mb-4 max-w-sm">
        <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search names, meals, dates..."
          aria-label="Search past volunteers"
          className="field pl-10"
        />
      </div>

      <p className="mb-3 text-sm text-ink-soft" aria-live="polite">
        {filtered.length === rows.length
          ? `${rows.length} volunteer${rows.length === 1 ? "" : "s"}`
          : `${filtered.length} of ${rows.length} shown`}
      </p>

      <div className="panel scrollbar-slim max-h-[65vh] overflow-auto">
        <table className="table-clean">
          <thead>
            <tr>
              <th scope="col">Date</th>
              <th scope="col">Name</th>
              <th scope="col">Contact</th>
              <th scope="col">Meal</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id}>
                <td className="whitespace-nowrap font-medium text-navy-text">
                  {r.dateLabel}
                </td>
                <td className="font-medium text-ink">{r.name}</td>
                <td>
                  <div className="flex flex-col gap-0.5 text-sm">
                    <span className="flex items-center gap-1">
                      <a
                        href={`mailto:${r.email}`}
                        className="link-underline text-navy-text"
                      >
                        {r.email}
                      </a>
                      {r.email && <CopyButton value={r.email} label="email" />}
                    </span>
                    <span className="flex items-center gap-1">
                      <a
                        href={`tel:${r.phone}`}
                        className="link-underline text-ink-soft"
                      >
                        {r.phone}
                      </a>
                      {r.phone && <CopyButton value={r.phone} label="phone" />}
                    </span>
                  </div>
                </td>
                <td className="text-ink-soft">{r.meal}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-ink-soft">
            Nothing matches &ldquo;{query}&rdquo;.
          </p>
        )}
      </div>
    </div>
  );
}
