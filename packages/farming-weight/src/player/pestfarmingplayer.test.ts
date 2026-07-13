import { expect, test } from 'vitest';
import { Crop } from '../constants/crops.js';
import { Rarity } from '../constants/reforges.js';
import { Stat } from '../constants/stats.js';
import { FarmingArmor } from '../fortune/farmingarmor.js';
import { FarmingEquipment } from '../fortune/farmingequipment.js';
import { FarmingTool } from '../fortune/farmingtool.js';
import type { EliteItemDto } from '../fortune/item.js';
import { Vacuum } from '../fortune/vacuum.js';
import { FARMING_ARMOR_INFO } from '../items/armor.js';
import { GearSlot } from '../items/definitions.js';
import { FARMING_EQUIPMENT_INFO } from '../items/equipment.js';
import { FarmingPets, type FarmingPetType } from '../items/pets.js';
import { FARMING_TOOLS } from '../items/tools.js';
import { PEST_FARMING_PHASE_STATS, PestFarmingPhase, PestFarmingPlayer } from './pestfarmingplayer.js';

function armor(id: keyof typeof FARMING_ARMOR_INFO, uuid: string, slot?: string) {
	const item = FarmingArmor.fakeItem(FARMING_ARMOR_INFO[id]!)!;
	item.item.uuid = uuid;
	item.item.slot = slot;
	return item;
}

function equipment(id: keyof typeof FARMING_EQUIPMENT_INFO, uuid: string) {
	const item = FarmingEquipment.fakeItem(FARMING_EQUIPMENT_INFO[id]!)!;
	item.item.uuid = uuid;
	return item;
}

function tool(id: keyof typeof FARMING_TOOLS, uuid: string, overrides: Partial<EliteItemDto> = {}): EliteItemDto {
	const item = FarmingTool.fakeItem(FARMING_TOOLS[id]!)!;
	item.item.uuid = uuid;
	item.item.enchantments = overrides.enchantments ?? item.item.enchantments;
	item.item.attributes = { ...item.item.attributes, ...(overrides.attributes ?? {}) };
	item.item.gems = overrides.gems ?? item.item.gems;
	return item.item;
}

function pet(type: FarmingPets, uuid: string, heldItem?: string): FarmingPetType {
	return {
		uuid,
		type,
		tier: Rarity.Legendary,
		exp: 18_867_000,
		heldItem,
	};
}

function vacuum(id: string, overrides: Partial<EliteItemDto> = {}): EliteItemDto {
	return {
		name: id === 'INFINI_VACUUM_HOOVERIUS' ? '§6InfiniVacuum™ Hooverius' : `§f${id}`,
		skyblockId: id,
		uuid: id,
		lore: [],
		attributes: { rarity: Rarity.Legendary, ...(overrides.attributes ?? {}) },
		enchantments: overrides.enchantments ?? {},
		gems: overrides.gems ?? {},
		...overrides,
	};
}

test('phase loadouts use phase armor, shared equipment, and independent pets', () => {
	const player = new PestFarmingPlayer({
		armor: [
			armor('HELIANTHUS_HELMET', 'main-helmet'),
			armor('HELIANTHUS_CHESTPLATE', 'main-chestplate'),
			armor('FERMENTO_HELMET', 'spawn-helmet'),
		],
		equipment: [equipment('BLOSSOM_BELT', 'blossom-belt'), equipment('PESTHUNTERS_BELT', 'pesthunter-belt')],
		pets: [
			pet(FarmingPets.Elephant, 'elephant'),
			pet(FarmingPets.Mosquito, 'mosquito', 'BROWN_BANDANA'),
			pet(FarmingPets.Hedgehog, 'hedgehog'),
		],
		armorSets: [
			{
				id: 'main',
				name: 'Main Armor',
				pieces: {
					[GearSlot.Helmet]: 'main-helmet',
					[GearSlot.Chestplate]: 'main-chestplate',
				},
			},
			{
				id: 'spawn',
				name: 'Spawn Armor',
				pieces: {
					[GearSlot.Helmet]: 'spawn-helmet',
				},
			},
		],
		phaseLoadouts: {
			[PestFarmingPhase.Farm]: { armorSetId: 'main', petId: 'elephant' },
			[PestFarmingPhase.Spawn]: { armorSetId: 'spawn', petId: 'mosquito' },
			[PestFarmingPhase.Kill]: { armorSetId: 'main', petId: 'hedgehog' },
		},
		sharedEquipment: {
			[GearSlot.Belt]: 'pesthunter-belt',
		},
	});

	expect(player.getPhaseArmorSet(PestFarmingPhase.Farm).helmet?.item.uuid).toBe('main-helmet');
	expect(player.getPhaseArmorSet(PestFarmingPhase.Kill).helmet?.item.uuid).toBe('main-helmet');
	expect(player.getPhaseArmorSet(PestFarmingPhase.Spawn).helmet?.item.uuid).toBe('spawn-helmet');

	for (const phase of [PestFarmingPhase.Farm, PestFarmingPhase.Spawn, PestFarmingPhase.Kill]) {
		expect(player.getPhaseArmorSet(phase).belt?.item.uuid).toBe('pesthunter-belt');
	}

	expect(player.getPhasePlayer(PestFarmingPhase.Farm).selectedPet?.pet.uuid).toBe('elephant');
	expect(player.getPhasePlayer(PestFarmingPhase.Spawn).selectedPet?.pet.uuid).toBe('mosquito');
	expect(player.getPhasePlayer(PestFarmingPhase.Kill).selectedPet?.pet.uuid).toBe('hedgehog');
});

