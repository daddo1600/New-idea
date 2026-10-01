import { PromptCard } from '@/components/shift-prompts';
import type { SpotAsk } from '@/domain/place-asks';
import { shownLabel } from '@/domain/privacy';
import { useT } from '@/i18n/i18n';

/** "Is this home? 12 Maple Ave": asked once the drives show it, instead of typed in at set-up. */
export function PlaceAskCard({ ask, onYes, onNo }: { ask: SpotAsk; onYes: () => void; onNo: () => void }) {
  const t = useT();
  const place = shownLabel(ask.label, t);
  return ask.kind === 'home' ? (
    <PromptCard
      title={t('Is this home? {{place}}', { place })}
      body={t('You stopped here for the night. Trips to and from it will read “Home”.')}
      action={t('Yes, that’s home')}
      dismiss={t('No')}
      onAction={onYes}
      onDismiss={onNo}
    />
  ) : (
    <PromptCard
      title={t('Is this work? {{place}}', { place })}
      body={t('You’re often parked here in your work hours. Trips will read “Work”, and drives between home and work are flagged as commutes.')}
      action={t('Yes, that’s work')}
      dismiss={t('No')}
      onAction={onYes}
      onDismiss={onNo}
    />
  );
}
