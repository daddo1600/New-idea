import { type Href, router, useLocalSearchParams } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';
import { useEffect, useMemo, useReducer, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useBackupWarning } from '@/backup/use-backup-warning';
import { HomeEmptyLines } from '@/components/home-empty';
import { LeafMark } from '@/components/leaf-mark';
import { PracticeTutorial } from '@/components/practice-tutorial';
import { Celebration } from '@/components/celebration';
import { ReminderAsk } from '@/components/reminder-ask';
import { quickPurposes } from '@/components/purpose-picker';
import { PlaceAskCard } from '@/components/place-ask-card';
import { BackdateOffer, EndShiftPrompt, UndoEndBar } from '@/components/shift-prompts';
import { shortTime } from '@/components/shift-row';
import { BackupCard } from '@/components/home/backup-card';
import { LiveDriveBanner } from '@/components/home/live-drive-banner';
import { PurposeNudge } from '@/components/home/purpose-nudge';
import { ShiftBar } from '@/components/home/shift-bar';
import { ReliefNudge, SummaryCard } from '@/components/home/summary-card';
import { TrackingCard } from '@/components/home/tracking-card';
import { WeekStrip } from '@/components/home/week-strip';
import { AddTripLink } from '@/components/trips/add-trip-links';
import { BulkActions, FillingBar, SelectBar } from '@/components/trips/list-bars';
import { SelectableTripRow } from '@/components/trips/selectable-trip-row';
import { LeavesWithPurpose, needsPurpose, TripRow } from '@/components/trips/trip-row';
import { TrackingHealthCard } from '@/components/tracking-health-card';
import { useTrackingHealth } from '@/tracking/use-tracking-health';
import { VehicleSheet } from '@/components/vehicle-sheet';
import { tabBarStyle } from '@/components/tab-bar-style';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { DEMO_MODE } from '@/dev/demo';
import { isCommute } from '@/domain/classify-rules';
import { offShiftKind } from '@/domain/shift-rows';
import { backdateStart } from '@/domain/shift-split';
import { frequentPurposes, purposesByPlace } from '@/domain/suggestions';
import { formatDistance, formatMoney, potentialDeductions, taxYearOf } from '@/domain/regions';
import { toLocalIsoDate, type Trip, VEHICLE_ICONS } from '@/domain/trip';
import { buildWeek } from '@/domain/week-strip';
import { usePlaceAsk } from '@/hooks/use-place-ask';
import { usePurposeSettings } from '@/hooks/use-purpose-settings';
import { useTheme } from '@/hooks/use-theme';
import { useTripList } from '@/hooks/use-trip-list';
import { useYearMoney } from '@/hooks/use-year-money';
import { useT } from '@/i18n/i18n';
import { useRegion } from '@/region/region';
import { rememberTotal } from '@/region/remembered-region';
import { useShift } from '@/tracking/use-shift';
import { useLiveDrive } from '@/tracking/use-live-drive';
import { useTracking } from '@/tracking/use-tracking';
import { useVehicles } from '@/vehicles/use-vehicles';
import { useMilestoneCelebration } from '@/milestones/use-milestones';

/**
 * Home: what needs doing now. The shift, the year's money back, whether
 * tracking is working, and the drives still to sort. Every drive is on the
 * Drives tab; the money in detail on Money.
 */
