import { requireOptionalNativeModule } from 'expo';
import type { ActiveSubscription, ProductSubscription, Purchase } from 'expo-iap';
import { Platform } from 'react-native';

/**
 * MileMint Pro through Apple's StoreKit, with no third-party service: the
 * App Store holds the subscription and the phone checks it, so no account and
 * no purchase data ever reaches us.
 *
 * Product IDs must match the auto-renewable subscriptions set up in App Store
 * Connect (one subscription group, "MileMint Pro").
 */
export const PRO_MONTHLY = 'com.milemint.app.pro.monthly';
export const PRO_YEARLY = 'com.milemint.app.pro.yearly';
export const PRO_PRODUCT_IDS = [PRO_YEARLY, PRO_MONTHLY];

/**
 * StoreKit only exists in a real iOS build. Expo Go and the web preview have
 * no native module, so the paywall explains that instead of crashing.
 */
export const STORE_AVAILABLE =
  Platform.OS === 'ios' && requireOptionalNativeModule('ExpoIap') !== null;

type Iap = typeof import('expo-iap');
// Loaded lazily so importing this file never touches the missing native module.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const iap = (): Iap => require('expo-iap') as Iap;

let connecting: Promise<boolean> | null = null;
function connect(): Promise<boolean> {
  connecting ??= iap()
    .initConnection()
    .catch((error: unknown) => {
      connecting = null;
      throw error;
    });
  return connecting;
}

export type ProPlan = {
  id: string;
  /** Localized, e.g. "$49.99". */
  price: string;
  period: 'month' | 'year';
  /** The free trial the user is eligible for, if any; worded on screen (e.g. "30-day free trial"). */
  trial: ProTrial | null;
};

/** A free trial's length; `unit: null` when the App Store gives no length we word. */
export type ProTrial = { count: number; unit: 'day' | 'month' | null };

function trialOf(product: ProductSubscription): ProTrial | null {
  if (product.platform !== 'ios' || product.introductoryPricePaymentModeIOS !== 'free-trial') return null;
  const count = Number(product.introductoryPriceNumberOfPeriodsIOS ?? 1);
  const unit = product.introductoryPriceSubscriptionPeriodIOS;
  if (unit === 'day') return { count, unit: 'day' };
  if (unit === 'week') return { count: count * 7, unit: 'day' };
  if (unit === 'month') return { count, unit: 'month' };
  return { count, unit: null };
}

export async function loadPlans(): Promise<ProPlan[]> {
  if (!STORE_AVAILABLE) return [];
  await connect();
  const products = ((await iap().fetchProducts({ skus: PRO_PRODUCT_IDS, type: 'subs' })) ??
    []) as ProductSubscription[];
  return products
    .map((product) => ({
      id: product.id,
      price: product.displayPrice,
      period: product.id === PRO_YEARLY ? ('year' as const) : ('month' as const),
      trial: trialOf(product),
    }))
    .sort((a, b) => PRO_PRODUCT_IDS.indexOf(a.id) - PRO_PRODUCT_IDS.indexOf(b.id));
}

/** Whether the App Store reports an active Pro subscription (including a trial). */
export async function checkPro(): Promise<boolean> {
  if (!STORE_AVAILABLE) return false;
  await connect();
  const active: ActiveSubscription[] = await iap().getActiveSubscriptions(PRO_PRODUCT_IDS);
  return active.some((subscription) => subscription.isActive);
}

/**
 * Starts Apple's purchase sheet. The result arrives through `onPurchase`
 * (it can also arrive later, e.g. after Ask to Buy), so this only reports
 * whether the sheet opened.
 */
export async function buy(productId: string): Promise<void> {
  await connect();
  await iap().requestPurchase({ type: 'subs', request: { apple: { sku: productId } } });
}

export async function restore(): Promise<boolean> {
  if (!STORE_AVAILABLE) return false;
  await connect();
  await iap().restorePurchases();
  return checkPro();
}

/** Opens the App Store's own screen for cancelling or changing the plan. */
export async function manageSubscription(): Promise<void> {
  await connect();
  await iap().deepLinkToSubscriptions();
}

export function isCancelled(error: unknown): boolean {
  return STORE_AVAILABLE && iap().isUserCancelledError(error);
}

/**
 * Listens for completed purchases and failures, finishing each transaction so
 * StoreKit doesn't deliver it again. Returns the unsubscribe function.
 */
export function onPurchase(
  handlers: { success: (purchase: Purchase) => void; error: (error: unknown) => void },
): () => void {
  if (!STORE_AVAILABLE) return () => {};
  const { purchaseUpdatedListener, purchaseErrorListener, finishTransaction } = iap();
  const updated = purchaseUpdatedListener(async (purchase) => {
    if (!PRO_PRODUCT_IDS.includes(purchase.productId)) return;
    try {
      await finishTransaction({ purchase, isConsumable: false });
    } finally {
      handlers.success(purchase);
    }
  });
  const failed = purchaseErrorListener((error) => handlers.error(error));
  return () => {
    updated.remove();
    failed.remove();
  };
}
