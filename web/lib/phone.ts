/**
 * Philippine mobile numbers. People type them as 0917 123 4567, +63 917 ...,
 * or 63917...; all three reduce to the same ten national digits (917 123 4567).
 */
export function normalizePH(input: string): string {
  let d = input.replace(/\D/g, '');
  if (d.startsWith('63')) d = d.slice(2);
  else if (d.startsWith('0')) d = d.slice(1);
  return d.slice(0, 10);
}

/** Ten digits starting with 9 (every PH mobile number does). */
export const isValidPH = (digits: string) => /^9\d{9}$/.test(digits);

/** 9171234567 -> "917 123 4567" (partial input formats as far as it goes). */
export function formatPH(digits: string): string {
  return [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 10)].filter(Boolean).join(' ');
}

/** 9171234567 -> "+63 917 *** 4567": enough to confirm, not enough to read aloud. */
export const maskPH = (digits: string) => `+63 ${digits.slice(0, 3)} *** ${digits.slice(6, 10)}`;
