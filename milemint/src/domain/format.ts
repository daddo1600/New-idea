import { parseNumber } from './parse-number';

/**
 * Parses user-typed miles or kilometres ("12", "12.5", "12,5", "1,240",
 * " 3 "); returns null if not a positive number. Read like any other number
 * (see parseNumber): a decimal comma ("12,5") is how much of the world writes
 * it, and "1,240" is a thousand and more, not 1.24.
 */
export function parseMiles(input: string): number | null {
  const miles = parseNumber(input);
  return typeof miles === 'number' && miles > 0 ? miles : null;
}

/** Validates a YYYY-MM-DD string that is a real calendar date. */
export function isValidIsoDate(input: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input)) return false;
  const date = new Date(`${input}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(input);
}
