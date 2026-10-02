import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { askInstructions, checkAnswer, MAX_QUESTION_LENGTH, recapInstructions, recapPrompt } from '@/domain/recap';
import { LANGUAGES, type Lang } from '@/i18n/i18n';

import { OnDeviceAI, type OnDeviceAIAvailability } from '../../modules/on-device-ai';

export type { OnDeviceAIAvailability };

/**
 * Whether Apple's on-device model can be used now. Checked again whenever the
 * app comes back to the front, since the user may have just turned Apple
 * Intelligence on, or the model may have finished downloading.
 */
export function useOnDeviceAI(): OnDeviceAIAvailability {
  const [status, setStatus] = useState<OnDeviceAIAvailability>(() => OnDeviceAI.availability());
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') setStatus(OnDeviceAI.availability());
    });
    return () => subscription.remove();
  }, []);
  return status;
}

/** Whether the model can write in the app's language. */
export function modelSpeaks(lang: Lang): boolean {
  return lang === 'en' || OnDeviceAI.supportsLanguage(lang);
}

/** The language's English name, for the model's instructions. */
function englishName(lang: Lang): string {
  return LANGUAGES.find((language) => language.code === lang)?.english ?? 'English';
}

/** On-device answers take a few seconds; past this, the template's words are shown. */
const TIMEOUT_MS = 20_000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timed out')), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

/** The model's answer, checked against the figures it was given (checkAnswer); null if it fails or doesn't pass. */
async function generateChecked(instructions: string, prompt: string, sources: readonly string[]): Promise<string | null> {
  try {
    const answer = await withTimeout(OnDeviceAI.generate(instructions, prompt, { temperature: 0.2 }), TIMEOUT_MS);
    return checkAnswer(answer, sources);
  } catch {
    return null;
  }
}

/** Recaps already written this session, by language and figures, so the Money tab doesn't ask again on every visit. */
const recaps = new Map<string, string | null>();

/**
 * The weekly recap in the model's words, in `lang` (only asked for when
 * modelSpeaks(lang)); null when it couldn't be written, and the template's
 * recap is shown instead.
 */
export async function writeRecap(facts: string, lang: Lang): Promise<string | null> {
  const key = `${lang}\n${facts}`;
  if (recaps.has(key)) return recaps.get(key) ?? null;
  const text = await generateChecked(recapInstructions(englishName(lang)), recapPrompt(facts), [facts]);
  // A failure isn't remembered: the next visit tries again.
  if (text) recaps.set(key, text);
  return text;
}

/** The recap already written for these figures, if any (to show it at once). */
export function writtenRecap(facts: string, lang: Lang): string | null {
  return recaps.get(`${lang}\n${facts}`) ?? null;
}

/**
 * Ask MileSprout: the driver's question answered from `summary` (summaryText),
 * in the app's language when the model has it, otherwise in English. Null
 * when the model fails or its answer has a figure that isn't in the summary.
 */
export async function askMileSprout(question: string, summary: string, lang: Lang): Promise<string | null> {
  const asked = question.trim().slice(0, MAX_QUESTION_LENGTH);
  if (!asked) return null;
  const language = modelSpeaks(lang) ? englishName(lang) : 'English';
  return generateChecked(askInstructions(language, summary), asked, [summary, asked]);
}
