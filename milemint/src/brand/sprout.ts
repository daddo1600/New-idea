/**
 * The sprout mark, drawn in a 100 × 100 box: a seedling whose stem is the
 * road, with cream lane dashes, the gold dot (the car) at the top and the
 * leaves growing out of the road's bends. The one source of truth for the
 * logo (components/leaf-mark), the launch animation (components/launch-intro)
 * and the generated icons and splash (assets/brand/generate.py).
 */

export const SPROUT_COLORS = {
  road: '#064E3B',
  dash: '#FBF7EE',
  gold: '#FACC15',
  ring: '#FFFFFF',
  soil: '#064E3B',
  /** The seed's light through the soil as it cracks open. */
  soilCrack: '#FACC15',
  shadow: '#085E42',
} as const;

/** Leaf colours: fresh green all year, turning gold and orange in autumn; gold for drivers who invited friends. */
export const LEAF_PALETTES = {
  mint: { light: '#77E8A0', deep: '#24B359', fold: '#085E42', vein: '#064E3B', foldVein: '#77E8A0' },
  autumn: { light: '#FDE68A', deep: '#EA580C', fold: '#9A3412', vein: '#7C2D12', foldVein: '#FDE68A' },
  /** Earned by inviting friends (the Earnings by platform perk). */
  gold: { light: '#FEF08A', deep: '#CA8A04', fold: '#854D0E', vein: '#713F12', foldVein: '#FEF9C3' },
  /** Not grown yet: an invite perk still to earn. */
  seedling: { light: '#E5E7EB', deep: '#A1A1AA', fold: '#71717A', vein: '#71717A', foldVein: '#F4F4F5' },
} as const;
export type LeafPalette = keyof typeof LEAF_PALETTES;

/** Below this many points the mark drops the veins, highlights, shadows and soil. */
export const SMALL_MARK = 60;

/** The stem (road), bottom to top, as cubic Béziers: a bend left, then a bend right. */
const STEM: readonly (readonly [number, number])[][] = [
  [[50, 86], [50, 77], [38, 74], [40, 64]],
  [[40, 64], [42, 55], [54, 54], [54, 44]],
  [[54, 44], [54, 37], [51, 34], [51, 28]],
];
export const STEM_PATH =
  `M${STEM[0][0].join(' ')} ` + STEM.map(([, a, b, c]) => `C${a.join(' ')} ${b.join(' ')} ${c.join(' ')}`).join(' ');

export const ROAD_WIDTH = 8;
export const DASH_WIDTH = 1.4;
/** The gold dot: `DOT_R` of gold inside a white ring out to `RING_R`. */
export const DOT_R = 5.6;
export const RING_R = 7.6;

/** The stem sampled finely, for arc-length lookups. */
const FINE = (() => {
  const xs: number[] = [];
  const ys: number[] = [];
  const lengths: number[] = [];
  const per = 200;
  STEM.forEach(([p0, p1, p2, p3], segment) => {
    for (let i = segment === 0 ? 0 : 1; i <= per; i++) {
      const t = i / per;
      const u = 1 - t;
      const at = (k: 0 | 1) => u * u * u * p0[k] + 3 * u * u * t * p1[k] + 3 * u * t * t * p2[k] + t * t * t * p3[k];
      const x = at(0);
      const y = at(1);
      const last = xs.length - 1;
      lengths.push(last < 0 ? 0 : lengths[last] + Math.hypot(x - xs[last], y - ys[last]));
      xs.push(x);
      ys.push(y);
    }
  });
  return { xs, ys, lengths };
})();

/** The stem's length, in mark units. */
export const STEM_LENGTH = FINE.lengths[FINE.lengths.length - 1];

/** The point `s` units along the stem from the bottom. */
function pointAtLength(s: number): [number, number] {
  const { xs, ys, lengths } = FINE;
  const target = Math.min(STEM_LENGTH, Math.max(0, s));
  let lo = 0;
  let hi = lengths.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (lengths[mid] < target) lo = mid;
    else hi = mid;
  }
  const f = (target - lengths[lo]) / (lengths[hi] - lengths[lo] || 1);
  return [xs[lo] + (xs[hi] - xs[lo]) * f, ys[lo] + (ys[hi] - ys[lo]) * f];
}

