import * as SecureStore from 'expo-secure-store';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AppState, Platform } from 'react-native';

import { DEMO_MODE, DEMO_PRO } from '@/dev/demo';

import {
  buy as storeBuy,
  checkPro,
  isCancelled,
  loadPlans,
  manageSubscription,
  onPurchase,
  restore as storeRestore,
  STORE_AVAILABLE,
  type ProPlan,
} from './store';

/**
 * Last status the App Store reported, so Pro users see their drives at once
 * (and offline) instead of a flash of locked trips while StoreKit answers.
 */
const CACHE_KEY = 'milemint.pro-active';

/** The web demo has no App Store; these stand in so the paywall can be previewed. */
const DEMO_PLANS: ProPlan[] = [
  { id: 'demo.yearly', price: '$49.99', period: 'year', trial: '30-day free trial' },
  { id: 'demo.monthly', price: '$5.99', period: 'month', trial: null },
];
const canCache = Platform.OS !== 'web';

type Pro = {
  isPro: boolean;
  /** Empty until the App Store answers, or when purchases aren't available here. */
  plans: ProPlan[];
  /** The App Store has answered (possibly with no plans, e.g. before prices are set). */
  plansLoaded: boolean;
  storeAvailable: boolean;
  /** A purchase or restore is in progress. */
  busy: boolean;
  error: string | null;
  buy: (planId: string) => Promise<void>;
  /** Resolves to whether a subscription was found. */
  restore: () => Promise<boolean>;
  manage: () => Promise<void>;
};

const ProContext = createContext<Pro | null>(null);

export function ProProvider({ children }: { children: ReactNode }) {
  // The web demo stands in for a paying user so screenshots show every drive.
  const [isPro, setIsPro] = useState(DEMO_PRO);
  const [plans, setPlans] = useState<ProPlan[]>(DEMO_MODE ? DEMO_PLANS : []);
  const [plansLoaded, setPlansLoaded] = useState(DEMO_MODE);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remember = useCallback((active: boolean) => {
    setIsPro(active);
    if (canCache) SecureStore.setItemAsync(CACHE_KEY, active ? '1' : '0').catch(() => {});
  }, []);

  const refresh = useCallback(async () => {
    if (!STORE_AVAILABLE) return;
    try {
      remember(await checkPro());
    } catch {
      // Offline or StoreKit unavailable: keep the last known status.
    }
  }, [remember]);

  useEffect(() => {
    if (DEMO_MODE) return;
    if (canCache) {
      SecureStore.getItemAsync(CACHE_KEY)
        .then((cached) => cached === '1' && setIsPro(true))
        .catch(() => {});
    }
    // Deferred so the provider's first render isn't followed by a synchronous update.
    const initial = setTimeout(refresh, 0);
    loadPlans()
      .then(setPlans)
      .catch(() => setPlans([]))
      .finally(() => setPlansLoaded(true));
    // A store that can't be reached must never stop the app from opening.
    let stopListening = () => {};
    try {
      stopListening = onPurchase({
        success: () => {
          setBusy(false);
          setError(null);
          remember(true);
        },
        error: (purchaseError) => {
          setBusy(false);
          if (!isCancelled(purchaseError)) setError('The purchase didn’t go through. Please try again.');
        },
      });
    } catch (listenError) {
      console.warn('[pro] purchase listener unavailable', listenError);
    }
    // Renewals, cancellations and refunds show up when the app comes back.
    const foreground = AppState.addEventListener('change', (state) => state === 'active' && refresh());
    return () => {
      clearTimeout(initial);
      stopListening();
      foreground.remove();
    };
  }, [refresh, remember]);

  const buy = useCallback(async (planId: string) => {
    if (DEMO_MODE) return; // Preview only: there is no App Store to buy from.
    setError(null);
    setBusy(true);
    try {
      // Resolves once Apple's sheet closes; the purchase itself arrives via the listener.
      await storeBuy(planId);
    } catch (purchaseError) {
      if (!isCancelled(purchaseError)) setError('The App Store couldn’t start the purchase. Please try again.');
    } finally {
      setBusy(false);
    }
  }, []);

  const restore = useCallback(async () => {
    setError(null);
    setBusy(true);
    try {
      const active = await storeRestore();
      remember(active);
      return active;
    } catch {
      setError('Couldn’t reach the App Store. Check your connection and try again.');
      return false;
    } finally {
      setBusy(false);
    }
  }, [remember]);

  const value = useMemo<Pro>(
    () => ({
      isPro,
      plans,
      plansLoaded,
      storeAvailable: STORE_AVAILABLE || DEMO_MODE,
      busy,
      error,
      buy,
      restore,
      manage: manageSubscription,
    }),
    [isPro, plans, plansLoaded, busy, error, buy, restore],
  );

  return <ProContext.Provider value={value}>{children}</ProContext.Provider>;
}

export function usePro(): Pro {
  const pro = useContext(ProContext);
  if (!pro) throw new Error('usePro must be used inside <ProProvider>');
  return pro;
}
