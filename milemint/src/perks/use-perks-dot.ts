import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';

import { updateSettings } from '@/db/settings-repo';
import { useRegion } from '@/region/region';

import { nextDotMemory, PERKS_NEW_DOT_ENABLED, type DotMemory, type DotOffer } from './new-dot';

/**
 * Live partner offers for the dot. None yet: the Perks tab shows demo offers
 * only, which never count. Once real partners are live, these come from the
 * server with the offers themselves.
 */
const LIVE_OFFERS: readonly DotOffer[] = [];

/**
 * Whether the Perks tab shows its "new" dot (perks/new-dot), kept in step
 * with settings each time Perks is opened or left. Does nothing while the
 * flag is off.
 */
export function usePerksNewDot(perksFocused: boolean): boolean {
  const db = useSQLiteContext();
  const { region } = useRegion();
  const [showing, setShowing] = useState(false);

  useEffect(() => {
    if (!PERKS_NEW_DOT_ENABLED) return;
    let live = true;
    updateSettings(db, (saved) => {
      const memory: DotMemory = {
        seenIds: saved.perksSeenOfferIds,
        lastShownAt: saved.perksDotLastShownAt,
        showing: saved.perksDotShowing,
      };
      const next = nextDotMemory(memory, {
        enabled: PERKS_NEW_DOT_ENABLED,
        offers: LIVE_OFFERS,
        region: region.code,
        vehicle: saved.vehicle,
        perksFocused,
        now: new Date(),
      });
      return { perksSeenOfferIds: [...next.seenIds], perksDotLastShownAt: next.lastShownAt, perksDotShowing: next.showing };
    }).then(
      (saved) => live && setShowing(saved.perksDotShowing),
      () => {},
    );
    return () => {
      live = false;
    };
  }, [db, region.code, perksFocused]);

  return PERKS_NEW_DOT_ENABLED && showing && !perksFocused;
}