/**
 * The stem sampled evenly by distance, so the car moves at the speed of the
 * animation's progress: point i is i / STEM_SAMPLES of the way up. Plain
 * arrays, so worklets can read them.
 */
export const STEM_SAMPLES = 96;
export const STEM_XS: number[] = [];
export const STEM_YS: number[] = [];
for (let i = 0; i <= STEM_SAMPLES; i++) {
  const [x, y] = pointAtLength((i / STEM_SAMPLES) * STEM_LENGTH);
  STEM_XS.push(x);
  STEM_YS.push(y);
}

/**
 * The car's spot `progress` (0–1) of the way up the stem, from the samples above.
 * A worklet. Progress is clamped: a timing's first frame can land a hair below 0
 * (Easing.inOut(cubic) at a frame stamped just before its start), which read
 * STEM_XS[-1] and gave the car NaN coordinates.
 */
export function stemSampleAt(progress: number): { x: number; y: number } {
  'worklet';
  // `> 0` also turns NaN into the foot of the stem.
  const at = (progress > 0 ? Math.min(1, progress) : 0) * STEM_SAMPLES;
  const i = Math.min(STEM_SAMPLES - 1, Math.floor(at));
  const f = at - i;
  return {
    x: STEM_XS[i] + (STEM_XS[i + 1] - STEM_XS[i]) * f,
    y: STEM_YS[i] + (STEM_YS[i + 1] - STEM_YS[i]) * f,
  };
}

/** The point `t` (0–1) of the way up the stem. */
export function stemAt(t: number) {
  const [x, y] = pointAtLength(t * STEM_LENGTH);
  return { x, y };
}

/**
 * The lane dashes, one path each, with how far up the stem each one ends
 * (0–1), so the animation can lay them one at a time behind the car. They
 * stop short of the dot.
 */
function laneDashes(dash: number, gap: number, offset: number) {
  const dashes: { d: string; end: number }[] = [];
  for (let s = offset; s + dash < STEM_LENGTH - RING_R; s += dash + gap) {
    const points = [0, 0.25, 0.5, 0.75, 1].map((f) => pointAtLength(s + dash * f));
    dashes.push({
      d: 'M' + points.map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join(' L'),
      end: (s + dash) / STEM_LENGTH,
    });
  }
  return dashes;
}
export const LANE_DASHES = laneDashes(2.6, 3.2, 3);
/** Small sizes: three or four bold dashes, because thin ones turn to grey noise. */
export const SMALL_LANE_DASHES = laneDashes(5, 7, 4);

/**
 * Leaf shapes, drawn with the base at (0, 0) and the tip towards +x. The
 * broad side (negative y) faces the light; the narrow side is the darker
 * underside, folded along the midrib.
 */
export type LeafShape = {
  blade: string;
  /** The underside showing below the midrib. */
  fold: string;
  /** A soft sheen along the broad side. */
  highlight: string;
  midrib: string;
  veins: readonly string[];
  /** Veins on the underside, drawn lighter. */
  foldVeins: readonly string[];
};

const BLADE: LeafShape = {
  blade:
    'M0 0 C3 -8 13 -14.5 25 -14.2 C33 -14 38.5 -11.5 42 -8.6 ' +
    'C38.5 -4.2 31 2.6 21 4.2 C12 5.6 4 4 0 0 Z',
  fold: 'M0 0 C10 -1.6 26 -3.8 42 -8.6 C38.5 -4.2 31 2.6 21 4.2 C12 5.6 4 4 0 0 Z',
  highlight: 'M6 -6.2 C11 -10.6 19 -12.6 27 -12.4 C20 -11 13 -8.6 6 -6.2 Z',
  midrib: 'M2 -0.3 C12 -1.9 26 -3.9 40 -8',
  veins: [
    'M9 -1.3 C11.5 -5.5 14 -8.5 17.5 -11',
    'M16.5 -2.3 C19.5 -6.5 23 -9.8 27 -12.3',
    'M24.5 -3.6 C27.5 -7 31 -9.6 34.5 -11.2',
    'M32 -5.5 C34 -7.6 36.2 -8.8 38.5 -9.6',
  ],
  foldVeins: ['M12 -1.7 C14.5 0.6 16.5 2.4 18.5 3.8', 'M22 -3 C24.5 -1 26.5 0.6 28.5 1.6'],
};

