import { requireOptionalNativeModule } from 'expo';

type TextScanNative = {
  recognizeText(uri: string): Promise<string[]>;
};

/** ios/TextScanModule.swift. Missing on the web, on Android, in Jest and in builds from before it was added. */
const native = requireOptionalNativeModule<TextScanNative>('TextScan');

/** Thrown where text can't be read from images (the web preview, Android, an older build). */
export class TextScanUnavailableError extends Error {
  readonly code = 'ERR_TEXT_SCAN_UNAVAILABLE';

  constructor() {
    super('Reading text from images needs the MileSprout iPhone app.');
    this.name = 'TextScanUnavailableError';
  }
}

/**
 * Text recognition on the device (Apple Vision, accurate, with language
 * correction). Nothing is sent anywhere: the image is read on the iPhone.
 */
export const TextScan = {
  isAvailable: (): boolean => native !== null,
  /**
   * The text in the image at `uri` (a file:// URI from the image picker), as
   * lines from top to bottom; words side by side on one row come back as one
   * line. Throws TextScanUnavailableError without the native module.
   */
  recognizeText: async (uri: string): Promise<string[]> => {
    if (!native) throw new TextScanUnavailableError();
    return native.recognizeText(uri);
  },
};
