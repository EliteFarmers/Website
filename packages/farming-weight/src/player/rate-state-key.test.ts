import { expect, test } from 'vitest';
import { Crop } from '../constants/crops.js';
import { Rarity } from '../constants/reforges.js';
import type { EliteItemDto } from '../fortune/item.js';
import { GearSlot } from '../items/armor.js';
import { FarmingPets } from '../items/pets.js';
import { FarmingPlayer } from './player.js';
import { getRateCalculationStateKey } from './rate-state-key.js';

function item(skyblockId: string, uuid: string, name: string, rarity: Rarity): EliteItemDto {
	return {
		id: Number(uuid.replace(/\D/g, '') || 1),
		count: 1,
		skyblockId,
		uuid,
		name,
		lore: [`${rarity.toUpperCase()} ${name}`],
		enchantments: {},
		attributes: {},
		gems: {},
	};
}

test('rate calculation state key changes when active armor is swapped', () => {
	const player = new FarmingPlayer({
		armor: [
			item('FERMENTO_HELMET', 'fermento-helmet', 'Fermento Helmet', Rarity.Legendary),
			item('FARM_ARMOR_HELMET', 'farm-helmet', 'Farm Armor Helmet', Rarity.Common),
		],
	});
	const replacement = player.armor.find((piece) => piece.item.uuid === 'farm-helmet');

	expect(player.armorSet.getPiece(GearSlot.Helmet)?.item.uuid).toBe('fermento-helmet');
	expect(replacement).toBeDefined();

	const before = getRateCalculationStateKey(player, Crop.NetherWart);

	player.armorSet.setPiece(replacement!);

	expect(getRateCalculationStateKey(player, Crop.NetherWart)).not.toBe(before);
});

test('rate calculation state key changes when active equipment is swapped', () => {
	const player = new FarmingPlayer({
		equipment: [
			item('BLOSSOM_BELT', 'blossom-belt', 'Blossom Belt', Rarity.Legendary),
			item('LOTUS_BELT', 'lotus-belt', 'Lotus Belt', Rarity.Legendary),
		],
	});
	const replacement = player.equipment.find((piece) => piece.item.uuid === 'lotus-belt');

	expect(player.armorSet.getPiece(GearSlot.Belt)?.item.uuid).toBe('blossom-belt');
	expect(replacement).toBeDefined();

	const before = getRateCalculationStateKey(player, Crop.Melon);

	player.armorSet.setPiece(replacement!);

	expect(getRateCalculationStateKey(player, Crop.Melon)).not.toBe(before);
});

test('rate calculation state key changes when selected tool state changes without changing uuid', () => {
	const player = new FarmingPlayer({
		tools: [item('CACTUS_KNIFE', 'cactus-knife', 'Cactus Knife', Rarity.Epic)],
	});

	const before = getRateCalculationStateKey(player, Crop.Cactus);

	player.selectedTool!.item.attributes = {
		...player.selectedTool!.item.attributes,
		modifier: 'bountiful',
	};

	expect(getRateCalculationStateKey(player, Crop.Cactus)).not.toBe(before);
});

test('rate calculation state key ignores unrelated tool state changes for another crop', () => {
	const player = new FarmingPlayer({
		tools: [
			item('THEORETICAL_HOE_WHEAT_1', 'wheat-hoe', 'Euclid Wheat Hoe', Rarity.Epic),
			item('CACTUS_KNIFE', 'cactus-knife', 'Cactus Knife', Rarity.Epic),
		],
	});
	const cactusKnife = player.tools.find((tool) => tool.item.uuid === 'cactus-knife');

	expect(cactusKnife).toBeDefined();

	const before = getRateCalculationStateKey(player, Crop.Wheat);

	cactusKnife!.item.attributes = {
		...cactusKnife!.item.attributes,
		modifier: 'bountiful',
	};

	expect(getRateCalculationStateKey(player, Crop.Wheat)).toBe(before);
});

test('rate calculation state key changes when selected pet state changes without changing uuid', () => {
	const player = new FarmingPlayer({
		pets: [
			{
				uuid: 'elephant-pet',
				type: FarmingPets.Elephant,
				tier: Rarity.Legendary.toUpperCase(),
				exp: 0,
				active: true,
			},
		],
	});

	const before = getRateCalculationStateKey(player, Crop.Wheat);

	player.selectedPet!.pet.heldItem = 'YELLOW_BANDANA';

	expect(getRateCalculationStateKey(player, Crop.Wheat)).not.toBe(before);
});

test('rate calculation state key ignores non-rate option changes', () => {
	const player = new FarmingPlayer({});
	const before = getRateCalculationStateKey(player, Crop.Wheat);

	player.options.collection = {
		WHEAT: 1_000_000,
	};

	expect(getRateCalculationStateKey(player, Crop.Wheat)).toBe(before);
});

test('rate calculation state key changes when rate-affecting options change', () => {
	const player = new FarmingPlayer({});
	const before = getRateCalculationStateKey(player, Crop.Wheat);

	player.setOptions({
		...player.options,
		temporaryFortune: {
			centuryCake: true,
		},
	});

	expect(getRateCalculationStateKey(player, Crop.Wheat)).not.toBe(before);
});
