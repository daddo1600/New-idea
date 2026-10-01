import { type Href, Redirect, router, Stack } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
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
import { Celebration } from '@/components/celebration';
import { ReminderAsk } from '@/components/reminder-ask';
import { SwipeToStart } from '@/components/swipe-to-start';
import { TaxCountdown } from '@/components/tax-countdown';
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
import { autoDrivesInMonth, FREE_AUTO_DRIVES_PER_MONTH, lockedTripIds } from '@/domain/plan';
import type { Place } from '@/domain/places';
import {
  computeDeductions,
  displayLocale,
  currentTaxYear,
  formatDistance,
  formatLongDate,
  formatMoney,
  potentialDeduction,
  summarizeTaxYear,
  taxYearOf,
  type TaxYearSummary,
} from '@/domain/regions';
import { type Classification, toLocalIsoDate, type Trip, VEHICLE_ICONS } from '@/domain/trip';
import { useMileagePay } from '@/hooks/use-mileage-pay';
import { useTheme } from '@/hooks/use-theme';
import { getLanguage, msg, useT } from '@/i18n/i18n';
import { usePro } from '@/purchases/pro';
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
  const { trips, places, classify, classifyMany, remove, reload } = useTrips();
  const insets = useSafeAreaInsets();
  // Bulk sort: pick several trips, then mark them all at once.
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const { status } = useTracking(reload);
  const { isPro } = usePro();
  const { region, loaded, onboarded } = useRegion();
  const taxYear = currentTaxYear(region);
  useReminders(region);
  // Encrypted copy in the user's own iCloud, so a lost phone doesn't take the log with it.
  useAutoBackup(onboarded && !DEMO_MODE);
  const shiftMode = useShift();
  const liveDrive = useLiveDrive();
  const garage = useVehicles();
  const theme = useTheme();
  const t = useT();
  /** Choosing a vehicle: before starting a shift, or switching from the chip on home. */
  const [picking, setPicking] = useState<'shift' | 'switch' | null>(null);
  const locked = useMemo(() => lockedTripIds(trips ?? [], isPro), [trips, isPro]);
  // Locked drives don't count towards the total (or a tier limit) until they're unlocked.
  const visible = useMemo(() => (trips ?? []).filter((trip) => !locked.has(trip.id)), [trips, locked]);
  const deductions = useMemo(() => computeDeductions(visible, region), [visible, region]);
  const shiftTrips = useMemo(
    () => (shiftMode.shift ? visible.filter((trip) => trip.shiftId === shiftMode.shift?.id) : []),
    [visible, shiftMode.shift],
  );
  const summary = useMemo(
    () => summarizeTaxYear(visible, region, taxYear, deductions),
    [visible, region, taxYear, deductions],
  );
  const celebration = useMilestoneCelebration(trips ? visible : null, deductions, region);
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

  const unsorted = visible.filter((trip) => trip.classification === 'unclassified');
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
  const markSelected = async (classification: Classification) => {
    await classifyMany(visible.filter((trip) => selected.has(trip.id)), classification);
    stopSelecting();
  };

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
        data={trips}
        keyExtractor={(trip) => trip.id}
        // Room for the bulk actions bar while selecting.
        contentContainerStyle={[styles.list, { paddingBottom: (selecting ? 160 : 96) + insets.bottom }]}
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
                onStart={() => (garage.vehicles.length > 1 ? setPicking('shift') : shiftMode.start())}
                onEnd={shiftMode.end}
              />
            )}
            {liveDrive && <LiveDriveBanner drive={liveDrive} />}
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
                setSelecting(true);
                setSelected(new Set(unsorted.map((trip) => trip.id)));
              }}
            />
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
            {!isPro && <PlanCard trips={trips} lockedCount={locked.size} />}
            {visible.length > 0 && (
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
          <View style={styles.empty}>
            <LeafMark size={72} />
            <ThemedText type="smallBold">{status === 'on' ? t('Ready when you are') : t('No drives yet')}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.emptyBody}>
              {status === 'on'
                ? t('Just drive. Each trip appears here after you park, ready to swipe business or personal.')
                : t('Turn on automatic tracking and your drives will appear here.')}
            </ThemedText>
          </View>
        }
        renderItem={({ item }) =>
          selecting ? (
            locked.has(item.id) ? null : (
              <SelectableTripRow trip={item} selected={selected.has(item.id)} onToggle={() => toggle(item)} />
            )
          ) : locked.has(item.id) ? (
            <LockedTripRow trip={item} worth={potentialDeduction(item, visible, region)} />
          ) : (
            <TripRow
              trip={item}
              deduction={deductions.get(item.id) ?? 0}
              potential={item.classification === 'unclassified' ? potentialDeduction(item, visible, region) : 0}
              commute={isCommute(kindOf(item.startPlaceId), kindOf(item.endPlaceId))}
              onClassify={(c) => classify(item, c)}
              onLongPress={() => confirmDelete(item)}
            />
          )
        }
      />
      {!selecting && <AddTripButton bottom={insets.bottom} />}
      <Celebration content={celebration.content} onClose={celebration.close} />
      <VehicleSheet
        visible={picking !== null}
        title={picking === 'shift' ? t('Which vehicle today?') : t('What are you driving?')}
        vehicles={garage.vehicles}
        currentId={garage.current?.id ?? null}
        onClose={() => setPicking(null)}
        onPick={async (vehicle) => {
          const startShift = picking === 'shift';
          setPicking(null);
          await garage.choose(vehicle);
          if (startShift) await shiftMode.start();
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
              {trip.startLabel} → {trip.endLabel}
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
  onClassify,
  onLongPress,
}: {
  trip: Trip;
  deduction: number;
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
    trip.source === 'auto' ? formatTime(trip.startedAt) : t('Added manually'),
    trip.purpose,
    deduction > 0 ? formatMoney(deduction, region) : '',
  ].filter(Boolean);
  const openDetails = () => router.push({ pathname: '/trip/[id]', params: { id: trip.id } });

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
              {trip.startLabel} → {trip.endLabel}
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
          {business && !trip.purpose.trim() && (
            <Pressable accessibilityRole="button" onPress={openDetails} hitSlop={8}>
              <ThemedText type="smallBold" style={{ color: theme.accent }}>
                {t('Add business purpose')}
              </ThemedText>
            </Pressable>
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
 * A drive over the free monthly limit: recorded and kept, but its details and
 * classification wait for Pro. Distance and date stay visible so the user can
 * see it's real.
 */
function LockedTripRow({ trip, worth }: { trip: Trip; worth: number }) {
  const theme = useTheme();
  const t = useT();
  const { region } = useRegion();
  const distance = formatDistance(trip.distanceMeters, region);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('Locked drive on {{date}}, {{distance}}', { date: trip.localDate, distance })}
      accessibilityHint={t('Opens MileMint Pro to unlock it')}
      onPress={() => router.push('/pro')}>
      <ThemedView type="backgroundElement" style={styles.row}>
        <View style={styles.rowHeader}>
          <ThemedText type="smallBold" themeColor="textSecondary" style={styles.route}>
            🔒 {t('Locked drive')}
          </ThemedText>
          <ThemedText type="smallBold">{distance}</ThemedText>
        </View>
        <ThemedText type="small" themeColor="textSecondary">
          {[
            trip.localDate,
            formatTime(trip.startedAt),
            worth > 0 ? t('worth up to {{amount}}', { amount: formatMoney(worth, region) }) : '',
          ]
            .filter(Boolean)
            .join(' · ')}
        </ThemedText>
        <ThemedText type="smallBold" style={{ color: theme.accent }}>
          {t('Unlock with MileMint Pro')}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

/** Free plan meter: how much of this month's allowance is used. */
function PlanCard({ trips, lockedCount }: { trips: readonly Trip[]; lockedCount: number }) {
  const theme = useTheme();
  const t = useT();
  const { region } = useRegion();
  const now = new Date();
  const used = Math.min(
    autoDrivesInMonth(trips, toLocalIsoDate(now).slice(0, 7)),
    FREE_AUTO_DRIVES_PER_MONTH,
  );
  const month = now.toLocaleDateString(displayLocale(region), { month: 'long' });
  const full = used >= FREE_AUTO_DRIVES_PER_MONTH;
  return (
    <Pressable accessibilityRole="button" onPress={() => router.push('/pro')}>
      <ThemedView
        type="backgroundElement"
        style={[styles.planCard, lockedCount > 0 && { borderColor: theme.accent, borderWidth: 1 }]}>
        <View style={styles.rowHeader}>
          <ThemedText type="smallBold">
            {t('{{used}} of {{limit}} free drives in {{month}}', { used, limit: FREE_AUTO_DRIVES_PER_MONTH, month })}
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
                width: `${(used / FREE_AUTO_DRIVES_PER_MONTH) * 100}%`,
                backgroundColor: full ? theme.danger : theme.accent,
              },
            ]}
          />
        </View>
        {lockedCount > 0 ? (
          <ThemedText type="small" themeColor="textSecondary">
            {t('{{count}} drives are locked. Upgrade for unlimited drives.', { count: lockedCount })}
          </ThemedText>
        ) : (
          full && (
            <ThemedText type="small" themeColor="textSecondary">
              {t('New drives this month are saved but locked until you upgrade.')}
            </ThemedText>
          )
        )}
      </ThemedView>
    </Pressable>
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

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
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

/** Shift mode: one tap to start, and everything until "End shift" is work. */
function ShiftBar({
  shift,
  drives,
  distance,
  value,
  onStart,
  onEnd,
}: {
  shift: Shift | null;
  drives: number;
  distance: string;
  value: string;
  onStart: () => void;
  onEnd: () => void;
}) {
  const t = useT();
  const { region } = useRegion();
  const [now, setNow] = useState(() => Date.now());
  /** A send-off shown for a few seconds after swiping to start. */
  const [cheer, setCheer] = useState<string | null>(null);
  useEffect(() => {
    if (!shift) return;
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, [shift]);

  if (!shift) {
    return (
      <View style={styles.shiftStart}>
        <SwipeToStart
          label={t('Swipe to start shift')}
          hint={t('Every drive until you end it counts as business')}
          onComplete={() => {
            setCheer(shiftCheer(region.code, Math.floor(Date.now() / 1000), getLanguage()));
            setTimeout(() => setCheer(null), 3500);
            onStart();
          }}
        />
        <ThemedText type="small" themeColor="textSecondary" style={styles.shiftHint}>
          {t('Every drive until you end it counts as business.')}
        </ThemedText>
      </View>
    );
  }

  const minutes = Math.max(0, Math.floor((now - Date.parse(shift.startedAt)) / 60_000));
  const elapsed = t('{{hours}}h {{minutes}}m', {
    hours: Math.floor(minutes / 60),
    minutes: String(minutes % 60).padStart(2, '0'),
  });
  return (
    <View
      style={styles.shiftOn}
      accessibilityLabel={t('On shift for {{elapsed}}, {{count}} drives', { elapsed, count: drives })}>
      <BrandGradient />
      <LiveDot color="#FACC15" />
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
          <Text style={styles.shiftTitle}>{t('On shift · {{elapsed}}', { elapsed })}</Text>
        )}
        <Text style={styles.shiftSub}>
          {drives > 0
            ? t('{{distance}} · {{value}} · {{count}} drives', { distance, value, count: drives })
            : t('Every drive counts as business')}
        </Text>
      </View>
      <Pressable accessibilityRole="button" onPress={onEnd} style={styles.shiftEnd}>
        <Text style={styles.shiftEndText}>{t('End shift')}</Text>
      </Pressable>
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
  cheer: { color: '#FACC15', fontSize: 20, fontWeight: '800' },
  shiftOn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderRadius: 16,
    padding: Spacing.three,
    overflow: 'hidden',
  },
  shiftTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  shiftSub: { color: '#D1FAE5', fontSize: 13 },
  shiftEnd: { backgroundColor: '#FFFFFF', borderRadius: 999, paddingHorizontal: Spacing.three, paddingVertical: Spacing.two },
  shiftEndText: { color: '#064E3B', fontSize: 14, fontWeight: '700' },
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
