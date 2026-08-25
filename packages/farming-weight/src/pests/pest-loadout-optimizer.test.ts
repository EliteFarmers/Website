import { expect, test, vi } from 'vitest';
import { Crop } from '../constants/crops.js';
import { Rarity } from '../constants/reforges.js';
import { Stat } from '../constants/stats.js';
import { FarmingArmor } from '../fortune/farmingarmor.js';
import { FarmingEquipment } from '../fortune/farmingequipment.js';
import { FARMING_ARMOR_INFO } from '../items/armor.js';
import { FarmingPets } from '../items/pets.js';
import { GearSlot } from '../items/definitions.js';
import { FARMING_EQUIPMENT_INFO } from '../items/equipment.js';
import { PEST_FARMING_PHASES, PestFarmingPhase, PestFarmingPlayer } from '../player/pestfarmingplayer.js';
import { DEFAULT_PEST_CYCLE_SETTINGS, PestFarmingRateCalculator } from './pest-farming-rate-calculator.js';
import { PEST_DROP_DEFINITIONS } from './pest-drops.js';
import { optimizePestLoadouts } from './pest-loadout-optimizer.js';

const emptyPriceBook = {
	version: 'test',
	items: {},
	missingItemMode: 'zero' as const,
};
const pestOutputIds = [
	...new Set(
		Object.values(PEST_DROP_DEFINITIONS).flatMap((definition) => [
			...definition.guaranteedDrops.map((drop) => drop.itemId),
			...(definition.rareDrops ?? []).map((drop) => drop.itemId),
			...(definition.feastRareDrop ? [definition.feastRareDrop.itemId] : []),
		])
	),
];

function armorItem(uuid: string) {
	const armor = FarmingArmor.fakeItem(FARMING_ARMOR_INFO.FERMENTO_HELMET!)!;
	armor.item.uuid = uuid;
	return armor.item;
}

function reforgedArmorItem(id: keyof typeof FARMING_ARMOR_INFO, uuid: string, modifier: string, rarity?: Rarity) {
	const armor = FarmingArmor.fakeItem(FARMING_ARMOR_INFO[id]!)!;
	armor.item.uuid = uuid;
	armor.item.attributes = {
		...armor.item.attributes,
		modifier,
		...(rarity ? { rarity } : { rarity_upgrades: '1' }),
	};
	return armor.item;
}

