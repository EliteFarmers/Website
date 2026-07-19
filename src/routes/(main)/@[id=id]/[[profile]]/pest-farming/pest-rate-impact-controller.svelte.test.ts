import { beforeEach, expect, test, vi } from 'vitest';
import type {
	FortuneUpgrade,
	PestFarmingRateCalculator,
	PestFarmingRateResult,
	PestFarmingUpgradeRateImpact,
	PestRatePriceBook,
} from 'farming-weight';
import { PestFarmingPhase } from 'farming-weight';
import { PestRateImpactController, type PestRateComparisonTask } from './pest-rate-impact-controller.svelte';

vi.mock('$app/environment', () => ({ browser: true }));

let frames: FrameRequestCallback[];

beforeEach(() => {
	frames = [];
	vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
		frames.push(callback);
		return frames.length;
	});
});

test('deduplicates upgrades and comparisons by stable identity', async () => {
	const before = result('mechanics-a', 10);
	const calculateUpgradeImpact = vi.fn(() => impact('same-upgrade', before, result('upgrade', 12)));
	const calculator = calculatorStub({ calculateUpgradeImpact });
	const calculateComparison = vi.fn(() => ({ before, after: result('gear', 15) }));
	const controller = new PestRateImpactController();

	controller.restart({
		calculator,
		before,
		phase: PestFarmingPhase.Spawn,
		upgrades: [upgrade('same-upgrade'), upgrade('same-upgrade')],
		comparisons: [comparison('same-gear', calculateComparison), comparison('same-gear', calculateComparison)],
	});
	await flushFrames();

	expect(calculateUpgradeImpact).toHaveBeenCalledTimes(1);
	expect(calculateComparison).toHaveBeenCalledTimes(1);
	expect(controller.ready).toBe(true);
	expect(controller.upgradeImpacts.size).toBe(0);
	controller.revalue(calculator, priceBook('priced'));
	expect(controller.upgradeImpacts.size).toBe(1);
	expect(controller.gearImpacts.get('same-gear')).toBe(5);
});

test('discards stale work after a newer generation starts', async () => {
	const staleCalculation = vi.fn();
	const currentCalculation = vi.fn(() => ({ before: result('current', 2), after: result('after', 3) }));
	const controller = new PestRateImpactController();
	const calculator = calculatorStub();

	controller.restart({
		calculator,
		before: result('stale', 1),
		phase: PestFarmingPhase.Farm,
		upgrades: [],
		comparisons: [comparison('stale', staleCalculation)],
	});
	controller.restart({
		calculator,
		before: result('current', 2),
		phase: PestFarmingPhase.Farm,
		upgrades: [],
		comparisons: [comparison('current', currentCalculation)],
	});
	await flushFrames();

	expect(staleCalculation).not.toHaveBeenCalled();
	expect(currentCalculation).toHaveBeenCalledTimes(1);
	controller.revalue(calculator, priceBook('priced'));
	expect(controller.gearImpacts.has('stale')).toBe(false);
	expect(controller.gearImpacts.get('current')).toBe(1);
});

test('price-only revaluation does not repeat mechanical evaluations', async () => {
	const before = result('mechanics', 10);
	const calculateUpgradeImpact = vi.fn(() => impact('upgrade', before, result('upgraded', 12)));
	const calculateComparison = vi.fn(() => ({ before, after: result('gear', 15) }));
	const revalueUpgradeImpact = vi.fn((value: PestFarmingUpgradeRateImpact) => value);
	const revalueResult = vi.fn((value: PestFarmingRateResult, prices: PestRatePriceBook) => ({
		...value,
		stateKey: `${value.mechanicsKey}:${prices.version}`,
	}));
	const calculator = calculatorStub({ calculateUpgradeImpact, revalueUpgradeImpact, revalueResult });
	const controller = new PestRateImpactController();

	controller.restart({
		calculator,
		before,
		phase: PestFarmingPhase.Kill,
		upgrades: [upgrade('upgrade')],
		comparisons: [comparison('gear', calculateComparison)],
	});
	await flushFrames();
	controller.revalue(calculator, priceBook('first'));
	controller.revalue(calculator, priceBook('second'));

	expect(calculateUpgradeImpact).toHaveBeenCalledTimes(1);
	expect(calculateComparison).toHaveBeenCalledTimes(1);
	expect(revalueUpgradeImpact).toHaveBeenCalledTimes(2);
	expect(revalueResult).toHaveBeenCalledTimes(4);
});

function result(mechanicsKey: string, coinsPerHour: number): PestFarmingRateResult {
	return {
		mechanicsKey,
		stateKey: mechanicsKey,
		valuation: { coinsPerHour },
	} as PestFarmingRateResult;
}

function impact(
	upgradeKey: string,
	before: PestFarmingRateResult,
	after: PestFarmingRateResult
): PestFarmingUpgradeRateImpact {
	return {
		upgradeKey,
		before,
		after,
		delta: { items: {}, rngItems: {} },
		valuationDelta: {},
	} as PestFarmingUpgradeRateImpact;
}

function upgrade(identity: string): FortuneUpgrade {
	return { title: identity, action: 'set', conflictKey: identity } as unknown as FortuneUpgrade;
}

function comparison(key: string, calculate: PestRateComparisonTask['calculate']): PestRateComparisonTask {
	return { key, type: 'gear', calculate };
}

function priceBook(version: string): PestRatePriceBook {
	return { version, missingItemMode: 'exclude' };
}

function calculatorStub(overrides: Partial<PestFarmingRateCalculator> = {}): PestFarmingRateCalculator {
	return {
		calculateUpgradeImpact: vi.fn(),
		getRequiredPriceItems: vi.fn(() => []),
		revalueUpgradeImpact: vi.fn((value) => value),
		revalueResult: vi.fn((value) => value),
		...overrides,
	} as unknown as PestFarmingRateCalculator;
}

async function flushFrames(): Promise<void> {
	for (let turn = 0; turn < 20; turn++) {
		const callbacks = frames.splice(0);
		for (const callback of callbacks) callback(performance.now());
		await Promise.resolve();
		await Promise.resolve();
		if (frames.length === 0) return;
	}
	throw new Error('Frame queue did not settle');
}