export default function HomeScreen() {
  const list = useTripList();
  const { trips, places, reload, setPurpose, allTrips, deductions, kindOf } = list;
  const { selecting, setSelecting, selected, setSelected, toggle, stopSelecting, markSelected, sort } = list;
  const purposeSettings = usePurposeSettings();
  /**
   * The tax year whose work drives without a purpose are shown on their own,
   * to fill in one after another (null: the drives to sort are shown).
   */
  const [filling, setFilling] = useState<number | null>(null);
  // The report screen sends the user here to fill in the purposes its year is missing,
  // and the Money tab's countdown to sort every unsorted drive at once.
  const { fill, year: fillYear, sort: sortAsked } = useLocalSearchParams<{ fill?: string; year?: string; sort?: string }>();
  const fillAsked = fill === 'purpose' ? (fillYear ?? '') : null;
  const [fillSeen, setFillSeen] = useState<string | null>(null);
  const [sortSeen, setSortSeen] = useState<string | undefined>(undefined);
  const [sortPending, setSortPending] = useState(false);
  useEffect(() => {
    if (fill || sortAsked) router.setParams({ fill: undefined, year: undefined, sort: undefined });
  }, [fill, sortAsked]);
  const insets = useSafeAreaInsets();
  const { status } = useTracking(reload);
  const { region, onboarded } = useRegion();
  const money = useYearMoney(allTrips, deductions, places);
  const { taxYear, summary, relief, nudge } = money;
  // Opened from the report: show its year's drives without a purpose (once per visit).
  if (fillAsked !== fillSeen) {
    setFillSeen(fillAsked);
    if (fillAsked !== null) setFilling(Number.isInteger(Number(fillAsked)) && fillAsked ? Number(fillAsked) : taxYear);
  }
  // Asked from Money: once per visit, as the parameter is cleared straight after.
  if (sortAsked !== sortSeen) {
    setSortSeen(sortAsked);
    if (sortAsked === 'unsorted') setSortPending(true);
  }
  const shiftMode = useShift(reload);
  /** Offers the user waved away ("Not now", "Still working"), by what they were about. */
  const [dismissed, setDismissed] = useState<ReadonlySet<string>>(new Set());
  const dismiss = (key: string) => setDismissed((current) => new Set(current).add(key));
  /** The time the offers are worked out at, ticking each minute. */
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(timer);
  }, []);
  const liveDrive = useLiveDrive();
  const garage = useVehicles();
  const theme = useTheme();
  const t = useT();
  /** Choosing a vehicle: before starting a shift, or switching from the chip on home. */
  const [picking, setPicking] = useState<'shift' | 'switch' | null>(null);
  /** Bumped when a swipe didn't start or end a shift (picker dismissed, or it failed), so the switch snaps back. */
  const [shiftRevision, bumpShiftRevision] = useReducer((n: number) => n + 1, 0);
  const shiftTrips = useMemo(
    () => (shiftMode.shift ? (trips ?? []).filter((trip) => trip.shiftId === shiftMode.shift?.id) : []),
    [trips, shiftMode.shift],
  );
  const celebration = useMilestoneCelebration(trips ? allTrips : null, deductions, region);
  // Tax offices want a purpose for every business drive: the one-tap choices, and the drives still missing one.
  const trackingHealth = useTrackingHealth();
  const backupWarning = useBackupWarning(!DEMO_MODE);
  const trackingProblem = ['tracking-stopped', 'stale', 'precise-location-off'].includes(trackingHealth.health?.issue ?? '');
  const purposeChoices = useMemo(
    () =>
      quickPurposes(
        {
          usual: purposeSettings.usual,
          chosen: purposeSettings.chosen,
          recent: frequentPurposes(trips ?? []),
          shiftMode: purposeSettings.shiftMode,
          clientPrivacy: purposeSettings.clientPrivacy,
        },
        // Enough for the purpose sheet's tiles.
        10,
      ),
    [trips, purposeSettings.usual, purposeSettings.chosen, purposeSettings.shiftMode, purposeSettings.clientPrivacy],
  );
  // What each place's drives were last for: a drive without a purpose is offered the same again.
  const purposeHistory = useMemo(
    () => purposesByPlace(trips ?? [], (id) => places.some((place) => place.id === id && place.kind === 'home')),
    [trips, places],
  );
  const needPurpose = useMemo(
    () => allTrips.filter((trip) => needsPurpose(trip) && taxYearOf(trip.localDate, region) === (filling ?? taxYear)),
    [allTrips, region, taxYear, filling],
  );
  // For the opening next time: this tax year's total and business distance, grown from zero.
  const launchTotal = money.yearTotal;
  useEffect(() => {
    if (trips && onboarded && !DEMO_MODE) rememberTotal(launchTotal, summary.businessMeters).catch(() => {});
  }, [trips, onboarded, launchTotal, summary.businessMeters]);

  const placeAsk = usePlaceAsk(trips, places, now, reload);
  const week = useMemo(
    () => buildWeek(allTrips, deductions, toLocalIsoDate(new Date(now)), purposeSettings.workWeek),
    [allTrips, deductions, now, purposeSettings.workWeek],
  );

  if (!trips) return <ActivityIndicator style={styles.loading} />;

  const unsorted = trips.filter((trip) => trip.classification === 'unclassified');
  // From the Money tab's countdown: every unsorted drive picked, to sort at once.
  if (sortPending) {
    setSortPending(false);
    setFilling(null);
    setSelecting(true);
    setSelected(new Set(unsorted.map((trip) => trip.id)));
  }

  // "Worth up to" on unsorted rows: the year's business distance added up once, not once per row.
  const potentialOf = potentialDeductions(allTrips, region);

  // Home lists what needs doing: the drives to sort, or the ones missing a purpose.
  const items: readonly Trip[] = filling !== null ? needPurpose : unsorted;
  // "Start shift from 10:40?": unsorted drives that look like work, before a
  // shift was started (or with none started at all). Never into the last shift.
  const lastShiftEnd = Math.max(0, ...shiftMode.shifts.map((s) => (s.endedAt ? Date.parse(s.endedAt) : 0)));
  const runningSince = shiftMode.shift ? Date.parse(shiftMode.shift.startedAt) : null;
  const offer = !shiftMode.enabled
    ? null
    : runningSince === null
      ? backdateStart(trips, now, { notBefore: lastShiftEnd })
      : // Started late: offered for the first two hours of the shift.
        now - runningSince < 2 * 3_600_000
        ? backdateStart(trips, runningSince, { notBefore: lastShiftEnd, minDrives: 1 })
        : null;
  const showOffer = offer && !dismissed.has(`offer:${offer.from}`) ? offer : null;
  // "End shift?": the shift's last drive ended at Home a while ago and nothing's moved since.
  const lastShiftTrip = shiftTrips.reduce<Trip | null>(
    (latest, trip) => (!latest || trip.startedAt > latest.startedAt ? trip : latest),
    null,
  );
  const parkedAtHome =
    shiftMode.shift &&
    !liveDrive &&
    lastShiftTrip?.endedAt &&
    kindOf(lastShiftTrip.endPlaceId) === 'home' &&
    now - Date.parse(lastShiftTrip.endedAt) >= 45 * 60_000 &&
    !dismissed.has(`home:${lastShiftTrip.id}`)
      ? lastShiftTrip
      : null;

  const tripRow = (item: Trip, onPurpose: (purpose: string) => void | Promise<unknown>, rowLeaves: boolean) => (
    <TripRow
      trip={item}
      deduction={deductions.get(item.id) ?? 0}
      potential={item.classification === 'unclassified' ? potentialOf(item) : 0}
      commute={isCommute(kindOf(item.startPlaceId), kindOf(item.endPlaceId))}
      offShift={offShiftKind(item, shiftMode.shifts)}
      onClassify={(c) => sort([item], c)}
      onLongPress={() => list.confirmDelete(item)}
      usualPurpose={purposeSettings.usual}
      purposeChoices={purposeChoices}
      purposeHistory={purposeHistory}
      clientPrivacy={purposeSettings.clientPrivacy}
      onPurpose={onPurpose}
      rowLeaves={rowLeaves}
    />
  );
  const renderTripRow = (item: Trip) =>
    filling !== null ? (
      // Filling in purposes: a drive given one leaves the list, so it slides out first.
      <LeavesWithPurpose onPurpose={(purpose) => setPurpose(item, purpose)}>
        {(onPurpose) => tripRow(item, onPurpose, true)}
      </LeavesWithPurpose>
    ) : (
      tripRow(item, (purpose) => setPurpose(item, purpose), false)
    );

  return (
    <ThemedView style={styles.container}>
      {/* The bulk actions bar takes the tab bar's place while selecting. */}
      <Tabs.Screen options={{ tabBarStyle: tabBarStyle(insets.bottom, selecting) }} />
      <FlatList
        data={items}
        keyExtractor={(trip) => trip.id}
        // Room for the bulk actions bar while selecting.
        contentContainerStyle={[styles.list, selecting && { paddingBottom: 160 + insets.bottom }]}
        ListHeaderComponent={
          <View style={styles.header}>
            {/* Couriers: the shift comes first, it's what they tap every day. */}
            {shiftMode.enabled && (
              <ShiftBar
                shift={shiftMode.shift}
                drives={shiftTrips.length}
                distance={formatDistance(
                  shiftTrips.reduce((sum, trip) => sum + trip.distanceMeters, 0),
                  region,
                )}
                value={formatMoney(
                  shiftTrips.reduce((sum, trip) => sum + (deductions.get(trip.id) ?? 0), 0),
                  region,
                )}
                revision={shiftRevision}
                onStart={() =>
                  garage.vehicles.length > 1 ? setPicking('shift') : shiftMode.start().catch(bumpShiftRevision)
                }
                onEnd={() => shiftMode.end().catch(bumpShiftRevision)}
              />
            )}
            {shiftMode.ended && (
              <UndoEndBar
                onUndo={() =>
                  shiftMode
                    .undo()
                    .catch(() => {})
                    .finally(bumpShiftRevision)
                }
              />
            )}
            {showOffer && (
              <BackdateOffer
                time={shortTime(showOffer.from, region)}
                count={showOffer.tripIds.length}
                running={shiftMode.shift !== null}
                onAccept={() => {
                  dismiss(`offer:${showOffer.from}`);
                  shiftMode
                    .startFrom(new Date(showOffer.from))
                    .catch(() => {})
                    .finally(bumpShiftRevision);
                }}
                onDismiss={() => dismiss(`offer:${showOffer.from}`)}
              />
            )}
            {parkedAtHome && (
              <EndShiftPrompt
                since={shortTime(parkedAtHome.endedAt!, region)}
                onEnd={() => shiftMode.end().catch(bumpShiftRevision)}
                onDismiss={() => dismiss(`home:${parkedAtHome.id}`)}
              />
            )}
            {/* The year's money back; the whole card opens the Money tab. */}
            <Pressable
              accessibilityHint={t('Opens the Money tab')}
              onPress={() => router.navigate('/money' as Href)}>
              <SummaryCard summary={summary} commuteCents={money.commuteCents} relief={relief} />
            </Pressable>
            {nudge && <ReliefNudge nudge={nudge} />}
            {liveDrive && <LiveDriveBanner drive={liveDrive} />}
            {/* Tracking that stopped, or a drive it lost: never silent. */}
            <TrackingHealthCard state={trackingHealth} />
            {/* Backups that aren't working: a lost iPhone would take the trips with it. */}
            {backupWarning && <BackupCard warning={backupWarning} />}
            <TrackingCard
              status={status}
              working={!trackingProblem}
              workWeek={purposeSettings.workWeek}
              now={now}
              region={region}
            />
            {/* The week so far, a column a day: fills itself in as drives are logged. */}
            <WeekStrip week={week} region={region} />
            {/* Home and work, asked once the drives show where they are (not at set-up). */}
            {placeAsk.ask && !selecting && filling === null && (
              <PlaceAskCard
                ask={placeAsk.ask}
                onYes={() => placeAsk.confirm().catch(() => {})}
                onNo={() => placeAsk.decline().catch(() => {})}
              />
            )}
            {filling === null && needPurpose.length > 0 && (
              <PurposeNudge count={needPurpose.length} onFill={() => setFilling(taxYear)} />
            )}
            {allTrips.length > 0 && <ReminderAsk />}
            {garage.vehicles.length > 1 && garage.current && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('Driving {{vehicle}}. Change vehicle', { vehicle: garage.current.name })}
                onPress={() => setPicking('switch')}
                style={[styles.vehicleChip, { backgroundColor: theme.backgroundElement }]}>
                <ThemedText type="small" themeColor="textSecondary">
                  {t('Driving:')}
                </ThemedText>
                <ThemedText type="smallBold">
                  {VEHICLE_ICONS[garage.current.type]} {garage.current.name}
                </ThemedText>
                <ThemedText type="small" style={{ color: theme.accent }}>
                  ▾
                </ThemedText>
              </Pressable>
            )}
            {filling !== null && <FillingBar count={needPurpose.length} onDone={() => setFilling(null)} />}
            {filling === null && (unsorted.length > 0 || selecting) && (
              <SelectBar
                title={t('To sort')}
                selecting={selecting}
                unsortedCount={unsorted.length}
                onStart={() => setSelecting(true)}
                onSelectUnsorted={() => setSelected(new Set(unsorted.map((trip) => trip.id)))}
                onCancel={stopSelecting}
              />
            )}
          </View>
        }
        ListEmptyComponent={
          // Filling in purposes: the bar above says they're all done.
          filling !== null ? null : trips.length === 0 ? (
            <View style={styles.empty}>
              <LeafMark size={72} />
              <ThemedText type="smallBold">{status === 'on' ? t('Ready for your first drive') : t('No drives yet')}</ThemedText>
              <HomeEmptyLines trackingOn={status === 'on'} style={styles.emptyBody} />
              <AddTripLink />
            </View>
          ) : (
            // Nothing to sort: the rest are on the Drives tab.
            <Pressable
              accessibilityRole="button"
              onPress={() => router.navigate('/drives' as Href)}
              style={[styles.allSorted, { backgroundColor: theme.backgroundElement }]}>
              <ThemedText type="smallBold" style={styles.flex}>
                {t('All drives sorted ✓')}
              </ThemedText>
              <ThemedText type="smallBold" style={{ color: theme.accent }}>
                {t('See all drives ›')}
              </ThemedText>
            </Pressable>
          )
        }
        renderItem={({ item }) =>
          selecting ? (
            <SelectableTripRow trip={item} selected={selected.has(item.id)} onToggle={() => toggle(item)} />
          ) : (
            renderTripRow(item)
          )
        }
      />
      <Celebration content={celebration.content} onClose={celebration.close} />
      {/* Once after setup (or replayed from Settings): sort two sample drives, nothing saved. */}
      <PracticeTutorial
        TripRow={TripRow}
        // Never over a drive being recorded, a running shift (or its Undo), or another overlay.
        hold={
          liveDrive !== null ||
          shiftMode.shift !== null ||
          shiftMode.ended !== null ||
          celebration.content !== null ||
          picking !== null
        }
      />
      <VehicleSheet
        visible={picking !== null}
        title={picking === 'shift' ? t('Which vehicle today?') : t('What are you driving?')}
        vehicles={garage.vehicles}
        currentId={garage.current?.id ?? null}
        onClose={() => {
          // Dismissed without choosing: the shift didn't start.
          if (picking === 'shift') bumpShiftRevision();
          setPicking(null);
        }}
        onPick={async (vehicle) => {
          const startShift = picking === 'shift';
          setPicking(null);
          try {
            await garage.choose(vehicle);
            if (startShift) await shiftMode.start();
          } catch {
            if (startShift) bumpShiftRevision();
          }
        }}
      />
      {selecting && (
        <BulkActions
          count={selected.size}
          bottom={insets.bottom}
          onBusiness={() => markSelected('business')}
          onPersonal={() => markSelected('personal')}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1 },
  container: { flex: 1 },
  list: {
    padding: Spacing.three,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  empty: { alignItems: 'center', gap: Spacing.two, marginTop: Spacing.five, paddingHorizontal: Spacing.four },
  emptyBody: { textAlign: 'center' },
  flex: { flex: 1 },
  allSorted: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: 12,
    padding: Spacing.three,
  },
  vehicleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: Spacing.one + 2,
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one + 2,
  },
  header: { gap: Spacing.three },
});
