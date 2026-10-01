import type { AutoReason } from './classify-rules';
import type { Classification } from './trip';

/**
 * How a detected drive is sorted when it's saved:
 * - in a shift: business (a courier's whole shift is work);
 * - a rule matched (work hours, a learned route, a commute): what it says;
 * - otherwise business by default if the user chose that, except in shift
 *   mode, where the shift *is* the "I'm working" switch: a drive after the
 *   shift has ended (the train home, the school run) is left for them to sort.
 */
export function autoClassify({
  inShift,
  suggestion,
  shiftMode,
  defaultBusiness,
}: {
  inShift: boolean;
  suggestion: { classification: Classification | null; reason?: AutoReason | null; purpose?: string | null };
  shiftMode: boolean;
  defaultBusiness: boolean;
}): { classification: Classification; reason: AutoReason | null; purpose: string } {
  if (inShift) return { classification: 'business', reason: 'work-hours', purpose: suggestion.purpose ?? 'Deliveries' };
  if (suggestion.classification) {
    return { classification: suggestion.classification, reason: suggestion.reason ?? null, purpose: suggestion.purpose ?? '' };
  }
  if (defaultBusiness && !shiftMode) return { classification: 'business', reason: 'default', purpose: suggestion.purpose ?? '' };
  return { classification: 'unclassified', reason: null, purpose: suggestion.purpose ?? '' };
}
