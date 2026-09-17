"use client";

import { useRef } from "react";

export function RichTextEditor({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (html: string) => void;
  label: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function exec(command: string) {
    document.execCommand(command, false);
    ref.current?.focus();
    if (ref.current) onChange(ref.current.innerHTML);
  }

  return (
    <div>
      <label className="block font-semibold mb-1">{label}</label>
      <div className="flex gap-2 mb-2">
        <button
          type="button"
          onClick={() => exec("bold")}
          className="tap-target rounded-[6px] border border-rule px-3 py-1 font-bold text-sm"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => exec("italic")}
          className="tap-target rounded-[6px] border border-rule px-3 py-1 italic text-sm"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => exec("insertUnorderedList")}
          className="tap-target rounded-[6px] border border-rule px-3 py-1 text-sm"
        >
          List
        </button>
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
        dangerouslySetInnerHTML={{ __html: value }}
        className="min-h-[120px] rounded-[8px] border border-rule px-3 py-2 focus:outline-navy"
      />
    </div>
  );
}
