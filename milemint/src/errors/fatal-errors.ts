import { Alert } from 'react-native';

import { t } from '@/i18n/i18n';

/**
 * In a release build an uncaught JavaScript error closes the app without a
 * word, which tells neither the user nor us what went wrong. Show the message
 * instead, so a screenshot from a tester is enough to fix it. Render errors
 * are handled by the root ErrorBoundary; this covers everything else
 * (timers, promises turned fatal, native callbacks).
 */

type ErrorHandler = (error: Error, isFatal?: boolean) => void;
type ErrorUtilsLike = { getGlobalHandler: () => ErrorHandler; setGlobalHandler: (handler: ErrorHandler) => void };

let installed = false;

export function describeError(error: unknown): string {
  if (error instanceof Error) {
    const where = error.stack?.split('\n').slice(0, 4).join('\n') ?? '';
    return `${error.name}: ${error.message}${where ? `\n\n${where}` : ''}`;
  }
  return String(error);
}

export function installFatalErrorAlert(): void {
  const errorUtils = (globalThis as { ErrorUtils?: ErrorUtilsLike }).ErrorUtils;
  if (installed || !errorUtils) return;
  installed = true;
  const previous = errorUtils.getGlobalHandler();
  errorUtils.setGlobalHandler((error, isFatal) => {
    if (!isFatal || __DEV__) return previous(error, isFatal);
    console.error(error);
    Alert.alert(
      t('MileMint hit a problem'),
      `${t('Please send a screenshot of this to support.')}\n\n${describeError(error)}`,
    );
  });
}
