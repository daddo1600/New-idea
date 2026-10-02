import * as Crypto from 'expo-crypto';
import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';

import { clearPerkClaims, insertPerkClaim, listPerkClaims } from '@/db/perks-repo';

import { newClaim, type PerkClaim } from './claims';
import { generatePerkCode } from './code';
import type { PerkOffer } from './offers';

/**
 * The perks claimed on this phone, re-read whenever the Perks tab comes into
 * view (the code screen marks them used); claiming one, and the demo reset.
 * Everything happens on the phone: nothing is sent anywhere.
 */
export function usePerkClaims() {
  const db = useSQLiteContext();
  const [claims, setClaims] = useState<PerkClaim[] | null>(null);

  const load = useCallback(async () => setClaims(await listPerkClaims(db)), [db]);

  useFocusEffect(
    useCallback(() => {
      load().catch(() => {});
    }, [load]),
  );

  /** A new code for the offer, saved; returns it to show. */
  const claim = useCallback(
    async (offer: PerkOffer): Promise<PerkClaim> => {
      const taken = new Set((claims ?? (await listPerkClaims(db))).map((saved) => saved.code));
      const created = newClaim(offer, generatePerkCode(offer.codePrefix, Crypto.getRandomBytes, taken), new Date());
      await insertPerkClaim(db, created);
      await load();
      return created;
    },
    [claims, db, load],
  );

  const reset = useCallback(async () => {
    await clearPerkClaims(db);
    await load();
  }, [db, load]);

  return { claims: claims ?? [], loaded: claims !== null, claim, reset };
}