/** A young leaf, still half rolled, with its tip curling over. */
const LEAFLET: LeafShape = {
  blade:
    'M0 0 C2.5 -6 8 -10 14.5 -10.2 C19 -10.4 22 -8.6 22.6 -6.2 ' +
    'C23.1 -4.2 21.6 -2.9 20.2 -3.6 C19.2 -4.1 19.4 -5.4 20.4 -5.6 ' +
    'C17.5 -2 11 2.6 5 2.4 C2.4 2.3 0.8 1.4 0 0 Z',
  fold: 'M0 0 C7 -1.4 14 -3.4 20.4 -5.6 C17.5 -2 11 2.6 5 2.4 C2.4 2.3 0.8 1.4 0 0 Z',
  highlight: 'M4.5 -4.6 C8 -7.6 12 -8.8 16 -8.8 C12 -7.8 8.5 -6.6 4.5 -4.6 Z',
  midrib: 'M1.5 -0.3 C8 -1.6 14 -3.4 19.6 -5.4',
  veins: ['M7 -1.2 C8.6 -4 10.4 -6 12.6 -7.6', 'M13 -2.7 C14.6 -5 16.4 -6.6 18.4 -7.6'],
  foldVeins: [],
};

export const LEAF_SHAPES = { blade: BLADE, leaflet: LEAFLET } as const;

export type Leaf = {
  shape: keyof typeof LEAF_SHAPES;
  /** Where it grows from: how far up the stem (0–1). The animation opens it as the car passes. */
  at: number;
  /** The direction it points, in degrees clockwise from +x. */
  angle: number;
  scale: number;
  /** Mirror it so the broad side still faces up on the left of the stem. */
  flip: boolean;
  /** How far it starts folded in against the stem (degrees), before it unfurls. */
  unfurl: number;
  /** The peak of its springy overshoot as it opens. */
  overshoot: number;
};

/** Drawn in this order, under the road, so each leaf grows out of it. */
export const LEAVES: readonly Leaf[] = [
  { shape: 'blade', at: 0.47, angle: 213, scale: 0.86, flip: true, unfurl: 32, overshoot: 1.05 },
  { shape: 'blade', at: 0.8, angle: -40, scale: 0.98, flip: false, unfurl: -34, overshoot: 1.06 },
  { shape: 'leaflet', at: 0.9, angle: 216, scale: 1.05, flip: true, unfurl: 40, overshoot: 1.08 },
];

/** Where a leaf sits on the stem, and its SVG transform from leaf coordinates. */
export function leafPlacement(leaf: Leaf) {
  const node = stemAt(leaf.at);
  const transform =
    `translate(${node.x.toFixed(2)} ${node.y.toFixed(2)}) rotate(${leaf.angle}) ` +
    `scale(${leaf.scale} ${leaf.flip ? -leaf.scale : leaf.scale})`;
  return { node, transform };
}

/** The leaf shadow's offset, in mark units. */
export const SHADOW_OFFSET = { x: 1.2, y: 1.6 } as const;

/** The soil the seed starts in: a low mound with a few pebbles, in front of the road's foot. */
export const SOIL = {
  mound: 'M27 92 C33 87.6 42 85.8 50 85.8 C58 85.8 67 87.6 73 92 C66 92.9 34 92.9 27 92 Z',
  rim: 'M30.5 89.6 C37 87 44 86.2 50 86.2 C56 86.2 63 87 69.5 89.6',
  pebbles: [
    { x: 37, y: 90.2, r: 0.9 },
    { x: 61.5, y: 89.9, r: 0.75 },
    { x: 44.5, y: 91.1, r: 0.6 },
  ],
} as const;

