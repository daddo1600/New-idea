import type { Classification } from '@/domain/trip';

/**
 * The practice run shown once after setup (components/practice-tutorial):
 * sort a sample personal drive, then a business one, then (shift workers)
 * start a sample shift. Each step only moves on once it's been done; nothing
 * here touches the database.
 */
export type TutorialStep = 'personal' | 'business' | 'shift' | 'done';

export type TutorialState = {
  steps: readonly TutorialStep[];
  index: number;
  /** The current step was done right: shown for a moment before `next`. */
  passed: boolean;
  /** Times the wrong way was tried on this step, so the hint can shake again each time. */
  misses: number;
  /** Finished or skipped: the overlay goes and `tutorialDone` is saved. */
  closed: boolean;
};

export type TutorialEvent =
  | { type: 'sort'; classification: Classification }
  | { type: 'shift-started' }
  | { type: 'next' }
  | { type: 'skip' };

export function tutorialSteps(shiftWorker: boolean): readonly TutorialStep[] {
  return shiftWorker ? ['personal', 'business', 'shift', 'done'] : ['personal', 'business', 'done'];
}

export function startTutorial(shiftWorker: boolean): TutorialState {
  return { steps: tutorialSteps(shiftWorker), index: 0, passed: false, misses: 0, closed: false };
}

export function currentStep(state: TutorialState): TutorialStep {
  return state.steps[state.index];
}

export function tutorialReducer(state: TutorialState, event: TutorialEvent): TutorialState {
  if (state.closed) return state;
  const step = currentStep(state);
  switch (event.type) {
    case 'skip':
      return { ...state, closed: true };
    case 'sort':
      if (state.passed || (step !== 'personal' && step !== 'business')) return state;
      return event.classification === step
        ? { ...state, passed: true }
        : { ...state, misses: state.misses + 1 };
    case 'shift-started':
      return step === 'shift' && !state.passed ? { ...state, passed: true } : state;
    case 'next':
      // The last step is a button ("Start driving"); the others move on only once done.
      if (step === 'done') return { ...state, closed: true };
      if (!state.passed) return state;
      return { ...state, index: state.index + 1, passed: false, misses: 0 };
  }
}
