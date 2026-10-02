import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Polyline } from 'react-native-svg';

import type { LatLng } from '@/domain/geo';
import { routeBounds } from '@/domain/route-display';
import { useTheme } from '@/hooks/use-theme';

import { ROUTE_COLORS, ROUTE_LINE_WIDTH, type RouteMapProps } from './route-map-types';

/**
 * The web preview's stand-in for the map: react-native-maps has no web
 * version, so the routes are drawn to fit on a plain background, in the
 * same colours. Pan and zoom aren't offered.
 */
export function RouteMap({ routes, padding = 28, style }: RouteMapProps) {
  const theme = useTheme();
  const [size, setSize] = useState({ width: 0, height: 0 });
  const { width, height } = size;
  const drawing = useMemo(() => {
    const box = routeBounds(routes.map((route) => route.points));
    if (!box || width === 0 || height === 0) return null;
    // Longitude shrinks towards the poles: scale it so the shape isn't stretched.
    const lngScale = Math.cos((((box.minLat + box.maxLat) / 2) * Math.PI) / 180);
    const spanX = Math.max((box.maxLng - box.minLng) * lngScale, 1e-6);
    const spanY = Math.max(box.maxLat - box.minLat, 1e-6);
    const pad = Math.min(padding, width / 4, height / 4);
    const scale = Math.min((width - 2 * pad) / spanX, (height - 2 * pad) / spanY);
    const offsetX = (width - spanX * scale) / 2;
    const offsetY = (height - spanY * scale) / 2;
    const xy = (p: LatLng) => [offsetX + (p.longitude - box.minLng) * lngScale * scale, offsetY + (box.maxLat - p.latitude) * scale];
    const first = routes.find((route) => route.startDot);
    const last = [...routes].reverse().find((route) => route.endDot);
    return {
      lines: routes.map((route) => route.points.map((p) => xy(p).join(',')).join(' ')),
      start: first ? xy(first.points[0]) : null,
      end: last ? xy(last.points[last.points.length - 1]) : null,
    };
  }, [routes, width, height, padding]);

  return (
    <View
      onLayout={(event) => setSize({ width: event.nativeEvent.layout.width, height: event.nativeEvent.layout.height })}
      style={[styles.map, { backgroundColor: theme.backgroundSelected }, style]}>
      {drawing && (
        <Svg width={width} height={height}>
          {drawing.lines.map((points, index) => (
            <Polyline
              key={index}
              points={points}
              fill="none"
              stroke={ROUTE_COLORS.line}
              strokeWidth={ROUTE_LINE_WIDTH}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ))}
          {drawing.start && (
            <Circle cx={drawing.start[0]} cy={drawing.start[1]} r={6} fill={ROUTE_COLORS.start} stroke={ROUTE_COLORS.ring} strokeWidth={2.5} />
          )}
          {drawing.end && (
            <Circle cx={drawing.end[0]} cy={drawing.end[1]} r={8} fill={ROUTE_COLORS.end} stroke={ROUTE_COLORS.ring} strokeWidth={2.5} />
          )}
        </Svg>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1, overflow: 'hidden' },
});
