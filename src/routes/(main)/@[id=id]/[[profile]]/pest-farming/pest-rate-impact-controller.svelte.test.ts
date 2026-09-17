import { beforeEach, expect, test, vi } from 'vitest';
import type {
	FortuneUpgrade,
	PestFarmingRateCalculator,
	PestFarmingRateResult,
	PestFarmingUpgradeRateImpact,
	PestRateComparisonTask,
	PestRatePriceBook,
} from 'farming-weight';
import {
	createPestFarmingPlayer,
	Crop,
	DEFAULT_PEST_CYCLE_SETTINGS,
	getFortuneUpgradeIdentity,
	PestFarmingPhase,
	PestFarmingRateCalculator as RateCalculator,
} from 'farming-weight';
import { PestRateImpactController } from './pest-rate-impact-controller.svelte';

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

test('stores impacts under the canonical upgrade identity used by the UI', async () => {
	const before = result('mechanics-a', 10);
	const canonicalUpgrade = {
		title: 'Canonical identity',
		action: 'apply',
		meta: {
			type: 'item',
			id: 'ITEM_ID',
			key: 'item_key',
			itemUuid: 'item-uuid',
		},
		onto: { slot: 'helmet' },
	} as unknown as FortuneUpgrade;
	const canonicalKey = getFortuneUpgradeIdentity(canonicalUpgrade);
	const calculator = calculatorStub({
		calculateUpgradeImpact: vi.fn(() => impact(canonicalKey, before, result('upgrade', 12))),
	});
	const controller = new PestRateImpactController();

	controller.restart({
		calculator,
		before,
		phase: PestFarmingPhase.Farm,
		upgrades: [canonicalUpgrade],
		comparisons: [],
	});
	await flushFrames();
	controller.revalue(calculator, priceBook('priced'));

	expect(controller.upgradeImpacts.get(canonicalKey)?.upgradeKey).toBe(canonicalKey);
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
	const revalueResult = vi.fn((value: PestFarmingRateResult, prices: PestRatePriceBook) => ({
		...value,
		stateKey: `${value.mechanicsKey}:${prices.version}`,
	}));
	const calculator = calculatorStub({ calculateUpgradeImpact, revalueResult });
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
	expect(calculator.compareResults).toHaveBeenCalledTimes(2);
	expect(revalueResult).toHaveBeenCalledTimes(6);
	expect(revalueResult.mock.calls.filter(([value]) => value === before)).toHaveLength(2);
});

test('revalues each shared result once per price update without changing impacts', async () => {
	const options = { crop: Crop.Wheat, cycle: DEFAULT_PEST_CYCLE_SETTINGS };
	const calculator = new RateCalculator({ player: createPestFarmingPlayer({}), options });
	const before = calculator.calculate();
	const after = [Crop.Carrot, Crop.Melon].map((crop) => calculator.withOptions({ ...options, crop }).calculate());
	const impacts = after.map((result, index) =>
		calculator.compareResults(before, result, PestFarmingPhase.Farm, `upgrade-${index}`)
	);
	vi.spyOn(calculator, 'calculateUpgradeImpact').mockImplementation(
		({ upgrade }) => impacts[upgrade.title === 'upgrade-0' ? 0 : 1]!
	);
	const controller = new PestRateImpactController();
	controller.restart({
		calculator,
		before,
		phase: PestFarmingPhase.Farm,
		upgrades: [upgrade('upgrade-0'), upgrade('upgrade-1')],
		comparisons: [
			comparison('gear', () => ({ before, after: after[0]! })),
			{ key: 'pet', type: 'pet', calculate: () => ({ before, after: after[1]! }) },
		],
	});
	await flushFrames();
	for (const coins of [2, 5]) {
		const prices: PestRatePriceBook = {
			version: `prices-${coins}`,
			missingItemMode: 'zero',
			items: {
				[Crop.Wheat]: { coins, source: 'manual' },
				[Crop.Carrot]: { coins: coins * 2, source: 'manual' },
				[Crop.Melon]: { coins: coins * 3, source: 'manual' },
			},
		};
		const expected = impacts.map((value) => calculator.revalueUpgradeImpact(value, prices));
		const revalue = vi.spyOn(RateCalculator.prototype, 'revalueResult');
		try {
			controller.revalue(calculator, prices);
			expect([...controller.upgradeImpacts.values()]).toEqual(expected);
			expect(controller.gearImpacts.get('gear')).toBe(expected[0]!.valuationDelta.coinsPerHour);
			expect(controller.petImpacts.get('pet')).toBe(expected[1]!.valuationDelta.coinsPerHour);
			expect(revalue).toHaveBeenCalledTimes(3);
		} finally {
			revalue.mockRestore();
		}
	}
});

