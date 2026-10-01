import { type Href, Redirect, router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ReanimatedSwipeable, {
  SwipeDirection,
  type SwipeableMethods,
} from 'react-native-gesture-handler/ReanimatedSwipeable';

import { useAutoBackup } from '@/backup/use-backup';
import { AddTripButton, MenuButton } from '@/components/header-menu';
import { BrandGradient } from '@/components/brand-gradient';
import { LeafMark } from '@/components/leaf-mark';
import { LogbookNudge } from '@/components/logbook-nudge';
import { PlanSheet } from '@/components/plan-rules';
import { Celebration } from '@/components/celebration';
import { ReminderAsk } from '@/components/reminder-ask';
import { purposeIcon, quickPurposes, shownPurpose } from '@/components/purpose-picker';
import { BackdateOffer, EndShiftPrompt, UndoEndBar } from '@/components/shift-prompts';
import { shortTime, ShiftRow } from '@/components/shift-row';
import { ShiftSwitch } from '@/components/shift-switch';
import { TaxCountdown } from '@/components/tax-countdown';
import { TrackingHealthCard } from '@/components/tracking-health-card';
import { Segmented } from '@/components/segmented';
import { VehicleSheet } from '@/components/vehicle-sheet';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import type { Shift } from '@/db/shifts-repo';
import { useTrips } from '@/db/use-trips';
import { DEMO_MODE } from '@/dev/demo';
import { shiftCheer } from '@/domain/cheers';
import { isCommute, type AutoReason } from '@/domain/classify-rules';
import { employerPaysLess, marForYear, marSummary, type MarYear, unclaimedNudge, type UnclaimedNudge } from '@/domain/mar';
import { autoDrivesInMonth, lockedTripIds } from '@/domain/plan';
import type { Place } from '@/domain/places';
import { homeItems, itemKey, offShiftKind, type HomeItem } from '@/domain/shift-rows';
import { backdateStart } from '@/domain/shift-split';
import { shownLabel } from '@/domain/privacy';
import { frequentPurposes } from '@/domain/suggestions';
import {
  computeDeductions,
  displayLocale,
  currentTaxYear,
  formatDistance,
  formatLongDate,
  formatMoney,
  potentialDeductions,
  summarizeTaxYear,
  taxYearOf,
  type Region,
  type TaxYearSummary,
} from '@/domain/regions';
import { type Classification, toLocalIsoDate, type Trip, VEHICLE_ICONS } from '@/domain/trip';
import { useMileagePay } from '@/hooks/use-mileage-pay';
import { usePurposeSettings } from '@/hooks/use-purpose-settings';
import { useTheme } from '@/hooks/use-theme';
import { getLanguage, msg, useT } from '@/i18n/i18n';
import { usePro } from '@/purchases/pro';
import { useAllowance, useReferral } from '@/referral/referral';
import { useRegion } from '@/region/region';
import { rememberTotal } from '@/region/remembered-region';
import { useReminders } from '@/reminders/use-reminders';
import type { TrackingStatus } from '@/tracking/background';
import { useShift } from '@/tracking/use-shift';
import { type LiveDrive, useLiveDrive } from '@/tracking/use-live-drive';
import { useTracking } from '@/tracking/use-tracking';
import { useVehicles } from '@/vehicles/use-vehicles';
import { useMilestoneCelebration } from '@/milestones/use-milestones';

const CLASSIFY_OPTIONS = [
  { value: 'business', label: msg('Business') },
  { value: 'personal', label: msg('Personal') },
] as const satisfies readonly { value: Classification; label: string }[];

const AUTO_NOTES: Record<AutoReason, string> = {
  'learned-route': msg('Auto: usual route'),
  'work-hours': msg('Auto: work hours'),
  commute: msg('Auto: commute'),
  default: msg('Auto: business by default · swipe left if personal'),
};

/** How far a row must be dragged before letting go classifies it. */
const SWIPE_THRESHOLD = 80;

export default function HomeScreen() {
  const { trips, places, classify, classifyMany, setPurpose, remove, reload } = useTrips();
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
  // Bulk sort: pick several trips, then mark them all at once.
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const { status } = useTracking(reload);
  const { isPro } = usePro();
  const allowance = useAllowance();
  const { region, loaded, onboarded } = useRegion();
  const taxYear = currentTaxYear(region);
  // Opened from the report: show its year's drives without a purpose (once per visit).
  if (fillAsked !== fillSeen) {
    setFillSeen(fillAsked);
    if (fillAsked !== null) setFilling(Number.isInteger(Number(fillAsked)) && fillAsked ? Number(fillAsked) : taxYear);
  }
  useReminders(region);
  // Encrypted copy in the user's own iCloud, so a lost phone doesn't take the log with it.
  useAutoBackup(onboarded && !DEMO_MODE);
  const shiftMode = useShift(reload);
  /** Shift rows opened to show their drives. */
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(new Set());
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
  const locked = useMemo(() => lockedTripIds(trips ?? [], isPro, allowance), [trips, isPro, allowance]);
  /** Drives just sorted back from personal: if the month's free drives are used, their value waits (domain/plan). */
  const [rejoined, setRejoined] = useState<readonly string[] | null>(null);
  const rejoinedTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  // Drives past the free allowance are listed in full, but their value isn't in any total until Pro.
  const visible = useMemo(() => (trips ?? []).filter((trip) => !locked.has(trip.id)), [trips, locked]);
  const deductions = useMemo(() => computeDeductions(visible, region), [visible, region]);
  const shiftTrips = useMemo(
    () => (shiftMode.shift ? (trips ?? []).filter((trip) => trip.shiftId === shiftMode.shift?.id) : []),
    [trips, shiftMode.shift],
  );
  const summary = useMemo(
    () => summarizeTaxYear(visible, region, taxYear, deductions),
    [visible, region, taxYear, deductions],
  );
  const celebration = useMilestoneCelebration(trips ? visible : null, deductions, region);
  // Tax offices want a purpose for every business drive: the one-tap choices, and the drives still missing one.
  const purposeChoices = useMemo(
    () =>
      quickPurposes({
        usual: purposeSettings.usual,
        recent: frequentPurposes(trips ?? []),
        shiftMode: purposeSettings.shiftMode,
        clientPrivacy: purposeSettings.clientPrivacy,
      }),
    [trips, purposeSettings.usual, purposeSettings.shiftMode, purposeSettings.clientPrivacy],
  );
  // Drives past the free allowance are left out, as in the report's count: their value isn't claimed yet.
  const needPurpose = useMemo(
    () => visible.filter((trip) => needsPurpose(trip) && taxYearOf(trip.localDate, region) === (filling ?? taxYear)),
    [visible, region, taxYear, filling],
  );
  // UK employees don't deduct mileage: they claim Mileage Allowance Relief on what the employer didn't pay.
  const { pay } = useMileagePay();
  const employee = pay?.employee ?? false;
  const employerRate = pay?.employerRate ?? 0;
  const band = pay?.band ?? 'unsure';
  const claimedYears = pay?.claimedYears;
  const relief = useMemo(
    () => (employee ? marForYear(visible, region, taxYear, { employerRate, band }, deductions) : null),
    [employee, visible, region, taxYear, employerRate, band, deductions],
  );
  const nudge = useMemo(() => {
    if (!employee || !claimedYears) return null;
    return unclaimedNudge(marSummary(visible, region, { employerRate, band }, new Date(), deductions), region, claimedYears);
  }, [employee, claimedYears, visible, region, employerRate, band, deductions]);
  // For the quick opening next time: this tax year's total, counted up from what was last seen.
  const launchTotal = relief ? relief.relief : summary.deduction;
  useEffect(() => {
    if (trips && onboarded && !DEMO_MODE) rememberTotal(launchTotal).catch(() => {});
  }, [trips, onboarded, launchTotal]);

  // Home ↔ work drives the user marked business anyway. Kept in the total (a
  // home office can make them deductible), but called out so they get a second look.
  const commuteCents = useMemo(() => {
    const kind = (id: string | null) => places.find((place) => place.id === id)?.kind ?? null;
    return visible
      .filter(
        (trip) =>
          taxYearOf(trip.localDate, region) === taxYear &&
          trip.classification === 'business' &&
          isCommute(kind(trip.startPlaceId), kind(trip.endPlaceId)),
      )
      .reduce((sum, trip) => sum + (deductions.get(trip.id) ?? 0), 0);
  }, [visible, places, region, taxYear, deductions]);

  // First launch goes through the welcome flow before anything else is shown.
  if (!loaded) return <ActivityIndicator style={styles.loading} />;
  if (!onboarded) return <Redirect href="/welcome" />;
  if (!trips) return <ActivityIndicator style={styles.loading} />;

  const kindOf = (id: string | null) => places.find((place: Place) => place.id === id)?.kind ?? null;
  // "Worth up to" on unsorted rows: the year's business distance added up once, not once per row.
  const potentialOf = potentialDeductions(visible, region);

  // The shift is the row: a shift's drives are one row that opens to them.
  // Selecting works on drives, so it lists them one by one as before.
  const items: HomeItem[] = selecting
    ? trips.map((trip) => ({ kind: 'trip', trip }))
    : filling !== null
      ? needPurpose.map((trip) => ({ kind: 'trip', trip }))
      : homeItems(trips, shiftMode.shifts, expanded);
  const toggleShift = (shiftId: string) =>
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(shiftId)) next.delete(shiftId);
      else next.add(shiftId);
      return next;
    });
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
  const stopSelecting = () => {
    setSelecting(false);
    setSelected(new Set());
  };
  const toggle = (trip: Trip) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(trip.id)) next.delete(trip.id);
      else next.add(trip.id);
      return next;
    });
  /** Sorts trips, and says so if one sorted back from personal now has to wait for Pro. */
  const sort = async (many: readonly Trip[], classification: Classification) => {
    const back = many.filter((trip) => trip.classification === 'personal' && classification !== 'personal');
    await (many.length === 1 ? classify(many[0], classification) : classifyMany(many, classification));
    if (!isPro && back.length > 0) {
      setRejoined(back.map((trip) => trip.id));
      clearTimeout(rejoinedTimer.current);
      rejoinedTimer.current = setTimeout(() => setRejoined(null), 8000);
    }
  };
  const markSelected = async (classification: Classification) => {
    await sort(trips.filter((trip) => selected.has(trip.id)), classification);
    stopSelecting();
  };
  const waiting = rejoined?.some((id) => locked.has(id)) ?? false;

  const confirmDelete = (trip: Trip) =>
    Alert.alert(t('Delete trip?'), `${trip.startLabel} → ${trip.endLabel}`, [
      { text: t('Cancel'), style: 'cancel' },
      { text: t('Delete'), style: 'destructive', onPress: () => remove(trip) },
    ]);

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
            <TrackingHealthCard />
            <SummaryCard
              summary={summary}
              commuteCents={commuteCents}
              relief={relief && { year: relief, paysLess: employerPaysLess(relief, region, employerRate) }}
            />
            {nudge && <ReliefNudge nudge={nudge} />}
            <TrackingCard status={status} />
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
              <ThemedText type="small" themeColor="textSecondary" style={styles.emptyBody}>
                {status === 'on'
                  ? t('Just drive. Each trip appears here after you park, ready to swipe business or personal.')
                  : t('Turn on automatic tracking and your drives will appear here.')}
              </ThemedText>
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
                onToggle={() => toggleShift(row.group.shiftId)}
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
              onLongPress={() => confirmDelete(item)}
            />
          ) : (
            <TripRow
              trip={item}
              deduction={deductions.get(item.id) ?? 0}
              potential={item.classification === 'unclassified' ? potentialOf(item) : 0}
              commute={isCommute(kindOf(item.startPlaceId), kindOf(item.endPlaceId))}
              offShift={offShiftKind(item, shiftMode.shifts)}
              onClassify={(c) => sort([item], c)}
              onLongPress={() => confirmDelete(item)}
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
      {waiting && <ValueWaitsNotice bottom={insets.bottom} onClose={() => setRejoined(null)} />}
      <Celebration content={celebration.content} onClose={celebration.close} />
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

/** "Select" above the list; while selecting, quick picks and Cancel. */
function SelectBar({
  selecting,
  unsortedCount,
  onStart,
  onSelectUnsorted,
  onCancel,
}: {
  selecting: boolean;
  unsortedCount: number;
  onStart: () => void;
  onSelectUnsorted: () => void;
  onCancel: () => void;
}) {
  const theme = useTheme();
  const t = useT();
  return (
    <View style={styles.selectBar}>
      <ThemedText type="smallBold" themeColor="textSecondary">
        {t('Trips')}
      </ThemedText>
      <View style={styles.selectActions}>
        {selecting && unsortedCount > 0 && (
          <Pressable accessibilityRole="button" hitSlop={8} onPress={onSelectUnsorted}>
            <ThemedText type="small" style={{ color: theme.accent }}>
              {t('Select {{count}} unsorted', { count: unsortedCount })}
            </ThemedText>
          </Pressable>
        )}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={selecting ? t('Stop selecting trips') : t('Select several trips to sort at once')}
          hitSlop={8}
          onPress={selecting ? onCancel : onStart}>
          <ThemedText type="smallBold" style={{ color: theme.accent }}>
            {selecting ? t('Cancel') : t('Select')}
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

/** A trip row in select mode: tap to tick it; no swiping or opening. */
function SelectableTripRow({
  trip,
  selected,
  onToggle,
}: {
  trip: Trip;
  selected: boolean;
  onToggle: () => void;
}) {
  const theme = useTheme();
  const t = useT();
  const { region } = useRegion();
  const status =
    trip.classification === 'unclassified'
      ? t('Not sorted')
      : trip.classification === 'business'
        ? t('Business')
        : t('Personal');
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={t('{{from}} to {{to}}, {{date}}, {{status}}', {
        from: trip.startLabel,
        to: trip.endLabel,
        date: trip.localDate,
        status,
      })}
      onPress={onToggle}>
      <ThemedView
        type="backgroundElement"
        style={[styles.row, styles.selectableRow, selected && { borderColor: theme.accent }]}>
        <View
          style={[
            styles.check,
            { borderColor: selected ? theme.accent : theme.textSecondary },
            selected && { backgroundColor: theme.accent },
          ]}>
          {selected && (
            <ThemedText type="smallBold" style={{ color: theme.onAccent }}>
              ✓
            </ThemedText>
          )}
        </View>
        <View style={styles.flex}>
          <View style={styles.rowHeader}>
            <ThemedText type="smallBold" style={styles.route} numberOfLines={1}>
              {shownLabel(trip.startLabel, t)} → {shownLabel(trip.endLabel, t)}
            </ThemedText>
            <ThemedText type="smallBold">{formatDistance(trip.distanceMeters, region)}</ThemedText>
          </View>
          <ThemedText type="small" themeColor="textSecondary">
            {trip.localDate} · {status}
          </ThemedText>
        </View>
      </ThemedView>
    </Pressable>
  );
}

/** Pinned to the bottom while selecting. */
function BulkActions({
  count,
  bottom,
  onBusiness,
  onPersonal,
}: {
  count: number;
  bottom: number;
  onBusiness: () => void;
  onPersonal: () => void;
}) {
  const theme = useTheme();
  const t = useT();
  const disabled = count === 0;
  return (
    <ThemedView
      type="backgroundElement"
      style={[styles.bulkBar, { paddingBottom: Spacing.three + bottom, borderTopColor: theme.backgroundSelected }]}>
      <ThemedText type="small" themeColor="textSecondary" style={styles.bulkCount}>
        {count === 0 ? t('Tap trips to select them') : t('{{count}} selected', { count })}
      </ThemedText>
      <View style={styles.bulkButtons}>
        <Pressable
          accessibilityRole="button"
          disabled={disabled}
          onPress={onBusiness}
          style={[styles.bulkButton, { backgroundColor: theme.accent, opacity: disabled ? 0.5 : 1 }]}>
          <ThemedText type="smallBold" style={{ color: theme.onAccent }}>
            {t('Business')}
          </ThemedText>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          disabled={disabled}
          onPress={onPersonal}
          style={[styles.bulkButton, { backgroundColor: theme.backgroundSelected, opacity: disabled ? 0.5 : 1 }]}>
          <ThemedText type="smallBold">{t('Personal')}</ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

function SummaryCard({
  summary,
  commuteCents,
  relief,
}: {
  summary: TaxYearSummary;
  commuteCents: number;
  /** UK employees: this tax year's Mileage Allowance Relief instead of a deduction. */
  relief: { year: MarYear; paysLess: boolean } | null;
}) {
  const t = useT();
  const { region } = useRegion();
  const total = formatMoney(summary.deduction, region);
  const distance = formatDistance(summary.businessMeters, region);
  if (relief) return <EmployeeSummaryCard summary={summary} year={relief.year} paysLess={relief.paysLess} />;
  return (
    <View style={styles.card}>
      {/* The app icon's gradient, with the leaf growing out of the corner. */}
      <BrandGradient />
      <View style={styles.watermark} pointerEvents="none">
        <LeafMark size={190} opacity={0.22} />
      </View>
      <Text style={styles.heroLabel}>
        {summary.label.length > 4
          ? t('Deductions found in {{year}} tax year', { year: summary.label })
          : t('Deductions found in {{year}}', { year: summary.label })}
      </Text>
      <Text style={styles.heroTotal} accessibilityLabel={t('{{amount}} found', { amount: total })}>
        {total}
      </Text>
      <Text style={styles.heroLabel}>
        {summary.unclassifiedCount > 0
          ? t('{{distance}} business · {{count}} to review', { distance, count: summary.unclassifiedCount })
          : t('{{distance}} business', { distance })}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('Reports: export your mileage log')}
        hitSlop={8}
        onPress={() => router.push('/report')}
        style={styles.reportLink}>
        <Text style={styles.reportLinkText}>{t('Export report')}</Text>
      </Pressable>
      {commuteCents > 0 && (
        <Text style={styles.heroWarning}>
          {t('Includes {{amount}} from home ↔ work commutes, which usually aren’t deductible.', {
            amount: formatMoney(commuteCents, region),
          })}
        </Text>
      )}
    </View>
  );
}

/**
 * The hero card for UK employees: relief to claim when the employer pays less
 * than HMRC's rate, otherwise the business mileage for their expense claims.
 */
function EmployeeSummaryCard({ summary, year, paysLess }: { summary: TaxYearSummary; year: MarYear; paysLess: boolean }) {
  const t = useT();
  const { region } = useRegion();
  const distance = formatDistance(summary.businessMeters, region);
  const total = formatMoney(year.relief, region);
  return (
    <View style={styles.card}>
      <BrandGradient />
      <View style={styles.watermark} pointerEvents="none">
        <LeafMark size={190} opacity={0.22} />
      </View>
      {paysLess ? (
        <>
          <Text style={styles.heroLabel}>
            {t('Mileage Allowance Relief to claim, {{year}} tax year', { year: summary.label })}
          </Text>
          <Text style={styles.heroTotal} accessibilityLabel={t('{{amount}} relief to claim', { amount: total })}>
            {total}
          </Text>
          <Text style={styles.heroLabel}>
            {t('About {{amount}} tax back', { amount: formatMoney(year.taxBack, region) })}
          </Text>
        </>
      ) : (
        <>
          <Text style={styles.heroLabel}>{t('Mileage logged for your expense claims')}</Text>
          <Text style={styles.heroTotal} adjustsFontSizeToFit numberOfLines={1}>
            {distance}
          </Text>
          <Text style={styles.heroLabel}>{t('{{year}} tax year', { year: summary.label })}</Text>
        </>
      )}
      <Text style={styles.heroLabel}>
        {summary.unclassifiedCount > 0
          ? t('{{distance}} business · {{count}} to review', { distance, count: summary.unclassifiedCount })
          : t('{{distance}} business', { distance })}
      </Text>
      <View style={styles.heroButtons}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('Reports: export your mileage log')}
          hitSlop={8}
          onPress={() => router.push('/report')}
          style={styles.reportLink}>
          <Text style={styles.reportLinkText}>{t('Export report')}</Text>
        </Pressable>
        {paysLess && (
          <Pressable
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => router.push('/claim-relief' as Href)}
            style={styles.reportLink}>
            <Text style={styles.reportLinkText}>{t('How to claim')}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

/** Relief left in an earlier tax year, before its 4-year window closes. */
function ReliefNudge({ nudge }: { nudge: UnclaimedNudge }) {
  const theme = useTheme();
  const t = useT();
  const { region } = useRegion();
  const params = {
    amount: formatMoney(nudge.oldest.relief, region),
    year: nudge.oldest.label,
    date: formatLongDate(nudge.oldest.claimBy, region),
  };
  return (
    <Pressable accessibilityRole="button" onPress={() => router.push('/claim-relief' as Href)}>
      <ThemedView type="backgroundElement" style={[styles.trackingCard, { borderColor: '#CA8A04' }]}>
        <ThemedText type="smallBold">{t('{{amount}} relief unclaimed from {{year}}', params)}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {nudge.yearCount > 1
            ? t('Claim it before {{date}}. {{total}} unclaimed across {{count}} earlier tax years.', {
                date: params.date,
                total: formatMoney(nudge.totalRelief, region),
                count: nudge.yearCount,
              })
            : t('Claim it before {{date}}.', { date: params.date })}
        </ThemedText>
        <ThemedText type="smallBold" style={{ color: theme.accent }}>
          {t('See how to claim ›')}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

function TripRow({
  trip,
  deduction,
  potential,
  commute,
  offShift = null,
  onClassify,
  onLongPress,
  usualPurpose,
  purposeChoices,
  onPurpose,
}: {
  trip: Trip;
  deduction: number;
  /** Filled in for business drives with none; a trip still showing it is marked to check. */
  usualPurpose: string | null;
  /** One-tap purposes for a business drive without one, most likely first. */
  purposeChoices: readonly string[];
  onPurpose: (purpose: string) => void;
  /** Cut off a shift: the part after it ended (the drive home), or in a pause. */
  offShift?: 'after' | 'pause' | null;
  /** What the trip would be worth as business: the nudge to classify it. */
  potential: number;
  /** Home ↔ work: shown with a warning if marked business. */
  commute: boolean;
  onClassify: (classification: Classification) => void;
  onLongPress: () => void;
}) {
  const theme = useTheme();
  const t = useT();
  const { region } = useRegion();
  const swipeable = useRef<SwipeableMethods>(null);
  const unclassified = trip.classification === 'unclassified';
  const business = trip.classification === 'business';
  const details = [
    trip.localDate,
    trip.source === 'auto' ? formatTime(trip.startedAt, region) : t('Added manually'),
    shownPurpose(trip.purpose, t),
    deduction > 0 ? formatMoney(deduction, region) : '',
  ].filter(Boolean);
  const openDetails = () => router.push({ pathname: '/trip/[id]', params: { id: trip.id } });
  // Filled in by the app with the usual purpose and not checked since: said quietly, so it can be.
  const filledWithUsual =
    !!trip.purposeFilled &&
    !trip.shiftId &&
    usualPurpose !== null &&
    trip.purpose.trim().toLowerCase() === usualPurpose.trim().toLowerCase();

  // Swipe right = Business, left = Personal. The buttons below stay for
  // VoiceOver and anyone who doesn't discover the gesture.
  return (
    <ReanimatedSwipeable
      ref={swipeable}
      friction={2}
      leftThreshold={SWIPE_THRESHOLD}
      rightThreshold={SWIPE_THRESHOLD}
      renderLeftActions={() => (
        <SwipeAction label={t('Business')} color={theme.accent} textColor={theme.onAccent} side="left" />
      )}
      renderRightActions={() => (
        <SwipeAction
          label={t('Personal')}
          color={theme.backgroundSelected}
          textColor={theme.text}
          side="right"
        />
      )}
      onSwipeableOpen={(direction) => {
        swipeable.current?.close();
        onClassify(direction === SwipeDirection.RIGHT ? 'business' : 'personal');
      }}>
      <Pressable
        onPress={openDetails}
        onLongPress={onLongPress}
        accessibilityHint={t('Opens trip details. Long press to delete')}>
        <ThemedView type="backgroundElement" style={styles.row}>
          <View style={styles.rowHeader}>
            <ThemedText type="smallBold" style={styles.route} numberOfLines={1}>
              {shownLabel(trip.startLabel, t)} → {shownLabel(trip.endLabel, t)}
            </ThemedText>
            <ThemedText type="smallBold">{formatDistance(trip.distanceMeters, region)}</ThemedText>
          </View>
          <ThemedText type="small" themeColor="textSecondary">
            {details.join(' · ')}
          </ThemedText>
          {trip.autoReason && (
            <ThemedText type="small" themeColor="textSecondary">
              {trip.shiftId
                ? t('Auto: on shift')
                : trip.autoReason === 'work-hours'
                  ? trip.classification === 'business'
                    ? t('Auto: in your work hours')
                    : t('Auto: outside your work hours · swipe right if it was work')
                  : t(AUTO_NOTES[trip.autoReason])}
            </ThemedText>
          )}
          {offShift && (
            <ThemedText type="small" themeColor="textSecondary">
              {offShift === 'after'
                ? t('After your shift ended · not counted as work unless you say so')
                : t('During a pause in your shift · not counted as work unless you say so')}
            </ThemedText>
          )}
          {business && commute && (
            <ThemedText type="small" themeColor="danger">
              {t('Commute between home and work isn’t deductible.')}
            </ThemedText>
          )}
          {unclassified && (
            <ThemedText type="smallBold" style={{ color: theme.accent }}>
              {potential > 0
                ? t('Business or personal? Worth {{amount}} if business.', { amount: formatMoney(potential, region) })
                : t('Business or personal?')}
            </ThemedText>
          )}
          {business && filledWithUsual && (
            <Pressable
              accessibilityRole="button"
              accessibilityHint={t('Opens trip details')}
              onPress={openDetails}
              hitSlop={8}
              style={styles.savedLine}>
              <ThemedText type="small" themeColor="textSecondary">
                {t('Usual purpose · tap to change')}
              </ThemedText>
            </Pressable>
          )}
          {needsPurpose(trip) && <PurposeNeeded choices={purposeChoices} onPick={onPurpose} onOther={openDetails} />}
          <Segmented
            options={CLASSIFY_OPTIONS.map((option) => ({ ...option, label: t(option.label) }))}
            value={unclassified ? null : trip.classification}
            onChange={onClassify}
            accessibilityLabelFor={(option) =>
              option.value === 'business'
                ? t('Mark {{from}} to {{to}} as business', { from: trip.startLabel, to: trip.endLabel })
                : t('Mark {{from}} to {{to}} as personal', { from: trip.startLabel, to: trip.endLabel })
            }
          />
        </ThemedView>
      </Pressable>
    </ReanimatedSwipeable>
  );
}

/** A business drive with no purpose (the report counts the same, see domain/report). */
function needsPurpose(trip: Trip): boolean {
  return trip.classification === 'business' && !trip.purpose.trim();
}

/**
 * Under a business drive with no purpose: hard to miss, and one tap to fix.
 * Tax offices (HMRC, the IRS, CRA, ATO) want a purpose for every business
 * drive. "Other…" opens the trip, with the full purpose list.
 */
function PurposeNeeded({
  choices,
  onPick,
  onOther,
}: {
  choices: readonly string[];
  onPick: (purpose: string) => void;
  onOther: () => void;
}) {
  const theme = useTheme();
  const t = useT();
  const chip = ({ pressed }: { pressed: boolean }) => [
    styles.purposeChip,
    { backgroundColor: pressed ? theme.backgroundSelected : theme.background, borderColor: theme.warning },
  ];
  return (
    <View style={[styles.purposeNeeded, { borderColor: theme.warning, backgroundColor: theme.warning + '1A' }]}>
      <ThemedText type="smallBold">⚠️ {t('Purpose needed for your tax records')}</ThemedText>
      <View style={styles.purposeChips}>
        {choices.map((purpose) => (
          <Pressable
            key={purpose}
            accessibilityRole="button"
            accessibilityLabel={t('Business purpose: {{purpose}}', { purpose: shownPurpose(purpose, t) })}
            onPress={() => onPick(purpose)}
            style={chip}>
            <ThemedText type="smallBold" numberOfLines={1}>
              {purposeIcon(purpose)} {shownPurpose(purpose, t)}
            </ThemedText>
          </Pressable>
        ))}
        <Pressable accessibilityRole="button" accessibilityHint={t('Opens trip details')} onPress={onOther} style={chip}>
          <ThemedText type="smallBold" style={{ color: theme.accent }}>
            {t('Other…')}
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

/** On home while this tax year has work drives without a purpose; opens them one after another. */
function PurposeNudge({ count, onFill }: { count: number; onFill: () => void }) {
  const theme = useTheme();
  const t = useT();
  const { region } = useRegion();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint={t('Shows only the drives that need a purpose')}
      onPress={onFill}>
      <ThemedView type="backgroundElement" style={[styles.purposeNudge, { borderColor: theme.warning }]}>
        <ThemedText type="smallBold">{t('{{count}} work drives need a purpose', { count })}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {t('{{authority}} expects a purpose for every business drive. One tap each.', {
            authority: region.authority,
          })}
        </ThemedText>
        <ThemedText type="smallBold" style={{ color: theme.accent }}>
          {t('Add purposes ›')}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

/** Above the list while filling in purposes: how many are left, and the way back to all drives. */
function FillingBar({ count, onDone }: { count: number; onDone: () => void }) {
  const theme = useTheme();
  const t = useT();
  return (
    <View style={styles.selectBar}>
      <ThemedText type="smallBold" style={styles.flex}>
        {count > 0 ? t('{{count}} work drives need a purpose', { count }) : t('Every work drive has a purpose ✓')}
      </ThemedText>
      <Pressable accessibilityRole="button" hitSlop={8} onPress={onDone}>
        <ThemedText type="smallBold" style={{ color: theme.accent }}>
          {count > 0 ? t('Show all drives') : t('Done')}
        </ThemedText>
      </Pressable>
    </View>
  );
}

/**
 * A drive past the free plan's monthly allowance: saved and shown in full
 * (route, distance, time, purpose) and sortable like any other. Only its
 * value waits for Pro, and the row says so instead of hiding anything.
 */
function LockedTripRow({
  trip,
  onClassify,
  onLongPress,
}: {
  trip: Trip;
  onClassify: (classification: Classification) => void;
  onLongPress: () => void;
}) {
  const theme = useTheme();
  const t = useT();
  const { region } = useRegion();
  const swipeable = useRef<SwipeableMethods>(null);
  const unclassified = trip.classification === 'unclassified';
  const details = [trip.localDate, formatTime(trip.startedAt, region), shownPurpose(trip.purpose, t)].filter(Boolean);
  const openDetails = () => router.push({ pathname: '/trip/[id]', params: { id: trip.id } });
  return (
    <ReanimatedSwipeable
      ref={swipeable}
      friction={2}
      leftThreshold={SWIPE_THRESHOLD}
      rightThreshold={SWIPE_THRESHOLD}
      renderLeftActions={() => (
        <SwipeAction label={t('Business')} color={theme.accent} textColor={theme.onAccent} side="left" />
      )}
      renderRightActions={() => (
        <SwipeAction label={t('Personal')} color={theme.backgroundSelected} textColor={theme.text} side="right" />
      )}
      onSwipeableOpen={(direction) => {
        swipeable.current?.close();
        onClassify(direction === SwipeDirection.RIGHT ? 'business' : 'personal');
      }}>
      <Pressable
        onPress={openDetails}
        onLongPress={onLongPress}
        accessibilityHint={t('Opens trip details. Long press to delete')}>
        <ThemedView type="backgroundElement" style={styles.row}>
          <View style={styles.rowHeader}>
            <ThemedText type="smallBold" style={styles.route} numberOfLines={1}>
              {shownLabel(trip.startLabel, t)} → {shownLabel(trip.endLabel, t)}
            </ThemedText>
            <ThemedText type="smallBold">{formatDistance(trip.distanceMeters, region)}</ThemedText>
          </View>
          <ThemedText type="small" themeColor="textSecondary">
            {details.join(' · ')}
          </ThemedText>
          <Pressable
            accessibilityRole="button"
            accessibilityHint={t('Opens MileMint Pro')}
            hitSlop={8}
            onPress={() => router.push('/pro')}
            style={styles.savedLine}>
            <ThemedText type="smallBold" style={{ color: theme.accent }}>
              🔒 {t('Saved · value unlocks with Pro')}
            </ThemedText>
          </Pressable>
          {unclassified && (
            <ThemedText type="small" themeColor="textSecondary">
              {t('Business or personal? Personal drives don’t use your free drives.')}
            </ThemedText>
          )}
          <Segmented
            options={CLASSIFY_OPTIONS.map((option) => ({ ...option, label: t(option.label) }))}
            value={unclassified ? null : trip.classification}
            onChange={onClassify}
            accessibilityLabelFor={(option) =>
              option.value === 'business'
                ? t('Mark {{from}} to {{to}} as business', { from: trip.startLabel, to: trip.endLabel })
                : t('Mark {{from}} to {{to}} as personal', { from: trip.startLabel, to: trip.endLabel })
            }
          />
        </ThemedView>
      </Pressable>
    </ReanimatedSwipeable>
  );
}

/**
 * Said when a drive sorted back from personal has to wait for Pro because the
 * month's free drives are used: the one case where a drive the user touches
 * doesn't show its value (domain/plan explains why it's this drive and not
 * one already showing its value).
 */
function ValueWaitsNotice({ bottom, onClose }: { bottom: number; onClose: () => void }) {
  const theme = useTheme();
  const t = useT();
  return (
    <Pressable
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      accessibilityHint={t('Closes this message')}
      onPress={onClose}
      style={[styles.notice, { bottom: bottom + 96, backgroundColor: theme.text }]}>
      <Text style={[styles.noticeText, { color: theme.background }]}>
        {t(
          'Saved. This month’s free drives are used, so a drive sorted back from personal waits for Pro to show its value. Drives already showing their value keep it.',
        )}
      </Text>
    </Pressable>
  );
}

/** Free plan meter: how much of this month's allowance is used, shown from the first drive. */
function PlanCard({ trips, locked }: { trips: readonly Trip[]; locked: ReadonlySet<string> }) {
  const theme = useTheme();
  const t = useT();
  const { region } = useRegion();
  // 40 a month, plus 10 for joining with a friend's code and 10 for each friend who joined with yours.
  const limit = useAllowance();
  const { counting, canRedeem } = useReferral();
  const [explaining, setExplaining] = useState(false);
  const now = new Date();
  const thisMonth = toLocalIsoDate(now).slice(0, 7);
  const used = Math.min(autoDrivesInMonth(trips, thisMonth), limit);
  // This month's drives whose value waits (earlier months' are counted on the Pro screen).
  const lockedCount = trips.filter((trip) => locked.has(trip.id) && trip.localDate.startsWith(thisMonth)).length;
  const month = now.toLocaleDateString(displayLocale(region), { month: 'long' });
  const full = used >= limit;
  return (
    // The card opens Pro; "What counts?" and the friend's-code link are their own buttons, not nested inside.
    <ThemedView
      type="backgroundElement"
      style={[styles.planCard, lockedCount > 0 && { borderColor: theme.accent, borderWidth: 1 }]}>
      <Pressable accessibilityRole="button" onPress={() => router.push('/pro')} style={styles.planMain}>
        <View style={styles.rowHeader}>
          <ThemedText type="smallBold" style={styles.route}>
            {t('{{used}} of {{limit}} free work drives in {{month}}', { used, limit, month })}
          </ThemedText>
          <View style={styles.goPro}>
            <Text style={styles.goProText}>★ {t('Go Pro')}</Text>
          </View>
        </View>
        <View style={[styles.meter, { backgroundColor: theme.backgroundSelected }]}>
          <View
            style={[
              styles.meterFill,
              {
                width: `${(used / limit) * 100}%`,
                backgroundColor: full ? theme.danger : theme.accent,
              },
            ]}
          />
        </View>
        <ThemedText type="small" themeColor="textSecondary">
          {lockedCount > 0
            ? t('{{count}} drives are saved and shown in full. Their value unlocks with Pro.', { count: lockedCount })
            : full
              ? t('New work drives are still saved and shown in full. Their value unlocks with Pro.')
              : t('Personal drives don’t count.')}
        </ThemedText>
      </Pressable>
      <Pressable accessibilityRole="button" hitSlop={8} onPress={() => setExplaining(true)} style={styles.savedLine}>
        <ThemedText type="small" style={{ color: theme.accent }}>
          {t('What counts?')}
        </ThemedText>
      </Pressable>
      {/* The sharer's own bonus needs iCloud to count friends; until then only a friend's code helps. */}
      {(full || lockedCount > 0) && (counting || canRedeem) && (
        <Pressable accessibilityRole="button" hitSlop={8} onPress={() => router.push('/friends' as Href)}>
          <ThemedText type="small" style={{ color: theme.accent }}>
            {counting
              ? t('Or invite a friend: you both get 10 more free drives a month.')
              : t('Got a code from a friend? It adds 10 free drives a month.')}
          </ThemedText>
        </Pressable>
      )}
      <PlanSheet visible={explaining} allowance={limit} onClose={() => setExplaining(false)} />
    </ThemedView>
  );
}

function SwipeAction({
  label,
  color,
  textColor,
  side,
}: {
  label: string;
  color: string;
  textColor: string;
  side: 'left' | 'right';
}) {
  return (
    <View
      style={[
        styles.swipeAction,
        { backgroundColor: color, alignItems: side === 'left' ? 'flex-start' : 'flex-end' },
      ]}>
      <ThemedText type="smallBold" style={{ color: textColor }}>
        {label}
      </ThemedText>
    </View>
  );
}

/** A trip's start time the way the user's country and language write it ("4:12 PM", "16:12"). */
function formatTime(iso: string, region: Region): string {
  return new Date(iso).toLocaleTimeString(displayLocale(region), { hour: 'numeric', minute: '2-digit' });
}

/** A drive being recorded right now, so nobody has to wait until parking to know it's working. */
function LiveDriveBanner({ drive }: { drive: LiveDrive }) {
  const theme = useTheme();
  const t = useT();
  const { region } = useRegion();
  const distance = formatDistance(drive.distanceMeters, region);
  const since = new Date(drive.startedAt).toLocaleTimeString(displayLocale(region), { hour: 'numeric', minute: '2-digit' });
  return (
    <View
      accessibilityRole="text"
      accessibilityLiveRegion="polite"
      style={[styles.liveDrive, { borderColor: theme.accent, backgroundColor: theme.accent + '14' }]}>
      <LiveDot color={drive.stopped ? '#FACC15' : theme.accent} />
      <View style={styles.flex}>
        <ThemedText type="smallBold" style={{ color: theme.accent }}>
          {drive.stopped
            ? t('Stopped · {{distance}}', { distance })
            : t('Recording a drive · {{distance}}', { distance })}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {drive.stopped
            ? t('If you’ve parked, the trip is saved after 5 minutes.')
            : t('Since {{time}}. It’s saved as a trip once you park.', { time: since })}
        </ThemedText>
      </View>
    </View>
  );
}

/** Shift mode: swipe to start, swipe back to end; every drive in between is work. */
function ShiftBar({
  shift,
  paused,
  drives,
  distance,
  value,
  revision,
  onStart,
  onEnd,
  onTogglePause,
}: {
  revision: number;
  shift: Shift | null;
  /** On a break for a personal errand: drives now aren't work. */
  paused: boolean;
  onTogglePause: () => void;
  drives: number;
  distance: string;
  value: string;
  onStart: () => void;
  onEnd: () => void;
}) {
  const t = useT();
  const theme = useTheme();
  const { region } = useRegion();
  const [now, setNow] = useState(() => Date.now());
  /** A send-off shown for a few seconds after swiping to start. */
  const [cheer, setCheer] = useState<string | null>(null);
  const cheerTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(cheerTimer.current), []);
  useEffect(() => {
    if (!shift) return;
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, [shift]);

  const minutes = shift ? Math.max(0, Math.floor((now - Date.parse(shift.startedAt)) / 60_000)) : 0;
  const elapsed = t('{{hours}}h {{minutes}}m', {
    hours: Math.floor(minutes / 60),
    minutes: String(minutes % 60).padStart(2, '0'),
  });
  return (
    <View style={styles.shiftStart}>
      <ShiftSwitch
        on={!!shift}
        revision={revision}
        startLabel={t('Swipe to start shift')}
        startHint={t('Every drive until you end it counts as business')}
        endLabel={t('On shift for {{elapsed}}, {{count}} drives', { elapsed, count: drives })}
        onStart={() => {
          setCheer(shiftCheer(region.code, Math.floor(Date.now() / 1000), getLanguage()));
          clearTimeout(cheerTimer.current);
          cheerTimer.current = setTimeout(() => setCheer(null), 3500);
          onStart();
        }}
        onEnd={() => {
          setCheer(null);
          onEnd();
        }}>
        {shift && (
          <>
            <LiveDot color="#FDE68A" />
            <View style={styles.flex}>
              {cheer ? (
                <Animated.Text
                  entering={ZoomIn.springify().damping(12)}
                  style={styles.cheer}
                  numberOfLines={1}
                  adjustsFontSizeToFit>
                  {cheer}
                </Animated.Text>
              ) : (
                <Text style={styles.shiftTitle} numberOfLines={1}>
                  {paused ? t('Paused · {{elapsed}}', { elapsed }) : t('On shift · {{elapsed}}', { elapsed })}
                </Text>
              )}
              <Text style={styles.shiftSub} numberOfLines={1}>
                {drives > 0
                  ? t('{{distance}} · {{value}} · {{count}} drives', { distance, value, count: drives })
                  : t('Every drive counts as business')}
              </Text>
            </View>
          </>
        )}
      </ShiftSwitch>
      <View style={styles.shiftFoot}>
        <ThemedText type="small" themeColor="textSecondary" style={[styles.shiftHint, styles.flex]}>
          {!shift
            ? t('Every drive until you end it counts as business.')
            : paused
              ? t('Paused: drives now aren’t counted as work. Resume when you’re back.')
              : t('Swipe back to end your shift.')}
        </ThemedText>
        {shift && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={paused ? t('Resume the shift') : t('Pause the shift for a personal errand')}
            hitSlop={8}
            onPress={onTogglePause}
            style={[styles.pauseButton, { borderColor: theme.accent }]}>
            <ThemedText type="smallBold" style={{ color: theme.accent }}>
              {paused ? t('Resume') : t('Pause')}
            </ThemedText>
          </Pressable>
        )}
      </View>
    </View>
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

/** Gently pulses while automatic tracking is on. */
function LiveDot({ color }: { color: string }) {
  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 1600, easing: Easing.out(Easing.quad) }), -1);
  }, [pulse]);
  const ring = useAnimatedStyle(() => ({ opacity: 0.5 * (1 - pulse.value), transform: [{ scale: 1 + 1.4 * pulse.value }] }));
  return (
    <View style={styles.liveDot}>
      <Animated.View style={[StyleSheet.absoluteFill, styles.dot, { backgroundColor: color }, ring]} />
      <View style={[styles.dot, { backgroundColor: color }]} />
    </View>
  );
}

const TRACKING_MESSAGES: Record<Exclude<TrackingStatus, 'on'>, { title: string; body: string }> = {
  'needs-permission': {
    title: msg('Automatic tracking is off'),
    body: msg('Allow location access and MileMint logs every drive for you.'),
  },
  'needs-always': {
    title: msg('Drives may be missed'),
    body: msg('Location is set to “While Using”. Switch it to “Always” so drives are logged when the app is closed.'),
  },
  off: { title: msg('Automatic tracking is paused'), body: msg('Turn it back on to keep logging drives.') },
  unsupported: {
    title: msg('Preview mode'),
    body: msg('Automatic tracking runs on your iPhone. Tap + to add a trip and try the app here.'),
  },
};

function TrackingCard({ status }: { status: TrackingStatus | null }) {
  const theme = useTheme();
  const t = useT();
  if (!status) return null;
  if (status === 'on') {
    return (
      <View style={styles.trackingOn} accessibilityRole="text">
        <View style={[styles.livePill, { backgroundColor: theme.accent + '1F' }]}>
          <LiveDot color={theme.accent} />
          <ThemedText type="smallBold" style={{ color: theme.accent }}>
            {t('Tracking on')}
          </ThemedText>
        </View>
        <ThemedText type="small" themeColor="textSecondary" style={styles.flex}>
          {t('Drives are logged when you park.')}
        </ThemedText>
      </View>
    );
  }
  const message = TRACKING_MESSAGES[status];
  return (
    <ThemedView type="backgroundElement" style={[styles.trackingCard, { borderColor: theme.accent }]}>
      <ThemedText type="smallBold">{t(message.title)}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {t(message.body)}
      </ThemedText>
      {status !== 'unsupported' && (
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/setup-tracking')}
          style={[styles.trackingButton, { backgroundColor: theme.accent }]}>
          <ThemedText type="smallBold" style={{ color: theme.onAccent }}>
            {t('Turn on')}
          </ThemedText>
        </Pressable>
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
  card: { borderRadius: 20, padding: Spacing.four, gap: Spacing.one, overflow: 'hidden' },
  watermark: { position: 'absolute', right: -44, bottom: -52 },
  heroLabel: { color: '#D1FAE5', fontSize: 15, fontWeight: '500' },
  heroTotal: { color: '#FFFFFF', fontSize: 48, lineHeight: 56, fontWeight: '800', fontVariant: ['tabular-nums'] },
  heroWarning: { color: '#FDE68A', fontSize: 14, lineHeight: 20 },
  reportLink: {
    alignSelf: 'flex-start',
    marginTop: Spacing.two,
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  reportLinkText: { color: '#064E3B', fontSize: 14, fontWeight: '700' },
  heroButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  empty: { alignItems: 'center', gap: Spacing.two, marginTop: Spacing.five, paddingHorizontal: Spacing.four },
  emptyBody: { textAlign: 'center' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  brandText: { fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
  },
  liveDot: { width: 8, height: 8 },
  vehicleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: Spacing.one + 2,
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one + 2,
  },
  liveDrive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderRadius: 16,
    borderWidth: 1.5,
    padding: Spacing.three,
  },
  goPro: { backgroundColor: '#FACC15', borderRadius: 999, paddingHorizontal: Spacing.two + 2, paddingVertical: 3 },
  goProText: { color: '#064E3B', fontSize: 13, fontWeight: '800' },
  shiftStart: { gap: Spacing.one + 2 },
  shiftHint: { textAlign: 'center' },
  shiftFoot: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  pauseButton: { borderWidth: 1, borderRadius: 999, paddingHorizontal: Spacing.three, paddingVertical: Spacing.one },
  leg: { marginLeft: Spacing.three, paddingLeft: Spacing.two, borderLeftWidth: 2, marginTop: -Spacing.two },
  cheer: { color: '#FEF3C7', fontSize: 19, fontWeight: '800' },
  shiftTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  shiftSub: { color: '#FEF3C7', fontSize: 12 },
  row: { borderRadius: 12, padding: Spacing.three, gap: Spacing.two },
  rowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.two },
  route: { flex: 1 },
  swipeAction: {
    width: 120,
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    borderRadius: 12,
  },
  header: { gap: Spacing.three },
  selectBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.one },
  selectActions: { flexDirection: 'row', gap: Spacing.four, alignItems: 'center' },
  selectableRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, borderWidth: 2, borderColor: 'transparent' },
  check: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1, gap: Spacing.one },
  bulkBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: Spacing.three,
    paddingHorizontal: Spacing.three,
    gap: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  bulkCount: { textAlign: 'center' },
  bulkButtons: { flexDirection: 'row', gap: Spacing.two, width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center' },
  bulkButton: { flex: 1, alignItems: 'center', paddingVertical: Spacing.three, borderRadius: 12 },
  planCard: { borderRadius: 16, padding: Spacing.three, gap: Spacing.two },
  planMain: { gap: Spacing.two },
  savedLine: { alignSelf: 'flex-start' },
  purposeNeeded: { borderWidth: 1, borderRadius: 10, padding: Spacing.two + 2, gap: Spacing.two },
  purposeChips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  purposeChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: Spacing.three - 4,
    paddingVertical: Spacing.one + 2,
    maxWidth: '100%',
  },
  purposeNudge: { borderRadius: 16, borderWidth: 1, padding: Spacing.three, gap: Spacing.one },
  notice: {
    position: 'absolute',
    left: Spacing.three,
    right: Spacing.three,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    borderRadius: 14,
    padding: Spacing.three,
  },
  noticeText: { fontSize: 14, lineHeight: 20, fontWeight: '600' },
  meter: { height: 6, borderRadius: 3, overflow: 'hidden' },
  meterFill: { height: '100%', borderRadius: 3 },
  trackingOn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingHorizontal: Spacing.one },
  dot: { width: 8, height: 8, borderRadius: 4 },
  trackingCard: { borderRadius: 16, borderWidth: 1, padding: Spacing.three, gap: Spacing.one },
  trackingButton: {
    alignSelf: 'flex-start',
    marginTop: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: 10,
  },
});
