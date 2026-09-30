/** Parses user-typed miles ("12", "12.5", " 3 "); returns null if not a positive number. */
export function parseMiles(input: string): number | null {
  const trimmed = input.trim();
  if (!/^\d+(\.\d+)?$/.test(trimmed)) return null;
  const miles = Number(trimmed);
  return miles > 0 ? miles : null;
}

/** Validates a YYYY-MM-DD string that is a real calendar date. */
export function isValidIsoDate(input: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input)) return false;
  const date = new Date(`${input}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(input);
}