test('default shared equipment prefers pest equipment over generic farming fortune', () => {
	const player = new PestFarmingPlayer({
		equipment: [
			equipment('BLOSSOM_BELT', 'blossom-belt'),
			equipment('PESTHUNTERS_BELT', 'pesthunter-belt'),
			equipment('BLOSSOM_CLOAK', 'blossom-cloak'),
			equipment('PEST_VEST', 'pest-vest'),
		],
	});

	expect(player.sharedEquipment[GearSlot.Belt]).toBe('pesthunter-belt');
	expect(player.sharedEquipment[GearSlot.Cloak]).toBe('pest-vest');
});

test('default pest armor loadouts prefer equipped and separate wardrobe sets before loose pieces', () => {
	const player = new PestFarmingPlayer({
		armor: [
			armor('FERMENTO_HELMET', 'main-helmet', 'armor:0'),
			armor('FERMENTO_CHESTPLATE', 'main-chestplate', 'armor:1'),
			armor('FERMENTO_LEGGINGS', 'main-leggings', 'armor:2'),
			armor('FERMENTO_BOOTS', 'main-boots', 'armor:3'),
			armor('CROPIE_HELMET', 'spawn-helmet', 'wardrobe:0:HELMET'),
			armor('CROPIE_CHESTPLATE', 'spawn-chestplate', 'wardrobe:0:CHESTPLATE'),
			armor('CROPIE_LEGGINGS', 'spawn-leggings', 'wardrobe:0:LEGGINGS'),
			armor('CROPIE_BOOTS', 'spawn-boots', 'wardrobe:0:BOOTS'),
			armor('HELIANTHUS_HELMET', 'loose-helmet'),
			armor('HELIANTHUS_CHESTPLATE', 'loose-chestplate'),
		],
	});

	expect(player.getArmorSetLoadout('main')?.pieces[GearSlot.Helmet]).toBe('main-helmet');
	expect(player.getArmorSetLoadout('main')?.pieces[GearSlot.Chestplate]).toBe('main-chestplate');
	expect(player.getArmorSetLoadout('main')?.pieces[GearSlot.Leggings]).toBe('main-leggings');
	expect(player.getArmorSetLoadout('main')?.pieces[GearSlot.Boots]).toBe('main-boots');

	expect(player.getArmorSetLoadout('spawn')?.pieces[GearSlot.Helmet]).toBe('spawn-helmet');
	expect(player.getArmorSetLoadout('spawn')?.pieces[GearSlot.Chestplate]).toBe('spawn-chestplate');
	expect(player.getArmorSetLoadout('spawn')?.pieces[GearSlot.Leggings]).toBe('spawn-leggings');
	expect(player.getArmorSetLoadout('spawn')?.pieces[GearSlot.Boots]).toBe('spawn-boots');
	expect(player.getPhaseArmorSet(PestFarmingPhase.Spawn).helmet?.item.uuid).toBe('spawn-helmet');
});

