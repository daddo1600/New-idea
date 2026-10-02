import { Redirect, router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useReducer, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAutoBackup } from '@/backup/use-backup';
import { MenuButton } from '@/components/header-menu';
import { HomeEmptyLines } from '@/components/home-empty';
import { LeafMark } from '@/components/leaf-mark';
import { LogbookNudge } from '@/components/logbook-nudge';
import { PracticeTutorial } from '@/components/practice-tutorial';
import { Celebration } from '@/components/celebration';
import { ReminderAsk } from '@/components/reminder-ask';
import { quickPurposes } from '@/components/purpose-picker';
import { PlaceAskCard } from '@/components/place-ask-card';
import { BackdateOffer, EndShiftPrompt, UndoEndBar } from '@/components/shift-prompts';
import { shortTime, ShiftRow } from '@/components/shift-row';
import { LiveDriveBanner } from '@/components/home/live-drive-banner';
import { PlanCard } from '@/components/home/plan-card';
import { PurposeNudge } from '@/components/home/purpose-nudge';
import { ShiftBar } from '@/components/home/shift-bar';
import { ReliefNudge, SummaryCard } from '@/components/home/summary-card';
import { TrackingCard } from '@/components/home/tracking-card';
import { AddTripButton } from '@/components/trips/add-trip-button';
import { BulkActions, FillingBar, SelectBar, ValueWaitsNotice } from '@/components/trips/list-bars';
import { LockedTripRow } from '@/components/trips/locked-trip-row';
import { SelectableTripRow } from '@/components/trips/selectable-trip-row';
import { needsPurpose, TripRow } from '@/components/trips/trip-row';
import { TaxCountdown } from '@/components/tax-countdown';
import { TrackingHealthCard } from '@/components/tracking-health-card';
import { useTrackingHealth } from '@/tracking/use-tracking-health';
import { VehicleSheet } from '@/components/vehicle-sheet';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { DEMO_MODE } from '@/dev/demo';
import { isCommute } from '@/domain/classify-rules';
import { homeItems, itemKey, offShiftKind, type HomeItem } from '@/domain/shift-rows';
import { backdateStart } from '@/domain/shift-split';
import { frequentPurposes } from '@/domain/suggestions';
import { formatDistance, formatMoney, potentialDeductions, taxYearOf } from '@/domain/regions';
import { type Trip, VEHICLE_ICONS } from '@/domain/trip';
import { usePlaceAsk } from '@/hooks/use-place-ask';
import { usePurposeSettings } from '@/hooks/use-purpose-settings';
import { useTheme } from '@/hooks/use-theme';
import { useTripList } from '@/hooks/use-trip-list';
import { useYearMoney } from '@/hooks/use-year-money';
import { useT } from '@/i18n/i18n';
import { usePro } from '@/purchases/pro';
import { useRegion } from '@/region/region';
import { rememberTotal } from '@/region/remembered-region';
import { useReminders } from '@/reminders/use-reminders';
import { useShift } from '@/tracking/use-shift';
import { useLiveDrive } from '@/tracking/use-live-drive';
import { useTracking } from '@/tracking/use-tracking';
import { useVehicles } from '@/vehicles/use-vehicles';
import { useMilestoneCelebration } from '@/milestones/use-milestones';

