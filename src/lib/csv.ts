import type { Signup } from "./types";

// Volunteers type these values, so a cell like `=HYPERLINK(...)` would run as
// a formula when the export is opened in Excel or Sheets. Prefixing with an
// apostrophe makes the spreadsheet treat it as plain text.
function neutralizeFormula(value: string): string {
  return /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
}

function csvEscape(value: string): string {
  const safe = neutralizeFormula(value);
  if (/[",\n\r]/.test(safe)) {
    return `"${safe.replace(/"/g, '""')}"`;
  }
  return safe;
}

export function signupsToCsv(signups: Signup[]): string {
  const header = ["name", "email", "phone", "date", "meal"];
  const rows = signups.map((s) =>
    [s.name ?? "", s.email ?? "", s.phone ?? "", s.date, s.meal]
      .map((v) => csvEscape(v))
      .join(","),
  );
  return [header.join(","), ...rows].join("\n");
}