/**
 * The seed asleep inside the soil before it breaks out (the splash screen and
 * the launch animation's first frame): small and low, glowing through the mound.
 */
export const BURIED = { y: 90, r: 2.4 } as const;

/** The crack that opens in the soil as the seed pushes up. */
export const CRACK = 'M45.6 86.9 L47.6 85.4 L49.2 86.6 L50.9 85 L52.6 86.5 L54.4 85.6';

/** Clods of soil thrown out as the seed breaks through: where each flies to, from the crack. */
export const CRUMBS = [
  { dx: -11, dy: -10, r: 1.7 },
  { dx: -6, dy: -15, r: 1.2 },
  { dx: 1.5, dy: -17, r: 1 },
  { dx: 7, dy: -14, r: 1.4 },
  { dx: 12, dy: -8, r: 1.8 },
  { dx: -15, dy: -4, r: 1.1 },
  { dx: 15, dy: -3, r: 1 },
] as const;

/** Small sizes are drawn thicker and a little larger, around the centre. */
export const SMALL = { road: 10, dash: 2.4, dot: 7, ring: 8.6, scale: 1.08 } as const;

/** Where the seasonal hats sit: on the dot at the top of the stem (see components/season/hats). */
export const TOP = stemAt(1);

type SvgOptions = {
  /** 'icon' adds the 135° brand gradient behind the mark. */
  background?: 'icon' | 'none';
  small?: boolean;
  /** Only the first frame of the launch animation: the seed asleep in its soil (the splash screen). */
  seed?: boolean;
  /**
   * One colour for themed icons (Android's monochrome layer, a tinted iOS icon):
   * white leaves and dot, a half-clear road cut out of the leaves, no dashes,
   * and a clear gap where the ring was.
   */
  tinted?: boolean;
  shadow?: boolean;
  /** Scales the whole mark around the centre (Android's safe zone). */
  scale?: number;
};

/**
 * The mark as an SVG document, for the generated icons and splash. Draws
 * exactly what LeafMark draws, from the same paths.
 */