test('an identical restart keeps completed impacts instead of rebuilding them', async () => {
	const before = result('mechanics', 10);
	const calculateUpgradeImpact = vi.fn(() => impact('upgrade', before, result('upgraded', 12)));
	const calculator = calculatorStub({ calculateUpgradeImpact });
	const controller = new PestRateImpactController();
	const input = {
		calculator,
		before,
		phase: PestFarmingPhase.Farm,
		upgrades: [upgrade('upgrade')],
		comparisons: [],
	};

	controller.restart(input);
	await flushFrames();
	controller.revalue(calculator, priceBook('priced'));
	const completedImpacts = controller.upgradeImpacts;

	controller.restart({ ...input, upgrades: [upgrade('upgrade'), upgrade('upgrade')] });

	expect(controller.ready).toBe(true);
	expect(controller.upgradeImpacts).toBe(completedImpacts);
	expect(calculateUpgradeImpact).toHaveBeenCalledTimes(1);
	expect(frames).toHaveLength(0);
});

test('keeps the last completed impacts visible while different mechanics rebuild', async () => {
	const first = result('first', 10);
	const second = result('second', 20);
	const calculator = calculatorStub({
		calculateUpgradeImpact: vi
			.fn()
			.mockReturnValueOnce(impact('upgrade', first, result('first-upgraded', 12)))
			.mockReturnValueOnce(impact('upgrade', second, result('second-upgraded', 24))),
	});
	const controller = new PestRateImpactController();

	controller.restart({
		calculator,
		before: first,
		phase: PestFarmingPhase.Farm,
		upgrades: [upgrade('upgrade')],
		comparisons: [],
	});
	await flushFrames();
	controller.revalue(calculator, priceBook('priced'));
	const completedImpacts = controller.upgradeImpacts;

	controller.restart({
		calculator,
		before: second,
		phase: PestFarmingPhase.Farm,
		upgrades: [upgrade('upgrade')],
		comparisons: [],
	});

	expect(controller.ready).toBe(false);
	expect(controller.upgradeImpacts).toBe(completedImpacts);
	expect(controller.upgradeImpacts.has('upgrade')).toBe(true);

	await flushFrames();
	controller.revalue(calculator, priceBook('priced'));
	expect(controller.ready).toBe(true);
	expect(controller.upgradeImpacts).not.toBe(completedImpacts);
	expect(calculator.calculateUpgradeImpact).toHaveBeenCalledTimes(2);
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
	const calculator = {
		calculateUpgradeImpact: vi.fn(),
		getRequiredPriceItems: vi.fn(() => []),
		revalueResult: vi.fn((value) => value),
		compareResults: vi.fn((before, after, phase, key) => ({ ...impact(key, before, after), phase })),
		...overrides,
	} as unknown as PestFarmingRateCalculator;
	calculator.withPriceBook = vi.fn(
		(prices) =>
			({
				...calculator,
				revalueResult: (value: PestFarmingRateResult) => calculator.revalueResult(value, prices),
			}) as PestFarmingRateCalculator
	);
	return calculator;
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