function equipmentItem(id: keyof typeof FARMING_EQUIPMENT_INFO, uuid: string, modifier?: string) {
	const equipment = FarmingEquipment.fakeItem(FARMING_EQUIPMENT_INFO[id]!)!;
	equipment.item.uuid = uuid;
	equipment.item.attributes = {
		...equipment.item.attributes,
		...(modifier ? { modifier, rarity_upgrades: '1' } : {}),
	};
	equipment.item.enchantments = modifier ? { green_thumb: 5 } : equipment.item.enchantments;
	return equipment.item;
}

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
		armor: [armorItem('armor-one'), armorItem('armor-two')],
		armorSets: [
			{ id: 'armor-one', name: 'Armor One', pieces: { [GearSlot.Helmet]: 'armor-one' } },
			{ id: 'armor-two', name: 'Armor Two', pieces: { [GearSlot.Helmet]: 'armor-two' } },
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
		pieces: { [GearSlot.Helmet]: `armor-piece-${index}` },
	}));
	const equipmentSets = Array.from({ length: 4 }, (_, index) => ({
		id: `equipment-${index}`,
		name: `Equipment ${index}`,
		pieces: { [GearSlot.Belt]: `equipment-piece-${index}` },
	}));
	const player = new PestFarmingPlayer({
		armor: armorSets.map((_, index) => armorItem(`armor-piece-${index}`)),
		equipment: equipmentSets.map((_, index) => equipmentItem('BLOSSOM_BELT', `equipment-piece-${index}`)),
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

	// Three alternatives per armor/equipment dimension, for each of three phases.
	expect(result.evaluated).toBe(18);
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

test('optimizer does not leave phases empty when usable armor and pets exist', async () => {
	const player = new PestFarmingPlayer({
		pets: [
			{
				uuid: 'elephant',
				type: FarmingPets.Elephant,
				tier: Rarity.Legendary,
				exp: 18_867_000,
			},
		],
		armor: [armorItem('owned-helmet')],
		armorSets: [
			{ id: 'empty-import', name: 'Empty Imported Set', pieces: {} },
			{ id: 'owned-armor', name: 'Owned Armor', pieces: { [GearSlot.Helmet]: 'owned-helmet' } },
		],
		equipmentSets: [],
		loadoutPresets: [{ id: 'hypixel:empty', name: 'Empty Hypixel Loadout' }],
		phasePresetIds: Object.fromEntries(PEST_FARMING_PHASES.map((phase) => [phase, 'hypixel:empty'])) as Record<
			PestFarmingPhase,
			string
		>,
	});

	const result = await optimizePestLoadouts({
		player,
		options: { crop: Crop.Wheat, cycle: DEFAULT_PEST_CYCLE_SETTINGS },
		priceBook: emptyPriceBook,
	});

	for (const phase of PEST_FARMING_PHASES) {
		const preset = result.presets.find((candidate) => candidate.id === result.phasePresetIds[phase]);
		expect(preset?.armorSetId).toBe('owned-armor');
		expect(preset?.petId).toBe('elephant');
	}
});

test('optimizer never assigns distinct sets that reuse the same physical pieces', async () => {
	const player = new PestFarmingPlayer({
		armor: [armorItem('shared-helmet'), armorItem('second-helmet')],
		equipment: [equipmentItem('BLOSSOM_BELT', 'shared-belt'), equipmentItem('PESTHUNTERS_BELT', 'second-belt')],
		armorSets: [
			{ id: 'armor-a', name: 'Armor A', pieces: { [GearSlot.Helmet]: 'shared-helmet' } },
			{ id: 'armor-b', name: 'Armor B', pieces: { [GearSlot.Helmet]: 'shared-helmet' } },
			{ id: 'armor-c', name: 'Armor C', pieces: { [GearSlot.Helmet]: 'second-helmet' } },
		],
		equipmentSets: [
			{ id: 'equipment-a', name: 'Equipment A', pieces: { [GearSlot.Belt]: 'shared-belt' } },
			{ id: 'equipment-b', name: 'Equipment B', pieces: { [GearSlot.Belt]: 'shared-belt' } },
			{ id: 'equipment-c', name: 'Equipment C', pieces: { [GearSlot.Belt]: 'second-belt' } },
		],
		loadoutPresets: [
			{ id: 'farm', name: 'Farm', armorSetId: 'armor-a', equipmentSetId: 'equipment-a' },
			{ id: 'spawn', name: 'Spawn', armorSetId: 'armor-b', equipmentSetId: 'equipment-b' },
			{ id: 'kill', name: 'Kill', armorSetId: 'armor-c', equipmentSetId: 'equipment-c' },
		],
		phasePresetIds: {
			[PestFarmingPhase.Farm]: 'farm',
			[PestFarmingPhase.Spawn]: 'spawn',
			[PestFarmingPhase.Kill]: 'kill',
		},
	});

	const result = await optimizePestLoadouts({
		player,
		options: { crop: Crop.Wheat, cycle: DEFAULT_PEST_CYCLE_SETTINGS },
		priceBook: emptyPriceBook,
	});
	const selected = PEST_FARMING_PHASES.map((phase) =>
		result.presets.find((preset) => preset.id === result.phasePresetIds[phase])
	);
	const distinctArmorSets = [...new Set(selected.map((preset) => preset?.armorSetId).filter(Boolean))];
	const distinctEquipmentSets = [...new Set(selected.map((preset) => preset?.equipmentSetId).filter(Boolean))];
	const armorUuids = distinctArmorSets.flatMap((setId) =>
		Object.values(player.getArmorSetLoadout(setId)?.pieces ?? {}).filter(Boolean)
	);
	const equipmentUuids = distinctEquipmentSets.flatMap((setId) =>
		Object.values(player.getEquipmentSetLoadout(setId)?.pieces ?? {}).filter(Boolean)
	);

	expect(new Set(armorUuids).size).toBe(armorUuids.length);
	expect(new Set(equipmentUuids).size).toBe(equipmentUuids.length);
});

test('optimizer assigns maxed Blossom to farm and maxed Pesthunter to spawn and kill', async () => {
	const slots = [GearSlot.Necklace, GearSlot.Cloak, GearSlot.Belt, GearSlot.Gloves] as const;
	const blossomIds = ['BLOSSOM_NECKLACE', 'BLOSSOM_CLOAK', 'BLOSSOM_BELT', 'BLOSSOM_BRACELET'] as const;
	const pesthunterIds = [
		'PESTHUNTERS_NECKLACE',
		'PESTHUNTERS_CLOAK',
		'PESTHUNTERS_BELT',
		'PESTHUNTERS_GLOVES',
	] as const;
	const equipment = [
		...blossomIds.map((id, index) => equipmentItem(id, `blossom-${index}`, 'rooted')),
		...pesthunterIds.map((id, index) => equipmentItem(id, `pesthunter-${index}`, 'squeaky')),
	];
	const player = new PestFarmingPlayer({
		uniqueVisitors: 1000,
		equipment,
		armorSets: [],
		equipmentSets: [
			{
				id: 'blossom',
				name: 'Maxed Blossom',
				pieces: Object.fromEntries(slots.map((slot, index) => [slot, `blossom-${index}`])),
			},
			{
				id: 'pesthunter',
				name: 'Maxed Pesthunter',
				pieces: Object.fromEntries(slots.map((slot, index) => [slot, `pesthunter-${index}`])),
			},
		],
		loadoutPresets: [
			{ id: 'blossom', name: 'Blossom', equipmentSetId: 'blossom' },
			{ id: 'pesthunter', name: 'Pesthunter', equipmentSetId: 'pesthunter' },
		],
		phasePresetIds: Object.fromEntries(PEST_FARMING_PHASES.map((phase) => [phase, 'pesthunter'])) as Record<
			PestFarmingPhase,
			string
		>,
	});
	const blossomKillPlayer = player.clone();
	expect(blossomKillPlayer.setPhasePreset(PestFarmingPhase.Kill, 'blossom')).toBe(true);
	expect(blossomKillPlayer.getPhaseStat(PestFarmingPhase.Kill, Stat.FarmingFortune)).toBeGreaterThan(
		player.getPhaseStat(PestFarmingPhase.Kill, Stat.FarmingFortune)
	);
	expect(
		player.getPhaseStat(PestFarmingPhase.Kill, Stat.FarmingFortune) +
			player.getPhaseStat(PestFarmingPhase.Kill, Stat.PestKillFortune)
	).toBeGreaterThan(
		blossomKillPlayer.getPhaseStat(PestFarmingPhase.Kill, Stat.FarmingFortune) +
			blossomKillPlayer.getPhaseStat(PestFarmingPhase.Kill, Stat.PestKillFortune)
	);
	const options = { crop: Crop.Wheat, cycle: DEFAULT_PEST_CYCLE_SETTINGS };
	const priceBook = {
		version: 'complete-pest-value',
		missingItemMode: 'zero' as const,
		items: {
			[Crop.Wheat]: { coins: 6, source: 'npc' as const },
			...Object.fromEntries(pestOutputIds.map((itemId) => [itemId, { coins: 1_000, source: 'manual' as const }])),
		},
	};
	const result = await optimizePestLoadouts({
		player,
		options,
		priceBook,
	});
	const selectedEquipment = (phase: PestFarmingPhase) =>
		result.presets.find((preset) => preset.id === result.phasePresetIds[phase])?.equipmentSetId;

	expect(selectedEquipment(PestFarmingPhase.Farm)).toBe('blossom');
	expect(selectedEquipment(PestFarmingPhase.Spawn)).toBe('pesthunter');
	expect(selectedEquipment(PestFarmingPhase.Kill)).toBe('pesthunter');
});

test('optimizer evaluates coupled Mantid spawn and kill armor changes', async () => {
	const player = new PestFarmingPlayer({
		attributes: { pest_cooldown: 999, pest_fortune: 999 },
		temporaryFortune: { pestTurnIn: 10_000 },
		tools: [
			{
				name: '§6InfiniVacuum™ Hooverius',
				skyblockId: 'INFINI_VACUUM_HOOVERIUS',
				uuid: 'mantid-test-vacuum',
				lore: [],
				attributes: { rarity: Rarity.Legendary, modifier: 'beady' },
				enchantments: { bug_blender: 5 },
				gems: {},
			},
		],
		pets: [
			{
				uuid: 'mantid-test-hedgehog',
				type: FarmingPets.Hedgehog,
				tier: Rarity.Legendary,
				exp: 18_867_000,
			},
		],
		armor: [
			reforgedArmorItem('HELIANTHUS_HELMET', 'spawn-plain', 'mossy', Rarity.Common),
			reforgedArmorItem('HELIANTHUS_HELMET', 'spawn-mantid', 'mantid', Rarity.Common),
			reforgedArmorItem('FERMENTO_CHESTPLATE', 'kill-plain', 'mossy', Rarity.Common),
			reforgedArmorItem('FERMENTO_CHESTPLATE', 'kill-mantid', 'mantid', Rarity.Common),
		],
		armorSets: [
			{ id: 'spawn-plain', name: 'Spawn Plain', pieces: { [GearSlot.Helmet]: 'spawn-plain' } },
			{ id: 'spawn-mantid', name: 'Spawn Mantid', pieces: { [GearSlot.Helmet]: 'spawn-mantid' } },
			{ id: 'kill-plain', name: 'Kill Plain', pieces: { [GearSlot.Chestplate]: 'kill-plain' } },
			{ id: 'kill-mantid', name: 'Kill Mantid', pieces: { [GearSlot.Chestplate]: 'kill-mantid' } },
		],
		equipmentSets: [],
		loadoutPresets: [
			{ id: 'spawn', name: 'Spawn', armorSetId: 'spawn-plain', petId: 'mantid-test-hedgehog' },
			{ id: 'kill', name: 'Kill', armorSetId: 'kill-plain', petId: 'mantid-test-hedgehog' },
		],
		phasePresetIds: {
			[PestFarmingPhase.Farm]: 'kill',
			[PestFarmingPhase.Spawn]: 'spawn',
			[PestFarmingPhase.Kill]: 'kill',
		},
	});
	const options = { crop: Crop.Wheat, cycle: DEFAULT_PEST_CYCLE_SETTINGS };
	const rateFor = (priceBook: typeof emptyPriceBook, spawnArmorSetId: string, killArmorSetId: string) => {
		const candidate = player.clone();
		candidate.setPhaseArmorSet(PestFarmingPhase.Spawn, spawnArmorSetId);
		candidate.setPhaseArmorSet(PestFarmingPhase.Kill, killArmorSetId);
		return new PestFarmingRateCalculator({ player: candidate, options, priceBook }).calculate().valuation
			.coinsPerHour;
	};
	let coupledPriceBook: typeof emptyPriceBook | undefined;
	for (const cropPrice of [6, 60, 600]) {
		for (const pestOutputPrice of [10, 100, 1_000, 10_000, 100_000]) {
			const priceBook = {
				version: `${cropPrice}:${pestOutputPrice}`,
				missingItemMode: 'zero' as const,
				items: {
					[Crop.Wheat]: { coins: cropPrice, source: 'npc' as const },
					...Object.fromEntries(
						pestOutputIds.map((itemId) => [itemId, { coins: pestOutputPrice, source: 'manual' as const }])
					),
				},
			};
			const plain = rateFor(priceBook, 'spawn-plain', 'kill-plain');
			const spawnOnly = rateFor(priceBook, 'spawn-mantid', 'kill-plain');
			const killOnly = rateFor(priceBook, 'spawn-plain', 'kill-mantid');
			const coupled = rateFor(priceBook, 'spawn-mantid', 'kill-mantid');
			if (coupled > plain && coupled >= spawnOnly && coupled >= killOnly) {
				coupledPriceBook = priceBook;
				break;
			}
		}
		if (coupledPriceBook) break;
	}
	expect(coupledPriceBook).toBeDefined();

	const result = await optimizePestLoadouts({ player, options, priceBook: coupledPriceBook! });
	const selectedArmor = (phase: PestFarmingPhase) =>
		result.presets.find((preset) => preset.id === result.phasePresetIds[phase])?.armorSetId;

	expect(selectedArmor(PestFarmingPhase.Spawn)).toBe('spawn-mantid');
	expect(selectedArmor(PestFarmingPhase.Kill)).toBe('kill-mantid');
});
