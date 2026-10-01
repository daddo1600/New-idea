import { describe, expect, it } from '@jest/globals';

import type { WorkWeek } from '../classify-rules';
import type { LatLng } from '../geo';
import {
  MAX_DISMISSED_SPOTS,
  overnightHomeAsk,
  rememberDismissed,
  workSpotAsk,
  type ParkedDrive,
  type Zone,
} from '../place-asks';
import type { Place } from '../places';

/** London: BST (UTC+1) from 29 March to 25 October 2026. */
const london: Zone = (ms) => (ms >= Date.UTC(2026, 2, 29, 1) && ms < Date.UTC(2026, 9, 25, 1) ? 60 : 0);

/** A London wall-clock time as an instant (month is 1-based here). */
function at(month: number, day: number, hour: number, minute = 0): number {
  const asUtc = Date.UTC(2026, month - 1, day, hour, minute);
  return asUtc - london(asUtc - 60 * 60_000) * 60_000;
}

const HOME: LatLng = { latitude: 53.8243, longitude: -1.5715 };
const OFFICE: LatLng = { latitude: 53.7962, longitude: -1.5442 };
const SHOP: LatLng = { latitude: 53.8027, longitude: -1.5727 };
/** About 100 m north of a spot. */
const near = (spot: LatLng, meters = 100): LatLng => ({ latitude: spot.latitude + meters / 111_320, longitude: spot.longitude });

let n = 0;
function drive(from: LatLng | null, to: LatLng | null, startMs: number, minutes = 20, endLabel = '14 Maple Ave'): ParkedDrive {
  return {
    id: `d${n++}`,
    startedAt: new Date(startMs).toISOString(),
    endedAt: new Date(startMs + minutes * 60_000).toISOString(),
    endLabel,
    endPlaceId: null,
    start: from,
    end: to,
  };
}

const none = { places: [] as Place[], dismissed: [] as LatLng[], zone: london };
const place = (kind: Place['kind'], spot: LatLng): Place => ({ id: kind, name: kind, kind, radiusM: 150, ...spot });

