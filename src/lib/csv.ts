import type { Signup } from "./types";

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
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