test('default spawn phase uses the separate armor set when available', () => {
	const player = new PestFarmingPlayer({
		armor: [
			armor('FERMENTO_HELMET', 'main-helmet'),
			armor('FERMENTO_CHESTPLATE', 'main-chestplate'),
			armor('FERMENTO_LEGGINGS', 'main-leggings'),
			armor('FERMENTO_BOOTS', 'main-boots'),
			armor('HELIANTHUS_HELMET', 'spawn-helmet'),
			armor('HELIANTHUS_CHESTPLATE', 'spawn-chestplate'),
			armor('HELIANTHUS_LEGGINGS', 'spawn-leggings'),
			armor('HELIANTHUS_BOOTS', 'spawn-boots'),
		],
		armorSets: [
			{
				id: 'main',
				name: 'Main Armor',
				pieces: {
					[GearSlot.Helmet]: 'main-helmet',
					[GearSlot.Chestplate]: 'main-chestplate',
					[GearSlot.Leggings]: 'main-leggings',
					[GearSlot.Boots]: 'main-boots',
				},
			},
			{
				id: 'spawn',
				name: 'Spawn Armor',
				pieces: {
					[GearSlot.Helmet]: 'spawn-helmet',
					[GearSlot.Chestplate]: 'spawn-chestplate',
					[GearSlot.Leggings]: 'spawn-leggings',
					[GearSlot.Boots]: 'spawn-boots',
				},
			},
		],
	});

	expect(player.phaseLoadouts[PestFarmingPhase.Spawn].armorSetId).toBe('spawn');
	expect(player.getPhaseArmorSet(PestFarmingPhase.Spawn).helmet?.item.uuid).toBe('spawn-helmet');
});

test('default spawn phase keeps the generated spawn armor set as a rate-selection candidate', () => {
	const player = new PestFarmingPlayer({
		armor: [
			armor('FERMENTO_HELMET', 'main-helmet'),
			armor('FERMENTO_CHESTPLATE', 'main-chestplate'),
			armor('FERMENTO_LEGGINGS', 'main-leggings'),
			armor('FERMENTO_BOOTS', 'main-boots'),
			armor('CROPIE_HELMET', 'spawn-helmet'),
			armor('CROPIE_CHESTPLATE', 'spawn-chestplate'),
			armor('CROPIE_LEGGINGS', 'spawn-leggings'),
			armor('CROPIE_BOOTS', 'spawn-boots'),
		],
		armorSets: [
			{
				id: 'main',
				name: 'Main Armor',
				pieces: {
					[GearSlot.Helmet]: 'main-helmet',
					[GearSlot.Chestplate]: 'main-chestplate',
					[GearSlot.Leggings]: 'main-leggings',
					[GearSlot.Boots]: 'main-boots',
				},
			},
			{
				id: 'spawn',
				name: 'Spawn Armor',
				pieces: {
					[GearSlot.Helmet]: 'spawn-helmet',
					[GearSlot.Chestplate]: 'spawn-chestplate',
					[GearSlot.Leggings]: 'spawn-leggings',
					[GearSlot.Boots]: 'spawn-boots',
				},
			},
		],
	});

	expect(player.phaseLoadouts[PestFarmingPhase.Spawn].armorSetId).toBe('spawn');
	expect(player.getPhaseArmorSet(PestFarmingPhase.Spawn).helmet?.item.uuid).toBe('spawn-helmet');
});

test('phase armor and shared equipment progress are scoped to their loadout types', () => {
	const player = new PestFarmingPlayer({
		armor: [armor('HELIANTHUS_HELMET', 'main-helmet')],
		equipment: [equipment('BLOSSOM_BELT', 'blossom-belt')],
		armorSets: [
			{
				id: 'main',
				name: 'Main Armor',
				pieces: {
					[GearSlot.Helmet]: 'main-helmet',
				},
			},
		],
		sharedEquipment: {
			[GearSlot.Belt]: 'blossom-belt',
		},
	});

	const armorProgressNames = player.getArmorSetProgress('main', [Stat.FarmingFortune]).map((entry) => entry.name);
	const equipmentProgressNames = player
		.getSharedEquipmentProgress([Stat.FarmingFortune, Stat.BonusPestChance])
		.map((entry) => entry.name);

	expect(armorProgressNames).toContain('Helmet');
	expect(armorProgressNames).toContain('Armor Set Bonus');
	expect(armorProgressNames).not.toContain('Belt');
	expect(armorProgressNames).not.toContain('Equipment Set Bonus');

	expect(equipmentProgressNames).toContain('Belt');
	expect(equipmentProgressNames).not.toContain('Helmet');
	expect(equipmentProgressNames).not.toContain('Armor Set Bonus');
});