describe('overnightHomeAsk', () => {
  it('asks about where an evening drive ended when the next one starts there the next morning', () => {
    const evening = drive(SHOP, HOME, at(9, 29, 18, 10));
    const morning = drive(HOME, OFFICE, at(9, 30, 8, 0), 20, 'Office');
    const ask = overnightHomeAsk([morning, evening], { ...none, now: at(9, 30, 12) });
    expect(ask).toMatchObject({ kind: 'home', at: HOME, label: '14 Maple Ave' });
    expect(ask?.endingIds).toEqual([evening.id]);
    expect(ask?.startingIds).toEqual([morning.id]);
  });

  it('does not count a drive out before 05:00 the next morning as a night parked', () => {
    const evening = drive(SHOP, HOME, at(9, 29, 18, 10));
    const early = drive(HOME, OFFICE, at(9, 30, 4, 50));
    expect(overnightHomeAsk([evening, early], { ...none, now: at(9, 30, 12) })).toBeNull();
  });

  it('ignores drives that end in the afternoon', () => {
    const afternoon = drive(SHOP, HOME, at(9, 29, 14, 0));
    const next = drive(HOME, OFFICE, at(9, 30, 8, 0));
    expect(overnightHomeAsk([afternoon, next], { ...none, now: at(9, 30, 12) })).toBeNull();
  });

  it('counts a drive ending after midnight as that night, with the same morning', () => {
    const late = drive(SHOP, HOME, at(9, 30, 0, 20));
    const morning = drive(HOME, OFFICE, at(9, 30, 7, 0));
    expect(overnightHomeAsk([late, morning], { ...none, now: at(9, 30, 12) })?.at).toEqual(HOME);
    const tooEarly = drive(HOME, OFFICE, at(9, 30, 4, 0));
    expect(overnightHomeAsk([late, tooEarly], { ...none, now: at(9, 30, 12) })).toBeNull();
  });

  it('ignores a drive ending at 03:00 or later (not an evening)', () => {
    const dawn = drive(SHOP, HOME, at(9, 30, 3, 0));
    expect(overnightHomeAsk([dawn], { ...none, now: at(10, 1, 12) })).toBeNull();
  });

  it('with no drive since, asks only once it is past 05:00 the next day', () => {
    const evening = drive(SHOP, HOME, at(9, 29, 21, 0));
    expect(overnightHomeAsk([evening], { ...none, now: at(9, 29, 23, 0) })).toBeNull();
    expect(overnightHomeAsk([evening], { ...none, now: at(9, 30, 4, 59) })).toBeNull();
    expect(overnightHomeAsk([evening], { ...none, now: at(9, 30, 5, 1) })?.at).toEqual(HOME);
  });

  it('uses the morning after the clocks go back (05:00 GMT, not 05:00 BST)', () => {
    // Saturday 24 October, 23:00 BST; the clocks go back at 02:00 on Sunday.
    const evening = drive(SHOP, HOME, at(10, 24, 22, 40));
    const at0430Gmt = drive(HOME, OFFICE, Date.UTC(2026, 9, 25, 4, 30));
    const at0510Gmt = drive(HOME, OFFICE, Date.UTC(2026, 9, 25, 5, 10));
    expect(overnightHomeAsk([evening, at0430Gmt], { ...none, now: Date.UTC(2026, 9, 25, 12) })).toBeNull();
    expect(overnightHomeAsk([evening, at0510Gmt], { ...none, now: Date.UTC(2026, 9, 25, 12) })?.at).toEqual(HOME);
  });

  it('uses the morning after the clocks go forward (05:00 BST is 04:00 UTC)', () => {
    const evening = drive(SHOP, HOME, Date.UTC(2026, 2, 28, 21, 0));
    const morning = drive(HOME, OFFICE, Date.UTC(2026, 2, 29, 4, 30));
    expect(overnightHomeAsk([evening, morning], { ...none, now: Date.UTC(2026, 2, 29, 12) })?.at).toEqual(HOME);
  });

  it('never asks about a drive without a route', () => {
    const evening = drive(null, null, at(9, 29, 18, 10));
    const morning = drive(null, null, at(9, 30, 8, 0));
    expect(overnightHomeAsk([evening, morning], { ...none, now: at(9, 30, 12) })).toBeNull();
  });

  it('does not ask once a Home is saved', () => {
    const evening = drive(SHOP, near(HOME, 5_000), at(9, 29, 18, 10));
    const places = [place('home', HOME)];
    expect(overnightHomeAsk([evening], { ...none, places, now: at(9, 30, 12) })).toBeNull();
  });

  it('skips a named place, and a drive whose end is linked to one', () => {
    const atOffice = drive(SHOP, OFFICE, at(9, 29, 18, 10));
    expect(overnightHomeAsk([atOffice], { ...none, places: [place('work', OFFICE)], now: at(9, 30, 12) })).toBeNull();
    const linked = { ...drive(SHOP, HOME, at(9, 29, 18, 10)), endPlaceId: 'client' };
    expect(overnightHomeAsk([linked], { ...none, now: at(9, 30, 12) })).toBeNull();
  });

  it('skips a spot answered No nearby, and asks at another overnight spot instead', () => {
    const elsewhere = { latitude: 53.85, longitude: -1.6 };
    const older = drive(SHOP, elsewhere, at(9, 27, 19, 0), 20, 'Partner’s flat');
    const olderMorning = drive(elsewhere, SHOP, at(9, 28, 9, 0));
    const evening = drive(SHOP, HOME, at(9, 29, 18, 10));
    const morning = drive(HOME, OFFICE, at(9, 30, 8, 0));
    const drives = [older, olderMorning, evening, morning];
    const dismissedNear = overnightHomeAsk(drives, { ...none, dismissed: [near(HOME, 120)], now: at(9, 30, 12) });
    expect(dismissedNear).toMatchObject({ at: elsewhere, label: 'Partner’s flat' });
    const dismissedFar = overnightHomeAsk(drives, { ...none, dismissed: [near(HOME, 400)], now: at(9, 30, 12) });
    expect(dismissedFar?.at).toEqual(HOME);
  });

  it('does not count a night when the next drive starts somewhere else (moved untracked)', () => {
    const evening = drive(SHOP, HOME, at(9, 29, 18, 10));
    const morning = drive(near(HOME, 5_000), OFFICE, at(9, 30, 8, 0));
    expect(overnightHomeAsk([evening, morning], { ...none, now: at(9, 30, 12) })).toBeNull();
  });

  it('names the other recent drives ending and starting there (GPS drift included)', () => {
    const before = drive(SHOP, near(HOME, 60), at(9, 28, 18, 0));
    const beforeMorning = drive(near(HOME, 40), OFFICE, at(9, 29, 8, 0));
    const evening = drive(SHOP, HOME, at(9, 29, 18, 10));
    const morning = drive(HOME, OFFICE, at(9, 30, 8, 0));
    const ask = overnightHomeAsk([before, beforeMorning, evening, morning], { ...none, now: at(9, 30, 12) });
    expect(ask?.endingIds.sort()).toEqual([before.id, evening.id].sort());
    expect(ask?.startingIds.sort()).toEqual([beforeMorning.id, morning.id].sort());
  });
});

/** Monday to Friday, 9 to 5; Saturday too, to show weekends never count. */
const NINE_TO_FIVE = [{ start: '09:00', end: '17:00' }];
const WEEK: WorkWeek = [NINE_TO_FIVE, NINE_TO_FIVE, NINE_TO_FIVE, NINE_TO_FIVE, NINE_TO_FIVE, NINE_TO_FIVE, NINE_TO_FIVE];

