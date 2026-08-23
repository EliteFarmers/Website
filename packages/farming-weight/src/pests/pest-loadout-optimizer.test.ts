import { expect, test, vi } from 'vitest';
import { Crop } from '../constants/crops.js';
import { Rarity } from '../constants/reforges.js';
import { FarmingPets } from '../items/pets.js';
import { PEST_FARMING_PHASES, PestFarmingPhase, PestFarmingPlayer } from '../player/pestfarmingplayer.js';
import { DEFAULT_PEST_CYCLE_SETTINGS } from './pest-farming-rate-calculator.js';
import { optimizePestLoadouts } from './pest-loadout-optimizer.js';

const emptyPriceBook = {
	version: 'test',
	items: {},
	missingItemMode: 'zero' as const,
};

test('optimizer deterministically reuses one matching Hypixel preset for equal winners', async () => {
	const player = new PestFarmingPlayer({
		armorSets: [],
		equipmentSets: [],
		loadoutPresets: [
			{ id: 'local:empty', name: 'Local Empty' },
			{ id: 'hypixel:loadout:2', name: 'Hypixel Empty' },
		],
		phasePresetIds: {
			[PestFarmingPhase.Farm]: 'local:empty',
			[PestFarmingPhase.Spawn]: 'local:empty',
			[PestFarmingPhase.Kill]: 'local:empty',
		},
	});

	const result = await optimizePestLoadouts({
		player,
		options: { crop: Crop.Wheat, cycle: DEFAULT_PEST_CYCLE_SETTINGS },
		priceBook: emptyPriceBook,
	});

	expect(player.armorSetLoadouts).toStrictEqual([]);
	expect(player.equipmentSetLoadouts).toStrictEqual([]);
	expect(result.cancelled).toBe(false);
	expect(Object.values(result.phasePresetIds)).toStrictEqual(PEST_FARMING_PHASES.map(() => 'hypixel:loadout:2'));
});

test('optimizer cancels without applying a partial result and yields within its work budget', async () => {
	const player = new PestFarmingPlayer({
		armorSets: [
			{ id: 'armor-one', name: 'Armor One', pieces: {} },
			{ id: 'armor-two', name: 'Armor Two', pieces: {} },
		],
		equipmentSets: [],
		loadoutPresets: [{ id: 'local:empty', name: 'Local Empty' }],
		phasePresetIds: {
			[PestFarmingPhase.Farm]: 'local:empty',
			[PestFarmingPhase.Spawn]: 'local:empty',
			[PestFarmingPhase.Kill]: 'local:empty',
		},
	});
	const yieldControl = vi.fn(async () => {});
	let checks = 0;
	const result = await optimizePestLoadouts({
		player,
		options: { crop: Crop.Wheat, cycle: DEFAULT_PEST_CYCLE_SETTINGS },
		priceBook: emptyPriceBook,
		batchSize: 1,
		yieldControl,
		shouldCancel: () => ++checks > 1,
	});

	expect(result.cancelled).toBe(true);
	expect(yieldControl).toHaveBeenCalled();
	expect(player.phasePresetIds[PestFarmingPhase.Farm]).toBe('local:empty');
});

test('optimizer searches loadout dimensions greedily instead of evaluating their Cartesian product', async () => {
	const armorSets = Array.from({ length: 4 }, (_, index) => ({
		id: `armor-${index}`,
		name: `Armor ${index}`,
		pieces: {},
	}));
	const equipmentSets = Array.from({ length: 4 }, (_, index) => ({
		id: `equipment-${index}`,
		name: `Equipment ${index}`,
		pieces: {},
	}));
	const player = new PestFarmingPlayer({
		armorSets,
		equipmentSets,
		loadoutPresets: [
			{
				id: 'local:current',
				name: 'Current',
				armorSetId: armorSets[0]!.id,
				equipmentSetId: equipmentSets[0]!.id,
			},
		],
		phasePresetIds: Object.fromEntries(PEST_FARMING_PHASES.map((phase) => [phase, 'local:current'])) as Record<
			PestFarmingPhase,
			string
		>,
	});

	const result = await optimizePestLoadouts({
		player,
		options: { crop: Crop.Wheat, cycle: DEFAULT_PEST_CYCLE_SETTINGS },
		priceBook: emptyPriceBook,
	});

	// Four alternatives per armor/equipment dimension, for each of three phases.
	expect(result.evaluated).toBe(24);
	expect(Object.values(result.phasePresetIds)).toStrictEqual(PEST_FARMING_PHASES.map(() => 'local:current'));
});

test('optimizer materializes a profitable pet instead of scoring it through the empty pet choice', async () => {
	const player = new PestFarmingPlayer({
		strength: 1600,
		pets: [
			{
				uuid: 'mooshroom',
				type: FarmingPets.MooshroomCow,
				tier: Rarity.Legendary,
				exp: 18_867_000,
			},
		],
		armorSets: [],
		equipmentSets: [],
		loadoutPresets: [{ id: 'local:empty', name: 'No Pet' }],
		phasePresetIds: Object.fromEntries(PEST_FARMING_PHASES.map((phase) => [phase, 'local:empty'])) as Record<
			PestFarmingPhase,
			string
		>,
	});

	const result = await optimizePestLoadouts({
		player,
		options: { crop: Crop.Wheat, cycle: DEFAULT_PEST_CYCLE_SETTINGS },
		priceBook: {
			version: 'crops',
			missingItemMode: 'zero',
			items: {
				[Crop.Wheat]: { coins: 6, source: 'npc' },
				[Crop.Mushroom]: { coins: 10, source: 'npc' },
			},
		},
	});
	const farmPreset = result.presets.find((preset) => preset.id === result.phasePresetIds[PestFarmingPhase.Farm]);

	expect(farmPreset?.petId).toBe('mooshroom');
});
