import { File } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';

import { deletePlatformEarning, listPlatformEarnings } from '@/db/earnings-repo';
import { parseEarningsScreenshot, type EarningsScan, type PlatformEarning } from '@/domain/earnings-scan';
import type { RegionCode } from '@/domain/regions';
import { toLocalIsoDate } from '@/domain/trip';
import { useCanUse } from '@/hooks/use-feature';

import { TextScan } from '../../modules/text-scan';

/**
 * Earnings by platform for the Money tab (Pro, or the 3-friend perk): the
 * saved entries, re-read whenever the tab comes into view (the confirm
 * screen adds them), and deleting one.
 */
export function usePlatformEarnings() {
  const db = useSQLiteContext();
  const unlocked = useCanUse('platform-earnings');
  const [entries, setEntries] = useState<PlatformEarning[] | null>(null);

  const load = useCallback(async () => setEntries(await listPlatformEarnings(db)), [db]);

  useFocusEffect(
    useCallback(() => {
      if (unlocked) load().catch(() => {});
    }, [load, unlocked]),
  );

  const remove = useCallback(
    async (id: string) => {
      await deletePlatformEarning(db, id);
      await load();
    },
    [db, load],
  );

  return { unlocked, entries: entries ?? [], loaded: entries !== null, remove, reload: load };
}

export type ScanOutcome =
  | { kind: 'cancelled' }
  /** No text recognition here (the web preview, an older build). */
  | { kind: 'unavailable' }
  | { kind: 'failed' }
  | { kind: 'scanned'; scan: EarningsScan };

/**
 * Picks a screenshot (the system photo picker: MileSprout only sees the one
 * picked, so no photo library permission is asked for), reads its text on
 * the iPhone and parses it. The picker's copy of the image is deleted once
 * read; neither the image nor its text is kept or sent anywhere.
 */
export async function scanEarningsScreenshot(region: RegionCode): Promise<ScanOutcome> {
  if (!TextScan.isAvailable()) return { kind: 'unavailable' };
  const picked = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: false,
    allowsMultipleSelection: false,
    quality: 1,
    exif: false,
  });
  if (picked.canceled || !picked.assets?.[0]) return { kind: 'cancelled' };
  const { uri } = picked.assets[0];
  try {
    const lines = await TextScan.recognizeText(uri);
    return { kind: 'scanned', scan: parseEarningsScreenshot(lines, region, toLocalIsoDate(new Date())) };
  } catch {
    return { kind: 'failed' };
  } finally {
    try {
      const copy = new File(uri);
      if (copy.exists) copy.delete();
    } catch {
      // The picker's temporary copy; the system clears it anyway.
    }
  }
}
