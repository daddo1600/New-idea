import { Redirect, useLocalSearchParams, type Href } from 'expo-router';

import { useRegion } from '@/region/region';

/**
 * An invite link, milemint://invite/TRVB-7K2: opens "Invite friends" with the
 * code filled in, or on first launch the welcome, whose last step asks for it.
 */
export default function InviteLink() {
  const { code } = useLocalSearchParams<{ code?: string }>();
  const { loaded, onboarded } = useRegion();
  if (!loaded) return null;
  const pathname = onboarded ? '/friends' : '/welcome';
  return <Redirect href={{ pathname, params: code ? { code: String(code).slice(0, 16) } : {} } as Href} />;
}
