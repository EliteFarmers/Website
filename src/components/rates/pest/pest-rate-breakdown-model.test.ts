import { describe, expect, test } from 'vitest';
import { Crop, DEFAULT_PEST_CYCLE_SETTINGS, PestFarmingPlayer, PestFarmingRateCalculator } from 'farming-weight';
import { buildFarmPhaseDetails, buildPestRateBreakdown, getCropBreakingRngGroup } from './pest-rate-breakdown-model.js';

describe('crop-breaking RNG groups', () => {
	test('uses the source of a producing add-drop effect', () => {
		expect(
			getCropBreakingRngGroup([
				{
					source: 'Bovine Blessing',
					op: 'add-drop',
					phase: 'produce-drops',
					amount: 1,
				},
			])
		).toBe('Bovine Blessing');
	});

	test('keeps RNG items without a single producer under Rare Crop Output', () => {
		expect(getCropBreakingRngGroup(undefined)).toBe('Rare Crop Output');
		expect(
			getCropBreakingRngGroup([
				{ source: 'One', op: 'add-drop', phase: 'produce-drops', amount: 1 },
				{ source: 'Two', op: 'add-drop', phase: 'produce-drops', amount: 1 },
			])
		).toBe('Rare Crop Output');
	});
});

describe('Farm Phase details', () => {
	test('shows repellent, Finnegan, and named flat cooldown sources separately', () => {
		const result = new PestFarmingRateCalculator({
			player: new PestFarmingPlayer({ attributes: { pest_cooldown: 999 } }),
			options: {
				crop: Crop.Wheat,
				cycle: {
					...DEFAULT_PEST_CYCLE_SETTINGS,
					pestRepellent: 'normal',
					finneganActive: true,
				},
			},
		}).calculate();
		result.phaseStats.spawnPestCooldownReductionBreakdown = { 'Pesthunter Gear': 10 };
		const details = buildFarmPhaseDetails(
			result,
			(value, maximumFractionDigits = 0) => value.toFixed(maximumFractionDigits),
			(seconds) => `${seconds}s`
		);
		const lines = details.groups.flatMap((group) => group.lines);

		expect(lines).toContainEqual(expect.objectContaining({ label: 'Pest Repellent', value: '×2' }));
		expect(lines).toContainEqual({ label: 'Pesthunter Gear', value: '-10.00%', itemName: true });
		expect(lines).toContainEqual(expect.objectContaining({ label: 'Finnegan', value: '-20%' }));
		expect(lines).toContainEqual(expect.objectContaining({ label: 'Moth Shard', value: '-5.0s', itemName: true }));
		expect(lines).toContainEqual(
			expect.objectContaining({ label: 'Farm Phase', value: `${result.debug.farmSeconds}s` })
		);
		expect(lines.some((line) => /minimum|maximum/i.test(line.label))).toBe(false);
		expect(lines.find((line) => line.label === 'Pest Cooldown')?.detail).toBeUndefined();

		const model = buildPestRateBreakdown({
			result,
			priceBook: { version: 'test', missingItemMode: 'zero' },
			items: {},
			formatNumber: (value, maximumFractionDigits = 0) => value.toFixed(maximumFractionDigits),
			formatDuration: (seconds) => `${seconds}s`,
		});
		expect(model.summary.map((metric) => metric.label)).toContain('Pest Mix');
		expect(model.cooldown).toMatchObject({ label: 'Cooldown', value: `${result.debug.cooldownSeconds}s` });
		expect(model.phaseAssumptions.map((metric) => metric.label)).toEqual([
			'Farm Phase',
			'Spawn Phase',
			'Spawn Wait',
			'Kill Phase',
		]);
	});
});
