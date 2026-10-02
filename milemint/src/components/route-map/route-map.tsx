import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

import { routeBounds, routeRegion } from '@/domain/route-display';

import { ROUTE_COLORS, ROUTE_LINE_WIDTH, type RouteMapProps } from './route-map-types';

/**
 * Recorded routes on Apple Maps (react-native-maps' default provider on iOS:
 * no key, no account). MapKit follows the phone's light or dark appearance by
 * itself. Fits itself to the routes; still unless `interactive`.
 */
export function RouteMap({ routes, interactive = false, padding = 28, style }: RouteMapProps) {
  const map = useRef<MapView>(null);
  const [ready, setReady] = useState(false);
  const lines = useMemo(() => routes.map((route) => route.points), [routes]);
  const initialRegion = useMemo(() => routeRegion(lines) ?? undefined, [lines]);
  // Fitting needs only the box's corners, not every point sent over the bridge.
  const corners = useMemo(() => {
    const box = routeBounds(lines);
    return box
      ? [
          { latitude: box.minLat, longitude: box.minLng },
          { latitude: box.maxLat, longitude: box.maxLng },
        ]
      : [];
  }, [lines]);

  const fit = useCallback(() => {
    if (corners.length === 0) return;
    map.current?.fitToCoordinates(corners, {
      edgePadding: { top: padding, right: padding, bottom: padding, left: padding },
      animated: false,
    });
  }, [corners, padding]);

  useEffect(() => {
    if (ready) fit();
  }, [ready, fit]);

  const first = routes.find((route) => route.startDot);
  const last = [...routes].reverse().find((route) => route.endDot);

  return (
    <MapView
      ref={map}
      style={[styles.map, style]}
      initialRegion={initialRegion}
      onMapReady={() => setReady(true)}
      onLayout={ready ? fit : undefined}
      scrollEnabled={interactive}
      zoomEnabled={interactive}
      rotateEnabled={interactive}
      pitchEnabled={interactive}
      showsCompass={interactive}
      showsScale={interactive}
      showsUserLocation={false}
      showsMyLocationButton={false}
      toolbarEnabled={false}>
      {routes.map((route, index) => (
        <Polyline
          key={index}
          coordinates={route.points as { latitude: number; longitude: number }[]}
          strokeColor={ROUTE_COLORS.line}
          strokeWidth={ROUTE_LINE_WIDTH}
          lineCap="round"
          lineJoin="round"
        />
      ))}
      {first && (
        <Marker coordinate={first.points[0]} anchor={{ x: 0.5, y: 0.5 }} tappable={false}>
          <View style={[styles.dot, styles.start]} />
        </Marker>
      )}
      {last && (
        <Marker coordinate={last.points[last.points.length - 1]} anchor={{ x: 0.5, y: 0.5 }} tappable={false}>
          <View style={[styles.dot, styles.end]} />
        </Marker>
      )}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
  dot: { borderRadius: 999, borderWidth: 2.5, borderColor: ROUTE_COLORS.ring },
  start: { width: 14, height: 14, backgroundColor: ROUTE_COLORS.start },
  end: { width: 18, height: 18, backgroundColor: ROUTE_COLORS.end },
});