test('farm phase includes pest cooldown reduction as a relevant phase stat', () => {
	const player = new PestFarmingPlayer({
		equipment: [equipment('PESTHUNTERS_CLOAK', 'pesthunter-cloak')],
		sharedEquipment: {
			[GearSlot.Cloak]: 'pesthunter-cloak',
		},
	});

	const view = player.getPhaseStatView(PestFarmingPhase.Farm);
	const farmCooldownUpgrades = player.getPhaseUpgrades(PestFarmingPhase.Farm);

	expect(PEST_FARMING_PHASE_STATS[PestFarmingPhase.Farm]).toContain(Stat.PestCooldownReduction);
	expect(view.totals[Stat.PestCooldownReduction]).toBe(10);
	expect(view.upgrades.some((upgrade) => !!upgrade.stats?.[Stat.PestCooldownReduction])).toBe(true);
	expect(farmCooldownUpgrades.some((upgrade) => !!upgrade.stats?.[Stat.PestCooldownReduction])).toBe(true);
});

test('kill phase excludes farming tool upgrades while farm phase still includes them', () => {
	const wheatToolUuid = 'wheat-tool';
	const player = new PestFarmingPlayer({
		selectedCrop: Crop.Wheat,
		tools: [tool('THEORETICAL_HOE_WHEAT_1', wheatToolUuid)],
	});

	const farmUpgrades = player.getPhaseUpgrades(PestFarmingPhase.Farm);
	const killUpgrades = player.getPhaseUpgrades(PestFarmingPhase.Kill);
	const killProgress = player.getPhaseProgress(PestFarmingPhase.Kill);

	expect(farmUpgrades.some((upgrade) => upgrade.meta?.itemUuid === wheatToolUuid)).toBe(true);
	expect(killUpgrades.some((upgrade) => upgrade.meta?.itemUuid === wheatToolUuid)).toBe(false);
	expect(killProgress.some((progress) => progress.item?.uuid === wheatToolUuid)).toBe(false);
});

test('kill phase only surfaces selected crop fortune upgrades', () => {
	const player = new PestFarmingPlayer({
		selectedCrop: Crop.Wheat,
		tools: [tool('THEORETICAL_HOE_WHEAT_1', 'wheat-tool')],
	});

	const killStats = PEST_FARMING_PHASE_STATS[PestFarmingPhase.Kill];
	const killUpgrades = player.getPhaseUpgrades(PestFarmingPhase.Kill);
	const killProgressKeys = player
		.getPhaseProgress(PestFarmingPhase.Kill)
		.map((progress) => progress.key)
		.filter((key): key is string => key !== undefined);

	expect(killStats).not.toContain(Stat.WheatFortune);
	expect(killStats).not.toContain(Stat.CactusFortune);
	expect(new Set(killProgressKeys).size).toBe(killProgressKeys.length);
	expect(killProgressKeys.some((key) => key.includes(`kill-crop:${Crop.Wheat}:`))).toBe(true);
	expect(killProgressKeys.some((key) => key.includes(`kill-crop:${Crop.Cactus}:`))).toBe(false);
	expect(
		killUpgrades.some((upgrade) => upgrade.meta?.type === 'crop_upgrade' && upgrade.meta.key === Crop.Wheat)
	).toBe(true);
	expect(
		killUpgrades.some((upgrade) => upgrade.meta?.type === 'crop_upgrade' && upgrade.meta.key === Crop.Cactus)
	).toBe(false);
});

test('kill phase keeps vacuum upgrades after excluding farming tools', () => {
	const player = new PestFarmingPlayer({
		selectedCrop: Crop.Wheat,
		tools: [tool('THEORETICAL_HOE_WHEAT_1', 'wheat-tool'), vacuum('INFINI_VACUUM_HOOVERIUS', { enchantments: {} })],
	});

	const killUpgrades = player.getPhaseUpgrades(PestFarmingPhase.Kill);

	expect(killUpgrades.some((upgrade) => upgrade.meta?.itemUuid === 'wheat-tool')).toBe(false);
	expect(killUpgrades.some((upgrade) => upgrade.title === 'Bug Blender 1')).toBe(true);
});