export default function HomeScreen() {
  const list = useTripList();
  const { trips, places, reload, setPurpose, locked, visible, deductions, kindOf } = list;
  const { selecting, setSelecting, selected, setSelected, toggle, stopSelecting, markSelected, sort } = list;
  const purposeSettings = usePurposeSettings();
  /**
   * The tax year whose work drives without a purpose are shown on their own,
   * to fill in one after another (null: all drives are shown).
   */
  const [filling, setFilling] = useState<number | null>(null);
  // The report screen sends the user here to fill in the purposes its year is missing.
  const { fill, year: fillYear } = useLocalSearchParams<{ fill?: string; year?: string }>();
  const fillAsked = fill === 'purpose' ? (fillYear ?? '') : null;
  const [fillSeen, setFillSeen] = useState<string | null>(null);
  useEffect(() => {
    if (fill) router.setParams({ fill: undefined, year: undefined });
  }, [fill]);
  const insets = useSafeAreaInsets();
  const { status } = useTracking(reload);
  const { isPro } = usePro();
  const { region, loaded, onboarded } = useRegion();
  const money = useYearMoney(visible, deductions, places);
  const { taxYear, summary, relief, nudge } = money;
  // Opened from the report: show its year's drives without a purpose (once per visit).
  if (fillAsked !== fillSeen) {
    setFillSeen(fillAsked);
    if (fillAsked !== null) setFilling(Number.isInteger(Number(fillAsked)) && fillAsked ? Number(fillAsked) : taxYear);
  }
  useReminders(region);
  // Encrypted copy in the user's own iCloud, so a lost phone doesn't take the log with it.
  useAutoBackup(onboarded && !DEMO_MODE);
  const shiftMode = useShift(reload);
  /** Offers the user waved away ("Not now", "Still working"), by what they were about. */
  const [dismissed, setDismissed] = useState<ReadonlySet<string>>(new Set());
  const dismiss = (key: string) => setDismissed((current) => new Set(current).add(key));
  /** The time the shift rows and offers are worked out at, ticking each minute. */
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
  const celebration = useMilestoneCelebration(trips ? visible : null, deductions, region);
  // Tax offices want a purpose for every business drive: the one-tap choices, and the drives still missing one.
  const trackingHealth = useTrackingHealth();
  const trackingProblem = ['tracking-stopped', 'stale', 'precise-location-off'].includes(trackingHealth.health?.issue ?? '');
  const purposeChoices = useMemo(
    () =>
      quickPurposes({
        usual: purposeSettings.usual,
        chosen: purposeSettings.chosen,
        recent: frequentPurposes(trips ?? []),
        shiftMode: purposeSettings.shiftMode,
        clientPrivacy: purposeSettings.clientPrivacy,
      }),
    [trips, purposeSettings.usual, purposeSettings.chosen, purposeSettings.shiftMode, purposeSettings.clientPrivacy],
  );
  // Drives past the free allowance are left out, as in the report's count: their value isn't claimed yet.
  const needPurpose = useMemo(
    () => visible.filter((trip) => needsPurpose(trip) && taxYearOf(trip.localDate, region) === (filling ?? taxYear)),
    [visible, region, taxYear, filling],
  );
  // For the quick opening next time: this tax year's total, counted up from what was last seen.
  const launchTotal = money.yearTotal;
  useEffect(() => {
    if (trips && onboarded && !DEMO_MODE) rememberTotal(launchTotal).catch(() => {});
  }, [trips, onboarded, launchTotal]);

  const placeAsk = usePlaceAsk(trips, places, now, reload);

  // First launch goes through the welcome flow before anything else is shown.
  if (!loaded) return <ActivityIndicator style={styles.loading} />;
  if (!onboarded) return <Redirect href="/welcome" />;
  if (!trips) return <ActivityIndicator style={styles.loading} />;

  // "Worth up to" on unsorted rows: the year's business distance added up once, not once per row.
  const potentialOf = potentialDeductions(visible, region);

  // The shift is the row: a shift's drives are one row that opens to them.
  // Selecting works on drives, so it lists them one by one as before.
  const items: HomeItem[] = selecting
    ? trips.map((trip) => ({ kind: 'trip', trip }))
    : filling !== null
      ? needPurpose.map((trip) => ({ kind: 'trip', trip }))
      : homeItems(trips, shiftMode.shifts, list.expanded);
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

  // Drives past the free allowance can be sorted too (sorting one personal frees a slot).
  const unsorted = trips.filter((trip) => trip.classification === 'unclassified');

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: () => <BrandTitle />,
          headerLeft: () => <MenuButton />,
        }}
      />
      <FlatList
        data={items}
        keyExtractor={itemKey}
        // Room for the bulk actions bar while selecting.
        contentContainerStyle={[styles.list, { paddingBottom: (selecting ? 160 : 96) + insets.bottom }]}
        ListHeaderComponent={
          <View style={styles.header}>
            {/* Couriers: the shift comes first, it's what they tap every day. */}
            {shiftMode.enabled && (
              <ShiftBar
                shift={shiftMode.shift}
                paused={shiftMode.pause !== null}
                onTogglePause={() => shiftMode.togglePause().catch(() => {})}
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
            {liveDrive && <LiveDriveBanner drive={liveDrive} />}
            {/* Tracking that stopped, or a drive it lost: never silent. */}
            <TrackingHealthCard state={trackingHealth} />
            <SummaryCard summary={summary} commuteCents={money.commuteCents} relief={relief} />
            {nudge && <ReliefNudge nudge={nudge} />}
            <TrackingCard status={status} working={!trackingProblem} />
            {/* Home and work, asked once the drives show where they are (not at set-up). */}
            {placeAsk.ask && !selecting && filling === null && (
              <PlaceAskCard
                ask={placeAsk.ask}
                onYes={() => placeAsk.confirm().catch(() => {})}
                onNo={() => placeAsk.decline().catch(() => {})}
              />
            )}
            <TaxCountdown
              foundMinor={launchTotal}
              unsortedCount={unsorted.length}
              onSortUnsorted={() => {
                setFilling(null);
                setSelecting(true);
                setSelected(new Set(unsorted.map((trip) => trip.id)));
              }}
            />
            {filling === null && needPurpose.length > 0 && (
              <PurposeNudge count={needPurpose.length} onFill={() => setFilling(taxYear)} />
            )}
            {/* Australia: past 5,000 km in a car, the logbook method usually claims more. */}
            <LogbookNudge trips={visible} vehicles={garage.vehicles} />
            {visible.length > 0 && <ReminderAsk />}
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
            {!isPro && <PlanCard trips={trips} locked={locked} />}
            {filling !== null && <FillingBar count={needPurpose.length} onDone={() => setFilling(null)} />}
            {visible.length > 0 && filling === null && (
              <SelectBar
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
          filling !== null ? null : (
            <View style={styles.empty}>
              <LeafMark size={72} />
              <ThemedText type="smallBold">{status === 'on' ? t('Ready when you are') : t('No drives yet')}</ThemedText>
              <HomeEmptyLines trackingOn={status === 'on'} style={styles.emptyBody} />
            </View>
          )
        }
        renderItem={({ item: row }) => {
          if (row.kind === 'shift') {
            return (
              <ShiftRow
                group={row.group}
                valueMinor={row.group.legs.reduce((sum, trip) => sum + (deductions.get(trip.id) ?? 0), 0)}
                region={region}
                expanded={row.expanded}
                now={now}
                onToggle={() => list.toggleShift(row.group.shiftId)}
                onEditTimes={(changes) => shiftMode.editTimes(row.group.shiftId, changes).catch(() => {})}
              />
            );
          }
          const item = row.trip;
          const content = selecting ? (
            <SelectableTripRow trip={item} selected={selected.has(item.id)} onToggle={() => toggle(item)} />
          ) : locked.has(item.id) ? (
            <LockedTripRow
              trip={item}
              onClassify={(c) => sort([item], c)}
              onLongPress={() => list.confirmDelete(item)}
            />
          ) : (
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
              onPurpose={(purpose) => setPurpose(item, purpose).catch(() => {})}
            />
          );
          // A shift's drives, under its row while it's open.
          return row.kind === 'leg' ? (
            <View style={[styles.leg, { borderLeftColor: theme.accent }]}>{content}</View>
          ) : (
            content
          );
        }}
      />
      {!selecting && <AddTripButton bottom={insets.bottom} />}
      {list.waiting && <ValueWaitsNotice bottom={insets.bottom} onClose={list.closeWaiting} />}
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

function BrandTitle() {
  const theme = useTheme();
  return (
    <View style={styles.brand} accessibilityRole="header" accessibilityLabel="MileMint">
      <Text style={[styles.brandText, { color: theme.text }]}>
        Mile<Text style={{ color: theme.accent }}>Mint</Text>
      </Text>
    </View>
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
  brand: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  brandText: { fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
  vehicleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: Spacing.one + 2,
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one + 2,
  },
  leg: { marginLeft: Spacing.three, paddingLeft: Spacing.two, borderLeftWidth: 2, marginTop: -Spacing.two },
  header: { gap: Spacing.three },
});