/** To the office at `arrive` and away again at `leave`, on a September day. */
function dayAt(spot: LatLng, day: number, arrive: [number, number], leave: [number, number], label = 'Head office'): ParkedDrive[] {
  return [
    drive(HOME, spot, at(9, day, arrive[0], arrive[1]) - 20 * 60_000, 20, label),
    drive(spot, HOME, at(9, day, leave[0], leave[1])),
  ];
}

describe('workSpotAsk', () => {
  const now = at(9, 30, 20);
  const work = { ...none, now, workWeek: WEEK };

  it('asks about a spot parked at for 3 hours in work hours on two weekdays', () => {
    // Monday 28 and Tuesday 29 September 2026.
    const drives = [...dayAt(OFFICE, 28, [8, 30], [17, 30]), ...dayAt(near(OFFICE, 50), 29, [9, 0], [12, 0])];
    const ask = workSpotAsk(drives, work);
    expect(ask).toMatchObject({ kind: 'work', label: 'Head office' });
    expect(ask?.endingIds).toHaveLength(2);
    expect(ask?.startingIds).toHaveLength(2);
  });

  it('needs two different days', () => {
    expect(workSpotAsk(dayAt(OFFICE, 28, [8, 30], [17, 30]), work)).toBeNull();
  });

  it('needs 3 hours inside work hours, not just parked', () => {
    const short = [...dayAt(OFFICE, 28, [9, 0], [11, 45]), ...dayAt(OFFICE, 29, [9, 0], [11, 45])];
    // (Home is, though: the car stood there from noon to five on both afternoons.)
    expect(workSpotAsk(short, work)?.at).toEqual(HOME);
    const evenings = [...dayAt(OFFICE, 28, [17, 0], [23, 0]), ...dayAt(OFFICE, 29, [17, 0], [23, 0])];
    // Home saved, so the days at home aren't asked about either.
    expect(workSpotAsk(evenings, { ...work, places: [place('home', HOME)] })).toBeNull();
  });

  it('never counts weekends, even with weekend hours set', () => {
    // Saturday 26 and Sunday 27 September.
    const weekend = [...dayAt(OFFICE, 26, [8, 30], [17, 30]), ...dayAt(OFFICE, 27, [8, 30], [17, 30])];
    expect(workSpotAsk(weekend, work)).toBeNull();
  });

  it('does not ask once a Work place is saved, or at another named place', () => {
    const drives = [...dayAt(OFFICE, 28, [8, 30], [17, 30]), ...dayAt(OFFICE, 29, [8, 30], [17, 30])];
    expect(workSpotAsk(drives, { ...work, places: [place('work', near(OFFICE, 3_000))] })).toBeNull();
    expect(workSpotAsk(drives, { ...work, places: [place('client', OFFICE)] })).toBeNull();
  });

  it('skips a spot answered No nearby, but not one far away', () => {
    const drives = [...dayAt(OFFICE, 28, [8, 30], [17, 30]), ...dayAt(OFFICE, 29, [8, 30], [17, 30])];
    expect(workSpotAsk(drives, { ...work, dismissed: [near(OFFICE, 150)] })).toBeNull();
    expect(workSpotAsk(drives, { ...work, dismissed: [near(OFFICE, 2_000)] })?.at).toEqual(OFFICE);
  });

  it('prefers the spot seen on the most days', () => {
    const drives = [
      ...dayAt(OFFICE, 21, [8, 30], [17, 30]),
      ...dayAt(OFFICE, 22, [8, 30], [17, 30]),
      ...dayAt(OFFICE, 23, [8, 30], [17, 30]),
      ...dayAt(SHOP, 28, [8, 30], [17, 30], 'Client site'),
      ...dayAt(SHOP, 29, [8, 30], [17, 30], 'Client site'),
    ];
    expect(workSpotAsk(drives, work)?.at).toEqual(OFFICE);
  });

  it('never asks about drives without a route', () => {
    const drives = [...dayAt(OFFICE, 28, [8, 30], [17, 30]), ...dayAt(OFFICE, 29, [8, 30], [17, 30])].map((d) => ({
      ...d,
      start: null,
      end: null,
    }));
    expect(workSpotAsk(drives, work)).toBeNull();
  });
});

describe('rememberDismissed', () => {
  it('keeps the latest ten', () => {
    let spots: LatLng[] = [];
    for (let i = 0; i < 12; i++) spots = rememberDismissed(spots, { latitude: i, longitude: 0 });
    expect(spots).toHaveLength(MAX_DISMISSED_SPOTS);
    expect(spots[0].latitude).toBe(2);
    expect(spots.at(-1)?.latitude).toBe(11);
  });
});
