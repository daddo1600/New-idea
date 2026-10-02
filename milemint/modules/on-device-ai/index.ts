import { requireOptionalNativeModule } from 'expo';

/**
 * Whether Apple's on-device model can be used: only on iOS 26 with Apple
 * Intelligence (iPhone 15 Pro and newer), turned on and downloaded.
 */
export type OnDeviceAIAvailability =
  | 'available'
  | 'deviceNotEligible'
  | 'appleIntelligenceNotEnabled'
  | 'modelNotReady'
  | 'unsupported';

export type GenerateOptions = {
  /** 0 to 1; low keeps the wording close to the figures. */
  temperature?: number;
  maximumResponseTokens?: number;
};

type OnDeviceAINative = {
  availability(): string;
  supportsLanguage(tag: string): boolean;
  generate(instructions: string, prompt: string, options: Required<GenerateOptions>): Promise<string>;
};

/** ios/OnDeviceAIModule.swift. Missing on the web, on Android, in Jest and in builds from before it was added. */
const native = requireOptionalNativeModule<OnDeviceAINative>('OnDeviceAI');

const KNOWN: readonly string[] = ['available', 'deviceNotEligible', 'appleIntelligenceNotEnabled', 'modelNotReady'];

/**
 * Apple's on-device model. Everywhere without it (web, Android, Jest, older
 * iOS, older builds) it's "unsupported" and `generate` rejects, so callers
 * fall back to their own wording.
 */
export const OnDeviceAI = {
  availability: (): OnDeviceAIAvailability => {
    try {
      const status = native?.availability() ?? 'unsupported';
      return (KNOWN.includes(status) ? status : 'unsupported') as OnDeviceAIAvailability;
    } catch {
      return 'unsupported';
    }
  },
  /** Whether the model can answer in a language ("fr", "pt-BR", "zh-Hans"). */
  supportsLanguage: (tag: string): boolean => {
    try {
      return native ? native.supportsLanguage(tag) : false;
    } catch {
      return false;
    }
  },
  generate: (instructions: string, prompt: string, options: GenerateOptions = {}): Promise<string> =>
    native
      ? native.generate(instructions, prompt, {
          temperature: options.temperature ?? 0.3,
          maximumResponseTokens: options.maximumResponseTokens ?? 300,
        })
      : Promise.reject(new Error('The on-device model is only available in the iPhone app.')),
};