export function sproutSvg({
  background = 'none',
  small = false,
  seed = false,
  tinted = false,
  shadow = !small && !tinted,
  scale = 1,
}: SvgOptions = {}) {
  const palette = LEAF_PALETTES.mint;
  const detail = !small && !tinted;
  const parts: string[] = [];
  const defs =
    '<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0E9F6E"/>' +
    '<stop offset="1" stop-color="#053D2E"/></linearGradient>' +
    `<linearGradient id="leaf" x1="0" y1="1" x2="0.85" y2="0"><stop offset="0" stop-color="${palette.deep}"/>` +
    `<stop offset="1" stop-color="${palette.light}"/></linearGradient>`;
  if (background === 'icon') parts.push('<rect width="100" height="100" fill="url(#bg)"/>');
  const roadWidth = small ? SMALL.road : ROAD_WIDTH;
  const ringR = small ? SMALL.ring : RING_R;
  // Themed icons only have one colour, so the parts are told apart by gaps.
  const cuts = tinted
    ? '<mask id="leafcut"><rect x="-50" y="-50" width="200" height="200" fill="#FFFFFF"/>' +
      `<path d="${STEM_PATH}" stroke="#000000" stroke-width="${roadWidth + 2}" stroke-linecap="round" fill="none"/>` +
      `<circle cx="${TOP.x}" cy="${TOP.y}" r="${ringR + 1}" fill="#000000"/></mask>` +
      '<mask id="dotgap"><rect x="-50" y="-50" width="200" height="200" fill="#FFFFFF"/>' +
      `<circle cx="${TOP.x}" cy="${TOP.y}" r="${ringR}" fill="#000000"/></mask>`
    : '';
  const total = scale * (small ? SMALL.scale : 1);
  parts.push(`<g transform="translate(${50 - 50 * total} ${50 - 50 * total}) scale(${total})">`);
  if (!seed) {
    if (tinted) parts.push('<g mask="url(#leafcut)">');
    for (const leaf of LEAVES) {
      const shape = LEAF_SHAPES[leaf.shape];
      const { transform } = leafPlacement(leaf);
      if (shadow) {
        parts.push(
          `<g transform="translate(${SHADOW_OFFSET.x} ${SHADOW_OFFSET.y}) ${transform}">` +
            `<path d="${shape.blade}" fill="${SPROUT_COLORS.shadow}" fill-opacity="0.5"/></g>`,
        );
      }
      parts.push(`<g transform="${transform}">`);
      if (tinted) {
        parts.push(`<path d="${shape.blade}" fill="#FFFFFF"/>`);
      } else {
        parts.push(`<path d="${shape.blade}" fill="url(#leaf)"/>`);
        parts.push(`<path d="${shape.fold}" fill="${palette.fold}" fill-opacity="0.42"/>`);
        if (detail) {
          parts.push(`<path d="${shape.highlight}" fill="#FFFFFF" fill-opacity="0.3"/>`);
          const stroke = 'fill="none" stroke-linecap="round"';
          parts.push(`<path d="${shape.midrib}" stroke="${palette.vein}" stroke-opacity="0.4" stroke-width="0.9" ${stroke}/>`);
          for (const vein of shape.veins) {
            parts.push(`<path d="${vein}" stroke="${palette.vein}" stroke-opacity="0.3" stroke-width="0.6" ${stroke}/>`);
          }
          for (const vein of shape.foldVeins) {
            parts.push(`<path d="${vein}" stroke="${palette.foldVein}" stroke-opacity="0.35" stroke-width="0.55" ${stroke}/>`);
          }
        }
      }
      parts.push('</g>');
    }
    if (tinted) parts.push('</g>');
    parts.push(
      tinted
        ? `<path d="${STEM_PATH}" stroke="#FFFFFF" stroke-opacity="0.5" stroke-width="${roadWidth}" ` +
            'stroke-linecap="round" fill="none" mask="url(#dotgap)"/>'
        : `<path d="${STEM_PATH}" stroke="${SPROUT_COLORS.road}" stroke-width="${roadWidth}" ` +
            'stroke-linecap="round" fill="none"/>',
    );
    if (!tinted) {
      const dashes = (small ? SMALL_LANE_DASHES : LANE_DASHES).map((dash) => dash.d).join(' ');
      parts.push(
        `<path d="${dashes}" stroke="${SPROUT_COLORS.dash}" stroke-width="${small ? SMALL.dash : DASH_WIDTH}" ` +
          'stroke-linecap="round" fill="none"/>',
      );
    }
  }
  const dot = seed ? stemAt(0) : TOP;
  if (tinted) {
    parts.push(`<circle cx="${dot.x}" cy="${dot.y}" r="${small ? SMALL.dot : DOT_R}" fill="#FFFFFF"/>`);
  } else if (seed) {
    parts.push(`<circle cx="${dot.x}" cy="${BURIED.y}" r="${BURIED.r}" fill="${SPROUT_COLORS.gold}"/>`);
  } else {
    parts.push(`<circle cx="${dot.x}" cy="${dot.y}" r="${ringR}" fill="${SPROUT_COLORS.ring}"/>`);
    parts.push(`<circle cx="${dot.x}" cy="${dot.y}" r="${small ? SMALL.dot : DOT_R}" fill="${SPROUT_COLORS.gold}"/>`);
  }
  if (detail) {
    parts.push(`<path d="${SOIL.mound}" fill="${SPROUT_COLORS.soil}" fill-opacity="0.85"/>`);
    parts.push(
      `<path d="${SOIL.rim}" stroke="#0E9F6E" stroke-opacity="0.55" stroke-width="0.8" stroke-linecap="round" fill="none"/>`,
    );
    for (const pebble of SOIL.pebbles) {
      parts.push(`<circle cx="${pebble.x}" cy="${pebble.y}" r="${pebble.r}" fill="${SPROUT_COLORS.dash}" fill-opacity="0.35"/>`);
    }
  }
  parts.push('</g>');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs>${defs}${cuts}</defs>${parts.join('')}</svg>`;
}