test('explicitly cleared armor slots stay empty instead of being auto-filled', () => {
	const player = new PestFarmingPlayer({
		armor: [armor('HELIANTHUS_HELMET', 'main-helmet'), armor('FERMENTO_HELMET', 'spawn-helmet')],
		armorSets: [
			{
				id: 'main',
				name: 'Main Armor',
				pieces: {
					[GearSlot.Helmet]: 'main-helmet',
				},
			},
			{
				id: 'spawn',
				name: 'Spawn Armor',
				pieces: {
					[GearSlot.Helmet]: null,
				},
			},
		],
		phaseLoadouts: {
			[PestFarmingPhase.Spawn]: { armorSetId: 'spawn' },
		},
	});

	expect(player.getArmorSetLoadout('spawn')?.pieces[GearSlot.Helmet]).toBeNull();
	expect(player.getArmorSetModel('spawn')?.helmet).toBeUndefined();
	expect(player.getPhaseArmorSet(PestFarmingPhase.Spawn).helmet).toBeUndefined();
});

test('spawn phase can switch back to the main armor set even when spawn armor exists', () => {
	const player = new PestFarmingPlayer({
		armor: [armor('HELIANTHUS_HELMET', 'main-helmet'), armor('FERMENTO_HELMET', 'spawn-helmet')],
		armorSets: [
			{
				id: 'main',
				name: 'Main Armor',
				pieces: {
					[GearSlot.Helmet]: 'main-helmet',
				},
			},
			{
				id: 'spawn',
				name: 'Spawn Armor',
				pieces: {
					[GearSlot.Helmet]: 'spawn-helmet',
				},
			},
		],
		phaseLoadouts: {
			[PestFarmingPhase.Spawn]: { armorSetId: 'main' },
		},
	});

	expect(player.phaseLoadouts[PestFarmingPhase.Spawn].armorSetId).toBe('main');
	expect(player.getPhaseArmorSet(PestFarmingPhase.Spawn).helmet?.item.uuid).toBe('main-helmet');
});

test('phase armor set changes update only the selected phase loadout', () => {
	const player = new PestFarmingPlayer({
		armor: [armor('HELIANTHUS_HELMET', 'main-helmet'), armor('FERMENTO_HELMET', 'spawn-helmet')],
		equipment: [equipment('PESTHUNTERS_BELT', 'pesthunter-belt')],
		armorSets: [
			{
				id: 'main',
				name: 'Main Armor',
				pieces: {
					[GearSlot.Helmet]: 'main-helmet',
				},
			},
			{
				id: 'spawn',
				name: 'Spawn Armor',
				pieces: {
					[GearSlot.Helmet]: 'spawn-helmet',
				},
			},
		],
		phaseLoadouts: {
			[PestFarmingPhase.Farm]: { armorSetId: 'main' },
			[PestFarmingPhase.Spawn]: { armorSetId: 'spawn' },
			[PestFarmingPhase.Kill]: { armorSetId: 'main' },
		},
		sharedEquipment: {
			[GearSlot.Belt]: 'pesthunter-belt',
		},
	});

	const farmBefore = player.getPhasePlayer(PestFarmingPhase.Farm);
	const spawnBefore = player.getPhasePlayer(PestFarmingPhase.Spawn);
	const killBefore = player.getPhasePlayer(PestFarmingPhase.Kill);

	expect(player.setPhaseArmorSet(PestFarmingPhase.Spawn, 'main')).toBe(true);

	expect(player.getPhasePlayer(PestFarmingPhase.Farm)).toBe(farmBefore);
	expect(player.getPhasePlayer(PestFarmingPhase.Spawn)).toBe(spawnBefore);
	expect(player.getPhasePlayer(PestFarmingPhase.Kill)).toBe(killBefore);
	expect(player.phaseLoadouts[PestFarmingPhase.Spawn].armorSetId).toBe('main');
	expect(player.options.phaseLoadouts?.[PestFarmingPhase.Spawn]?.armorSetId).toBe('main');
	expect(player.getPhaseArmorSet(PestFarmingPhase.Spawn).helmet?.item.uuid).toBe('main-helmet');
	expect(player.getPhaseArmorSet(PestFarmingPhase.Spawn).belt?.item.uuid).toBe('pesthunter-belt');

	const currentSpawn = player.getPhasePlayer(PestFarmingPhase.Spawn);
	expect(player.setPhaseArmorSet(PestFarmingPhase.Spawn, 'missing')).toBe(false);
	expect(player.getPhasePlayer(PestFarmingPhase.Spawn)).toBe(currentSpawn);
});

