/**
 * A number as typed, in either convention: "2,400.50" or "2.400,50",
 * "48,210", "48 210" or "2400,50". Many users write a decimal comma (Polish,
 * French, Romanian, Brazilian…), so "2400,50" must mean 2400.5, not 240050.
 *
 * - Both separators: the last one is the decimal point, used once, and the
 *   other one groups thousands (every group after the first has three digits).
 * - Commas only: thousands when every group after one has exactly three
 *   digits ("48,210"), otherwise a single decimal comma ("2400,50"). A first
 *   group of 0 is never thousands: "0,001" is 0.001.
 * - Dots only: one dot is a decimal point; several are thousands ("1.234.567").
 *
 * Empty → null; not a number (or too big to be one) → undefined.
 */
export function parseNumber(text: string): number | null | undefined {
  const compact = text.trim().replace(/[\s  '$£€]/g, '');
  if (!compact) return null;
  if (!/^\d[\d.,]*$/.test(compact) || /[.,]$/.test(compact) || /[.,]{2}/.test(compact)) return undefined;
  const normal = normalise(compact);
  if (normal === undefined || !/^\d+(\.\d+)?$/.test(normal)) return undefined;
  const value = Number(normal);
  return Number.isFinite(value) ? value : undefined;
}

/** Groups of thousands: "1", "234", "567" (the first one not just zeros, the others three digits). */
const isThousands = (groups: string[]) =>
  groups.length > 1 && /[1-9]/.test(groups[0]) && groups.slice(1).every((group) => /^\d{3}$/.test(group));

function normalise(compact: string): string | undefined {
  const lastComma = compact.lastIndexOf(',');
  const lastDot = compact.lastIndexOf('.');
  if (lastComma >= 0 && lastDot >= 0) {
    const decimal = lastComma > lastDot ? ',' : '.';
    const group = decimal === ',' ? '.' : ',';
    const [whole, fraction, ...more] = compact.split(decimal);
    // One decimal point, after all the thousands groups ("1.2.3,4" and "1,500.25.3" aren't numbers).
    if (more.length > 0 || fraction.includes(group) || !isThousands(whole.split(group))) return undefined;
    return `${whole.split(group).join('')}.${fraction}`;
  }
  if (lastComma >= 0) {
    const groups = compact.split(',');
    if (isThousands(groups)) return groups.join('');
    return groups.length === 2 ? groups.join('.') : undefined;
  }
  const groups = compact.split('.');
  if (groups.length <= 2) return compact;
  return isThousands(groups) ? groups.join('') : undefined;
}

/**
 * An odometer reading as typed. As parseNumber, except that a dot followed by
 * exactly three digits groups thousands ("48.210" is 48,210 km, as Polish,
 * Romanian or Brazilian drivers write it): an odometer is read in whole units,
 * so 48.21 km was never meant.
 */
export function parseOdometer(text: string): number | null | undefined {
  const compact = text.trim().replace(/[\s  ']/g, '');
  if (/^\d{1,3}(\.\d{3})+$/.test(compact)) return Number(compact.split('.').join(''));
  return parseNumber(text);
}

/**
 * An amount of money as typed, in minor units (pence, cents): "3.50", "3,50"
 * (a decimal comma), "£3.50", "$12", "A$4.20", "1,250.00". As parseNumber,
 * with a currency sign (and a country's letters before it) allowed in front,
 * and at most two decimal places: "3.505" is a typo, not money.
 *
 * Empty → null; not an amount (negative, three decimals, words) → undefined.
 */
export function parseMoneyMinor(text: string): number | null | undefined {
  const plain = text.trim().replace(/^(?:[A-Za-z]{1,3}\s?)?[$£€]\s*/, '');
  const value = parseNumber(plain);
  if (value === null || value === undefined) return value;
  const minor = Math.round(value * 100);
  // More than two decimal places once read ("3.505", "0,125"), or too big to hold exactly.
  if (Math.abs(value * 100 - minor) > 1e-6 || !Number.isSafeInteger(minor)) return undefined;
  return minor;
}

/** Minor units as an amount to edit: 350 → "3.50", 0 → "" (nothing entered). */
export function minorToInput(minor: number | null | undefined): string {
  return minor ? (minor / 100).toFixed(2) : '';
}
