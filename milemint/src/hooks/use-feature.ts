import { canUse, type ProFeature } from '@/domain/plan';
import { usePro } from '@/purchases/pro';
import { useReferral } from '@/referral/referral';

/** Whether the user can use a Pro feature now: with Pro, or through an invite perk (domain/plan). */
export function useCanUse(feature: ProFeature): boolean {
  const { isPro } = usePro();
  const { perks } = useReferral();
  return canUse(feature, { isPro, perks });
}
