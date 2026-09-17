"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const COMMANDS = [
  { command: "bold", label: "B", title: "Bold", className: "font-bold" },
  { command: "italic", label: "I", title: "Italic", className: "italic" },
  {
    command: "insertUnorderedList",
    label: "List",
    title: "Bulleted list",
    className: "",
  },
] as const;

export function RichTextEditor({
  value,
  onChange,
  label,
  hint,
}: {
  value: string;
  onChange: (html: string) => void;
  label: string;
  hint?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<Record<string, boolean>>({});
  const [focused, setFocused] = useState(false);

  // Reflect the caret's formatting on the toolbar so the buttons read as
  // state, not just as actions.
  const syncActive = useCallback(() => {
    if (typeof document.queryCommandState !== "function") return;
    const next: Record<string, boolean> = {};
    for (const { command } of COMMANDS) {
      try {
        next[command] = document.queryCommandState(command);
      } catch {
        next[command] = false;
      }
    }
    setActive(next);
  }, []);

  useEffect(() => {
    document.addEventListener("selectionchange", syncActive);
    return () => document.removeEventListener("selectionchange", syncActive);
  }, [syncActive]);

  function exec(command: string) {
    document.execCommand(command, false);
    ref.current?.focus();
    if (ref.current) onChange(ref.current.innerHTML);
    syncActive();
  }

  return (
    <div>
      <p className="label">{label}</p>
      <div
        className={`overflow-hidden rounded-[12px] border-[1.5px] transition-[border-color,box-shadow] duration-200 ${
          focused
            ? "border-navy-stripe shadow-[0_0_0_4px_color-mix(in_srgb,var(--navy-stripe)_14%,transparent)]"
            : "border-rule"
        }`}
      >
        <div className="flex gap-1 border-b border-rule bg-paper-sunk px-2 py-1.5">
          {COMMANDS.map((c) => (
            <button
              key={c.command}
              type="button"
              title={c.title}
              aria-label={c.title}
              aria-pressed={active[c.command] ?? false}
              // Keep the caret in the editor when the toolbar is clicked.
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => exec(c.command)}
              className={`min-w-9 rounded-[8px] px-2.5 py-1.5 text-sm transition-colors ${c.className} ${
                active[c.command]
                  ? "bg-navy text-white"
                  : "text-ink-soft hover:bg-black/5 hover:text-navy-text"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div
          ref={ref}
          contentEditable
          role="textbox"
          aria-multiline="true"
          aria-label={label}
          suppressContentEditableWarning
          onInput={(e) => onChange(e.currentTarget.innerHTML)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          dangerouslySetInnerHTML={{ __html: value }}
          className="prose-rich min-h-[130px] bg-paper px-3.5 py-3 focus:outline-none"
        />
      </div>
      {hint && <p className="hint">{hint}</p>}
    </div>
  );
}