test('phase pet changes update only the selected phase loadout', () => {
	const player = new PestFarmingPlayer({
		pets: [pet(FarmingPets.Elephant, 'elephant'), pet(FarmingPets.Mosquito, 'mosquito', 'BROWN_BANDANA')],
		phaseLoadouts: {
			[PestFarmingPhase.Farm]: { armorSetId: 'main', petId: 'elephant' },
			[PestFarmingPhase.Spawn]: { armorSetId: 'spawn', petId: 'mosquito' },
			[PestFarmingPhase.Kill]: { armorSetId: 'main', petId: 'elephant' },
		},
	});

	const farmBefore = player.getPhasePlayer(PestFarmingPhase.Farm);
	const spawnBefore = player.getPhasePlayer(PestFarmingPhase.Spawn);
	const killBefore = player.getPhasePlayer(PestFarmingPhase.Kill);

	expect(player.setPhasePet(PestFarmingPhase.Spawn, 'elephant')).toBe(true);

	expect(player.getPhasePlayer(PestFarmingPhase.Farm)).toBe(farmBefore);
	expect(player.getPhasePlayer(PestFarmingPhase.Spawn)).toBe(spawnBefore);
	expect(player.getPhasePlayer(PestFarmingPhase.Kill)).toBe(killBefore);
	expect(player.getPhasePlayer(PestFarmingPhase.Spawn).selectedPet?.pet.uuid).toBe('elephant');
	expect(player.options.phaseLoadouts?.[PestFarmingPhase.Spawn]?.petId).toBe('elephant');

	const currentSpawn = player.getPhasePlayer(PestFarmingPhase.Spawn);
	expect(player.setPhasePet(PestFarmingPhase.Spawn, 'missing')).toBe(false);
	expect(player.getPhasePlayer(PestFarmingPhase.Spawn)).toBe(currentSpawn);
});

test('one armor set can be reused by every phase', () => {
	const player = new PestFarmingPlayer({
		armor: [armor('HELIANTHUS_HELMET', 'main-helmet')],
		armorSets: [
			{
				id: 'main',
				name: 'Main Armor',
				pieces: {
					[GearSlot.Helmet]: 'main-helmet',
				},
			},
		],
		phaseLoadouts: {
			[PestFarmingPhase.Farm]: { armorSetId: 'main' },
			[PestFarmingPhase.Spawn]: { armorSetId: 'main' },
			[PestFarmingPhase.Kill]: { armorSetId: 'main' },
		},
	});

	expect(player.getPhaseArmorSet(PestFarmingPhase.Farm).helmet?.item.uuid).toBe('main-helmet');
	expect(player.getPhaseArmorSet(PestFarmingPhase.Spawn).helmet?.item.uuid).toBe('main-helmet');
	expect(player.getPhaseArmorSet(PestFarmingPhase.Kill).helmet?.item.uuid).toBe('main-helmet');
});

test('the empty spawn armor set remains selectable for editing', () => {
	const player = new PestFarmingPlayer({
		armor: [armor('HELIANTHUS_HELMET', 'main-helmet')],
		armorSets: [
			{
				id: 'main',
				name: 'Main Armor',
				pieces: {
					[GearSlot.Helmet]: 'main-helmet',
				},
			},
			{
				id: 'spawn',
				name: 'Spawn Armor',
				pieces: {},
			},
		],
		phaseLoadouts: {
			[PestFarmingPhase.Farm]: { armorSetId: 'spawn' },
			[PestFarmingPhase.Spawn]: { armorSetId: 'main' },
			[PestFarmingPhase.Kill]: { armorSetId: 'main' },
		},
	});

	expect(player.phaseLoadouts[PestFarmingPhase.Farm].armorSetId).toBe('spawn');
	expect(player.getPhaseArmorSet(PestFarmingPhase.Farm).helmet).toBeUndefined();
	expect(player.getArmorSetModel('spawn')).toBeDefined();
});

