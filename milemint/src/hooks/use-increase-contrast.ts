import { useEffect, useState } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';

/** Settings › Accessibility › Display › Increase Contrast. iOS only; false elsewhere. */
export function useIncreaseContrast(): boolean {
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    let live = true;
    AccessibilityInfo.isDarkerSystemColorsEnabled().then(
      (value) => live && setOn(value),
      () => {},
    );
    const subscription = AccessibilityInfo.addEventListener('darkerSystemColorsChanged', setOn);
    return () => {
      live = false;
      subscription.remove();
    };
  }, []);
  return on;
}
