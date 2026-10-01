import type { AutoReason } from './classify-rules';
import type { Classification } from './trip';

/** What a shift files its drives under, unless the user's history or their own usual purpose says otherwise. */
export const SHIFT_PURPOSE = 'Deliveries';

/** Longest usual purpose kept (a short phrase, like the purposes in the picker). */
export const MAX_PURPOSE_LENGTH = 80;

/**
 * The purpose filled in for a business drive that has none: the one the user
 * chose as their usual purpose, else "Deliveries" for shift workers, else
 * none (the trip list then asks for one).
 */
export function usualPurpose({
  defaultPurpose,
  shiftMode,
}: {
  defaultPurpose: string | null;
  shiftMode: boolean;
}): string | null {
  return defaultPurpose?.trim() || (shiftMode ? SHIFT_PURPOSE : null);
}

/**
 * How a detected drive is sorted when it's saved:
 * - in a shift: business (a courier's whole shift is work);
 * - a rule matched (work hours, a learned route, a commute): what it says;
 * - otherwise business by default if the user chose that, except in shift
 *   mode, where the shift *is* the "I'm working" switch: a drive after the
 *   shift has ended (the train home, the school run) is left for them to sort.
 * - cut off a shift (the part of a drive after the shift ended, or in a
 *   pause): always left to sort, whatever a rule would say. It's where the
 *   drive home and errands end up, and the user is the one who knows.
 *
 * A business drive gets a purpose: the one learned from the user's history on
 * that route, else their usual purpose (see usualPurpose). In a shift that's
 * "Deliveries" unless the user chose a usual purpose of their own.
 */
export function autoClassify({
  inShift,
  offShift = false,
  suggestion,
  shiftMode,
  defaultBusiness,
  defaultPurpose = null,
}: {
  inShift: boolean;
  /** Cut off a shift: after its end or in a pause. */
  offShift?: boolean;
  suggestion: { classification: Classification | null; reason?: AutoReason | null; purpose?: string | null };
  shiftMode: boolean;
  defaultBusiness: boolean;
  /** The user's usual business purpose (settings), if they chose one. */
  defaultPurpose?: string | null;
}): { classification: Classification; reason: AutoReason | null; purpose: string } {
  const learned = suggestion.purpose?.trim() ?? '';
  const usual = usualPurpose({ defaultPurpose, shiftMode }) ?? '';
  if (inShift) {
    return {
      classification: 'business',
      reason: 'work-hours',
      purpose: learned || defaultPurpose?.trim() || SHIFT_PURPOSE,
    };
  }
  if (offShift) return { classification: 'unclassified', reason: null, purpose: '' };
  if (suggestion.classification) {
    return {
      classification: suggestion.classification,
      reason: suggestion.reason ?? null,
      purpose: suggestion.classification === 'business' ? learned || usual : learned,
    };
  }
  if (defaultBusiness && !shiftMode) return { classification: 'business', reason: 'default', purpose: learned || usual };
  return { classification: 'unclassified', reason: null, purpose: learned };
}
