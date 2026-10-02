import { displayLocale, type Region } from '@/domain/regions';
import { msg } from '@/i18n/i18n';

import type { BackupProblem } from './backup';
import type { Age } from './schedule';

/** Why a backup can't be restored, and what to do about it. Shown with `t()`. */
export const PROBLEM_TEXT: Record<BackupProblem, string> = {
  'key-missing': msg(
    'This backup is locked with a key from your iCloud Keychain that hasn’t reached this iPhone yet. Check that iCloud Keychain is on (iPhone Settings → your name → iCloud), wait a minute, then try again.',
  ),
  'newer-app': msg('This backup was made by a newer version of MileSprout. Update the app, then try again.'),
  'not-downloaded': msg('The backup hasn’t downloaded from iCloud yet. Check your connection and try again.'),
  damaged: msg('This backup couldn’t be read. It may be damaged.'),
};

type T = (key: string, params?: Record<string, string | number>) => string;

/** "Backed up 3 hours ago", as whole sentences so each language can word them its own way. */
export function backedUpText(age: Age, t: T): string {
  switch (age.unit) {
    case 'now':
      return t('Backed up just now');
    case 'minutes':
      return t('Backed up {{count}} minutes ago', { count: age.count });
    case 'hours':
      return t('Backed up {{count}} hours ago', { count: age.count });
    case 'days':
      return t('Backed up {{count}} days ago', { count: age.count });
  }
}

/** "1 October 2026", in the user's language and their country's date order. */
export function formatBackupDate(date: Date, region: Region): string {
  return date.toLocaleDateString(displayLocale(region), { day: 'numeric', month: 'long', year: 'numeric' });
}
