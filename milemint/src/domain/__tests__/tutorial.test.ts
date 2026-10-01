import { describe, expect, it } from '@jest/globals';

import { currentStep, startTutorial, tutorialReducer, tutorialSteps, type TutorialEvent, type TutorialState } from '../tutorial';

const run = (state: TutorialState, ...events: TutorialEvent[]) => events.reduce(tutorialReducer, state);

describe('practice tutorial', () => {
  it('has three steps, or four with the shift for shift workers', () => {
    expect(tutorialSteps(false)).toEqual(['personal', 'business', 'done']);
    expect(tutorialSteps(true)).toEqual(['personal', 'business', 'shift', 'done']);
  });

  it('counts a wrong-way swipe as a miss and stays on the step', () => {
    const state = run(startTutorial(false), { type: 'sort', classification: 'business' });
    expect(currentStep(state)).toBe('personal');
    expect(state).toMatchObject({ passed: false, misses: 1 });
    expect(run(state, { type: 'sort', classification: 'business' }).misses).toBe(2);
  });

  it('only moves on once the step is done', () => {
    const start = startTutorial(false);
    expect(run(start, { type: 'next' })).toEqual(start);
    const passed = run(start, { type: 'sort', classification: 'personal' });
    expect(passed.passed).toBe(true);
    const next = run(passed, { type: 'next' });
    expect(currentStep(next)).toBe('business');
    expect(next).toMatchObject({ passed: false, misses: 0 });
  });

  it('ignores more swipes once the step is passed', () => {
    const passed = run(startTutorial(false), { type: 'sort', classification: 'personal' });
    expect(run(passed, { type: 'sort', classification: 'business' })).toEqual(passed);
  });

  it('runs through to closed for a non-shift worker, never asking to start a shift', () => {
    let state = run(
      startTutorial(false),
      { type: 'sort', classification: 'personal' },
      { type: 'next' },
      { type: 'shift-started' },
      { type: 'sort', classification: 'business' },
      { type: 'next' },
    );
    expect(currentStep(state)).toBe('done');
    expect(state.closed).toBe(false);
    state = run(state, { type: 'next' });
    expect(state.closed).toBe(true);
  });

  it('asks shift workers to start the sample shift, and only that passes it', () => {
    let state = run(
      startTutorial(true),
      { type: 'sort', classification: 'personal' },
      { type: 'next' },
      { type: 'sort', classification: 'business' },
      { type: 'next' },
    );
    expect(currentStep(state)).toBe('shift');
    state = run(state, { type: 'sort', classification: 'business' }, { type: 'next' });
    expect(currentStep(state)).toBe('shift');
    state = run(state, { type: 'shift-started' }, { type: 'next' });
    expect(currentStep(state)).toBe('done');
    expect(run(state, { type: 'next' }).closed).toBe(true);
  });

  it('can be skipped from any step, and nothing changes after', () => {
    const skipped = run(startTutorial(true), { type: 'skip' });
    expect(skipped.closed).toBe(true);
    expect(run(skipped, { type: 'sort', classification: 'personal' }, { type: 'next' })).toEqual(skipped);
  });
});
