import { describe, expect, it } from 'vitest';
import { Stat, type FortuneSourceProgress } from 'farming-weight';
import { getProgressCompletion } from './progress-completion';

function progress(ratio: number): FortuneSourceProgress {
	return { name: 'Test', current: ratio * 100, max: 100, ratio };
}

describe('getProgressCompletion', () => {
	it('treats floating-point ratios at the maximum as maxed', () => {
		expect(getProgressCompletion([progress(1 - 1e-12)], true)).toEqual({
			percentage: 100,
			maxed: true,
			label: 'Maxed',
		});
	});

	it('does not label incomplete progress as 100% complete', () => {
		expect(getProgressCompletion([progress(0.996)], true)).toEqual({
			percentage: 99,
			maxed: false,
			label: '99% complete',
		});
	});

	it('uses nested progress values shown in the expanded row', () => {
		const parent = { ...progress(0.5), progress: [progress(1), progress(1)] };
		expect(getProgressCompletion([parent], true).maxed).toBe(true);
	});

	it('prefers the aggregate stat bars shown in the expanded row over hidden source ratios', () => {
		const parent: FortuneSourceProgress = {
			...progress(0.5),
			stats: { [Stat.FarmingFortune]: { current: 10, max: 10, ratio: 1 } },
			progress: [progress(0.5)],
		};
		expect(getProgressCompletion([parent], true).maxed).toBe(true);
	});
});
