import { describe, expect, it } from '@jest/globals';

import { withWriteLock } from '../transaction';

const tick = () => new Promise((resolve) => setTimeout(resolve, 5));

describe('withWriteLock', () => {
  it('runs writes one after another, never overlapping', async () => {
    const log: string[] = [];
    const write = (name: string) =>
      withWriteLock(async () => {
        log.push(`${name} start`);
        await tick();
        log.push(`${name} end`);
        return name;
      });
    await expect(Promise.all([write('app'), write('background'), write('backup')])).resolves.toEqual([
      'app',
      'background',
      'backup',
    ]);
    expect(log).toEqual(['app start', 'app end', 'background start', 'background end', 'backup start', 'backup end']);
  });

  it('carries on after a failed write', async () => {
    const failed = withWriteLock(async () => {
      throw new Error('constraint failed');
    });
    const next = withWriteLock(async () => 'saved');
    await expect(failed).rejects.toThrow('constraint failed');
    await expect(next).resolves.toBe('saved');
  });
});
