import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { CelebrationOverlay } from '@/components/celebration-overlay';
import { useLaunchIntroDone } from '@/components/launch-intro-state';
import { useT } from '@/i18n/i18n';
import { useReferral } from '@/referral/referral';

/**
 * A small thank-you on home, once, when a TestFlight install has just earned
 * the Founding driver badge (referral/founding-tester). It waits for the
 * launch animation, for home to be in view and for nothing else to be up.
 * Reduce Motion shows just the card (CelebrationOverlay).
 */
export function TesterThanks({ hold }: { hold: boolean }) {
  const t = useT();
  const { testerThanks, thankedTester } = useReferral();
  const introDone = useLaunchIntroDone();
  const [focused, setFocused] = useState(false);
  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => setFocused(false);
    }, []),
  );
  // Once it's up it stays until it closes by itself (or is tapped away).
  const [open, setOpen] = useState(false);
  if (testerThanks && !open && introDone && focused && !hold) setOpen(true);
  if (!open) return null;
  return (
    <CelebrationOverlay
      kind="thanks"
      text={t('Thanks for testing 🌱 The Founding driver badge is yours, for good.')}
      onClose={() => {
        setOpen(false);
        thankedTester();
      }}
    />
  );
}
