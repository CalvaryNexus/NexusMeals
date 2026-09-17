"use client";

import { PlusIcon, TrashIcon } from "./Icons";

interface ListItem {
  label: string;
  count?: number;
}

export function ListEditor({
  label,
  items,
  onChange,
  withCount = false,
  placeholder = "Item",
  addLabel = "Add item",
}: {
  label: string;
  items: ListItem[];
  onChange: (items: ListItem[]) => void;
  withCount?: boolean;
  placeholder?: string;
  addLabel?: string;
}) {
  function update(i: number, patch: Partial<ListItem>) {
    const next = items.slice();
    next[i] = { ...next[i], ...patch };
    onChange(next);
  }

  function remove(i: number) {
    onChange(items.filter((_, idx) => idx !== i));
  }

  function move(i: number, delta: number) {
    const target = i + delta;
    if (target < 0 || target >= items.length) return;
    const next = items.slice();
    [next[i], next[target]] = [next[target], next[i]];
    onChange(next);
  }

  return (
    <div>
      <p className="label">{label}</p>

      {items.length === 0 ? (
        <p className="rounded-[12px] border border-dashed border-card-line bg-paper-sunk px-4 py-4 text-sm text-ink-faint">
          Nothing here yet. This section is hidden on the public page while
          it&apos;s empty.
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((item, i) => (
            <li key={i} className="flex items-center gap-2">
              {/* Reordering by arrows keeps this usable on touch. */}
              <div className="flex flex-none flex-col">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  aria-label={`Move ${item.label || "item"} up`}
                  className="px-1 text-ink-faint transition-colors hover:text-navy-text disabled:opacity-25"
                >
                  <Chevron up />
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === items.length - 1}
                  aria-label={`Move ${item.label || "item"} down`}
                  className="px-1 text-ink-faint transition-colors hover:text-navy-text disabled:opacity-25"
                >
                  <Chevron />
                </button>
              </div>

              <input
                value={item.label}
                onChange={(e) => update(i, { label: e.target.value })}
                className="field flex-1"
                placeholder={placeholder}
              />

              {withCount && (
                <input
                  type="number"
                  min={0}
                  value={item.count ?? ""}
                  onChange={(e) =>
                    update(i, {
                      count:
                        e.target.value === ""
                          ? undefined
                          : Number(e.target.value),
                    })
                  }
                  className="field w-24 flex-none"
                  placeholder="Count"
                  aria-label="Count"
                />
              )}

              <button
                type="button"
                onClick={() => remove(i)}
                aria-label={`Remove ${item.label || "item"}`}
                className="tap-target flex flex-none items-center justify-center rounded-[10px] text-ink-faint transition-colors hover:bg-[color:var(--need)]/10 hover:text-[color:var(--need)]"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={() => onChange([...items, { label: "" }])}
        className="btn btn-secondary btn-sm mt-3"
      >
        <PlusIcon className="h-4 w-4" />
        {addLabel}
      </button>
    </div>
  );
}

function Chevron({ up = false }: { up?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-3.5 w-3.5 ${up ? "" : "rotate-180"}`}
      aria-hidden="true"
    >
      <path d="M6 15l6-6 6 6" />
    </svg>
  );
}
