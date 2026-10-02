import type { StyleProp, ViewStyle } from 'react-native';

import type { DisplayRoute } from '@/domain/route-display';

/** The route's look, the same on the map and the web drawing, light or dark. */
export const ROUTE_COLORS = {
  /** Brand green. */
  line: '#0B7A55',
  start: '#0B7A55',
  /** Gold, like the finish of a drive. */
  end: '#FACC15',
  ring: '#FFFFFF',
} as const;

export const ROUTE_LINE_WIDTH = 5;

export type RouteMapProps = {
  /** Already trimmed and thinned (displayRoute). A dot is drawn at the first start and last end that allow one. */
  routes: readonly DisplayRoute[];
  /** Pan and zoom; off in cards so the page scrolls. */
  interactive?: boolean;
  /** Room round the routes when fitting, in points. */
  padding?: number;
  style?: StyleProp<ViewStyle>;
};
