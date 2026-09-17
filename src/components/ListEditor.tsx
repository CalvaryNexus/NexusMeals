"use client";

interface ListItem {
  label: string;
  count?: number;
}

export function ListEditor({
  label,
  items,
  onChange,
  withCount = false,
}: {
  label: string;
  items: ListItem[];
  onChange: (items: ListItem[]) => void;
  withCount?: boolean;
}) {
  function update(i: number, patch: Partial<ListItem>) {
    const next = items.slice();
    next[i] = { ...next[i], ...patch };
    onChange(next);
  }

  function remove(i: number) {
    onChange(items.filter((_, idx) => idx !== i));
  }

  function add() {
    onChange([...items, { label: "" }]);
  }

  return (
    <div>
      <label className="block font-semibold mb-1">{label}</label>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input
              value={item.label}
              onChange={(e) => update(i, { label: e.target.value })}
              className="tap-target flex-1 rounded-[8px] border border-rule px-3 py-2"
              placeholder="Item"
            />
            {withCount && (
              <input
                type="number"
                min={0}
                value={item.count ?? ""}
                onChange={(e) =>
                  update(i, {
                    count: e.target.value === "" ? undefined : Number(e.target.value),
                  })
                }
                className="tap-target w-24 rounded-[8px] border border-rule px-3 py-2"
                placeholder="Count"
              />
            )}
            <button
              type="button"
              onClick={() => remove(i)}
              className="text-need font-semibold px-2"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={add}
        className="tap-target mt-2 rounded-[8px] border border-navy px-4 py-1.5 text-navy-text font-semibold text-sm"
      >
        Add item
      </button>
    </div>
  );
}
