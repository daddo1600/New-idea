/**
 * A number as typed, in either convention: "2,400.50" or "2.400,50",
 * "48,210", "48 210" or "2400,50". Many users write a decimal comma (Polish,
 * French, Romanian, Brazilian…), so "2400,50" must mean 2400.5, not 240050.
 *
 * - Both separators: the last one is the decimal point.
 * - Commas only: thousands when every group after one has exactly three
 *   digits ("48,210"), otherwise a decimal comma ("2400,50").
 * - Dots only: one dot is a decimal point; several are thousands ("1.234.567").
 *
 * Empty → null; not a number → undefined.
 */
export function parseNumber(text: string): number | null | undefined {
  const compact = text.trim().replace(/[\s  '$£€]/g, '');
  if (!compact) return null;
  if (!/^\d[\d.,]*$/.test(compact) || /[.,]$/.test(compact)) return undefined;
  const lastComma = compact.lastIndexOf(',');
  const lastDot = compact.lastIndexOf('.');
  let normal: string;
  if (lastComma >= 0 && lastDot >= 0) {
    const decimal = lastComma > lastDot ? ',' : '.';
    const group = decimal === ',' ? '.' : ',';
    normal = compact.split(group).join('').replace(decimal, '.');
  } else if (lastComma >= 0) {
    const groups = compact.split(',');
    normal = groups.slice(1).every((g) => g.length === 3) ? groups.join('') : compact.replace(',', '.');
  } else {
    const dots = compact.split('.').length - 1;
    normal = dots > 1 ? compact.split('.').join('') : compact;
  }
  return /^\d+(\.\d+)?$/.test(normal) ? Number(normal) : undefined;
}