test('only the farm/kill and spawn armor sets are retained', () => {
	const player = new PestFarmingPlayer({
		armor: [armor('HELIANTHUS_HELMET', 'main-helmet'), armor('FERMENTO_HELMET', 'spawn-helmet')],
		armorSets: [
			{
				id: 'main',
				name: 'Main Armor',
				pieces: {
					[GearSlot.Helmet]: 'main-helmet',
				},
			},
			{
				id: 'spawn',
				name: 'Spawn Armor',
				pieces: {
					[GearSlot.Helmet]: 'spawn-helmet',
				},
			},
			{
				id: 'custom',
				name: 'Extra Armor',
				pieces: {},
			},
		],
		phaseLoadouts: {
			[PestFarmingPhase.Farm]: { armorSetId: 'custom' },
			[PestFarmingPhase.Spawn]: { armorSetId: 'spawn' },
			[PestFarmingPhase.Kill]: { armorSetId: 'custom' },
		},
	});

	expect(player.armorSetLoadouts.map((set) => set.id)).toStrictEqual(['main', 'spawn']);
	expect(player.phaseLoadouts[PestFarmingPhase.Farm].armorSetId).toBe('main');
	expect(player.phaseLoadouts[PestFarmingPhase.Spawn].armorSetId).toBe('spawn');
	expect(player.phaseLoadouts[PestFarmingPhase.Kill].armorSetId).toBe('main');
});

test('different armor sets cannot share the same armor piece', () => {
	const player = new PestFarmingPlayer({
		armor: [armor('HELIANTHUS_HELMET', 'shared-helmet')],
		armorSets: [
			{
				id: 'main',
				name: 'Main Armor',
				pieces: {
					[GearSlot.Helmet]: 'shared-helmet',
				},
			},
			{
				id: 'spawn',
				name: 'Spawn Armor',
				pieces: {
					[GearSlot.Helmet]: 'shared-helmet',
				},
			},
		],
		phaseLoadouts: {
			[PestFarmingPhase.Farm]: { armorSetId: 'main' },
			[PestFarmingPhase.Spawn]: { armorSetId: 'spawn' },
			[PestFarmingPhase.Kill]: { armorSetId: 'main' },
		},
	});

	expect(player.getArmorSetLoadout('main')?.pieces[GearSlot.Helmet]).toBe('shared-helmet');
	expect(player.getArmorSetLoadout('spawn')?.pieces[GearSlot.Helmet]).toBeUndefined();
	expect(player.getArmorSetConflict('shared-helmet', 'spawn')?.id).toBe('main');
});

test('wriggling larva contributes only to spawn phase pest chance progress and upgrades', () => {
	const player = new PestFarmingPlayer({
		wrigglingLarva: 3,
	});

	const larva = player
		.getPhaseProgress(PestFarmingPhase.Spawn, [Stat.BonusPestChance])
		.find((progress) => progress.name === 'Wriggling Larva');
	expect(larva?.stats?.[Stat.BonusPestChance]).toStrictEqual({
		current: 6,
		max: 10,
		ratio: 0.6,
	});

	const spawnUpgrade = player
		.getPhaseUpgrades(PestFarmingPhase.Spawn, { stat: Stat.BonusPestChance })
		.find((upgrade) => upgrade.title === 'Wriggling Larva');
	const farmUpgrade = player
		.getPhaseUpgrades(PestFarmingPhase.Farm, { stats: [Stat.FarmingFortune] })
		.find((upgrade) => upgrade.title === 'Wriggling Larva');

	expect(spawnUpgrade?.stats?.[Stat.BonusPestChance]).toBe(2);
	expect(farmUpgrade).toBeUndefined();
});

