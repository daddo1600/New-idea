/**
 * Prints the sprout mark's SVG documents as JSON, for generate.py to write
 * out and rasterise, so the icons and splash come from the same paths as the
 * app's logo (src/brand/sprout.ts). Run by generate.py; on its own:
 * `npx tsx assets/brand/sprout-svgs.ts`.
 */
import { sproutSvg } from '../../src/brand/sprout';

console.log(
  JSON.stringify({
    mark: sproutSvg(),
    icon: sproutSvg({ background: 'icon' }),
    small: sproutSvg({ small: true }),
    smallIcon: sproutSvg({ background: 'icon', small: true }),
    seed: sproutSvg({ seed: true }),
    // Android's adaptive icon crops to a circle or squircle: the art stays inside the central 66%.
    androidForeground: sproutSvg({ scale: 0.62 }),
    androidMonochrome: sproutSvg({ scale: 0.62, tinted: true }),
  }),
);
