/**
 * Pure phone helpers, kept out of `validation.ts` so client components can
 * import them without pulling zod into the browser bundle.
 */

export function normalizeUsPhoneDigits(phone: string): string {
  return phone.replace(/\D/g, "");
}

export function isValidUsPhone(phone: string): boolean {
  const digits = normalizeUsPhoneDigits(phone);
  if (digits.length === 10) return true;
  if (digits.length === 11 && digits.startsWith("1")) return true;
  return false;
}

/** Formats as the user types: "5555555555" -> "(555) 555-5555". */
export function formatUsPhone(input: string): string {
  let digits = normalizeUsPhoneDigits(input).slice(0, 11);
  let prefix = "";
  if (digits.length === 11 && digits.startsWith("1")) {
    prefix = "1 ";
    digits = digits.slice(1);
  } else {
    digits = digits.slice(0, 10);
  }
  if (digits.length === 0) return "";
  if (digits.length < 4) return `${prefix}${digits}`;
  if (digits.length < 7) return `${prefix}(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `${prefix}(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}