test('vacuum stats and upgrades are scoped to the kill phase', () => {
	const player = new PestFarmingPlayer({
		tools: [vacuum('INFINI_VACUUM_HOOVERIUS', { enchantments: { bug_blender: 3 } })],
	});

	expect(player.getPhasePlayer(PestFarmingPhase.Farm).tools).toHaveLength(0);
	expect(player.vacuums).toHaveLength(1);
	expect(player.getPhaseStat(PestFarmingPhase.Kill, Stat.PestKillFortune)).toBe(60);
	expect(player.getPhaseStat(PestFarmingPhase.Spawn, Stat.PestKillFortune)).toBe(0);

	const progress = player.getVacuumProgress([Stat.PestKillFortune, Stat.Damage]);
	expect(progress.find((entry) => entry.name === 'Base Stats')?.stats?.[Stat.Damage]?.current).toBe(250);
	expect(progress.find((entry) => entry.name === 'Bug Blender')?.stats?.[Stat.PestKillFortune]?.current).toBe(60);

	expect(
		player
			.getPhaseUpgrades(PestFarmingPhase.Spawn, { stat: Stat.PestKillFortune })
			.some((entry) => entry.title === 'Bug Blender 1')
	).toBe(false);

	const upgradePlayer = new PestFarmingPlayer({
		vacuums: [new Vacuum(vacuum('INFINI_VACUUM_HOOVERIUS'))],
	});
	const upgrade = upgradePlayer
		.getPhaseUpgrades(PestFarmingPhase.Kill, { stat: Stat.PestKillFortune })
		.find((entry) => entry.title === 'Bug Blender 1');

	expect(upgrade).toBeDefined();
	upgradePlayer.applyPhaseUpgrade(PestFarmingPhase.Kill, upgrade!);

	expect(upgradePlayer.selectedVacuum?.item.enchantments?.bug_blender).toBe(1);
	expect(upgradePlayer.getPhaseStat(PestFarmingPhase.Kill, Stat.PestKillFortune)).toBe(20);
});

test('Praying Mantis Shard affects kill-phase vacuum damage', () => {
	const player = new PestFarmingPlayer({
		tools: [vacuum('INFINI_VACUUM_HOOVERIUS')],
		attributes: { insect_power: 64 },
	});

	expect(player.selectedVacuum?.getStat(Stat.Damage)).toBe(500);
	expect(player.getPhaseStat(PestFarmingPhase.Kill, Stat.Damage)).toBe(500);
	expect(player.getPhaseStat(PestFarmingPhase.Farm, Stat.Damage)).toBe(0);
	expect(
		player.getPhaseStatBreakdown(PestFarmingPhase.Kill, Stat.Damage)['Vacuum: Praying Mantis Shard']
	).toMatchObject({
		value: 250,
		stat: Stat.Damage,
	});
});

test('Praying Mantis Shard vacuum upgrades update shared pest farming attributes', () => {
	const player = new PestFarmingPlayer({
		tools: [vacuum('INFINI_VACUUM_HOOVERIUS')],
		attributes: { insect_power: 0 },
	});

	const upgrade = player
		.getPhaseUpgrades(PestFarmingPhase.Kill, { stat: Stat.Damage })
		.find((entry) => entry.title === 'Praying Mantis 1');

	expect(upgrade?.stats?.[Stat.Damage]).toBe(25);
	expect(upgrade?.onto).toBeUndefined();
	expect(upgrade?.meta?.itemUuid).toBeUndefined();
	player.applyPhaseUpgrade(PestFarmingPhase.Kill, upgrade!);

	expect(player.options.attributes?.insect_power).toBe(1);
	expect(player.selectedVacuum?.getInsectPowerDamageLevel()).toBe(1);
	expect(player.getPhaseStat(PestFarmingPhase.Kill, Stat.Damage)).toBe(275);
});

test('Rose Dragon Symbiosis is available from pest phase pet breakdowns', () => {
	const player = new PestFarmingPlayer({
		pets: [
			{
				uuid: 'rose-dragon',
				type: FarmingPets.RoseDragon,
				tier: Rarity.Legendary,
				exp: 10 ** 20,
			},
			{
				uuid: 'elephant',
				type: FarmingPets.Elephant,
				tier: Rarity.Legendary,
				exp: 10 ** 20,
			},
		],
		phaseLoadouts: {
			[PestFarmingPhase.Kill]: { armorSetId: 'main', petId: 'rose-dragon' },
		},
	});
	const phasePlayer = player.getPhasePlayer(PestFarmingPhase.Kill);

	expect(phasePlayer.selectedPet?.getFullBreakdown(phasePlayer).Symbiosis).toStrictEqual({
		value: 3,
		stat: Stat.FarmingFortune,
	});
});
