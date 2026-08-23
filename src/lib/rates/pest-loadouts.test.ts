import type { ItemDto, PetDto, ProfileMemberLoadoutDataDto } from '$lib/api';
import { GearSlot, PestFarmingPhase } from 'farming-weight';
import { describe, expect, test } from 'vitest';
import { importPestLoadouts } from './pest-loadouts';

function item(skyblockId: string, uuid: string, slot: string): ItemDto {
	return { id: 1, count: 1, damage: 0, skyblockId, uuid, slot, name: skyblockId };
}

function pet(overrides: Partial<PetDto>): PetDto {
	return {
		type: 'MOSQUITO',
		exp: 0,
		active: false,
		candyUsed: 0,
		level: 1,
		maxLevel: 100,
		progress: 0,
		xpCurrent: 0,
		xpForNext: 1,
		xpMaxLevel: 1,
		...overrides,
	};
}

describe('pest loadout import', () => {
	test('joins referenced sets first, deduplicates UUIDs, preserves partial sets, and resolves pets', () => {
		const loadouts: ProfileMemberLoadoutDataDto[] = [
			{ id: 7, armorSetId: 3, equipmentSetId: 4, petLocalId: 'pet-local' },
			{ id: 8, petLocalId: 'fallback-local' },
		];
		const state = importPestLoadouts({
			armor: [
				item('FERMENTO_HELMET', 'armor-three', 'armor:0'),
				item('FERMENTO_HELMET', 'armor-three', 'wardrobe:3:HELMET'),
				item('FERMENTO_CHESTPLATE', 'armor-one', 'wardrobe:1:CHESTPLATE'),
				item('FERMENTO_HELMET', 'armor-three', 'wardrobe:8:HELMET'),
			],
			equipment: [item('PESTHUNTERS_BELT', 'equipment-four', 'equipment_wardrobe:4:EQUIPMENT_SLOT_3')],
			pets: [pet({ uuid: 'pet-uuid', localId: 'pet-local' }), pet({ localId: 'fallback-local' }), pet({})],
			loadouts,
		});

		expect(state.armorSets.map((set) => set.id)).toStrictEqual([
			'hypixel:armor:3',
			'hypixel:armor:1',
			'hypixel:armor:8',
		]);
		expect(state.armorSets[0]?.pieces).toStrictEqual({ [GearSlot.Helmet]: 'armor-three' });
		expect(state.armorSets[2]?.pieces).toStrictEqual({});
		expect(state.presets[0]).toMatchObject({
			id: 'hypixel:loadout:7',
			armorSetId: 'hypixel:armor:3',
			equipmentSetId: 'hypixel:equipment:4',
			petId: 'pet-uuid',
		});
		expect(state.presets[1]?.petId).toBe('fallback-local');
		expect(Object.values(state.phasePresetIds)).toStrictEqual(
			Object.values(PestFarmingPhase).map(() => 'hypixel:loadout:7')
		);
	});

	test('imports equipped armor and equipment as optimizer candidates when they are not in wardrobes', () => {
		const state = importPestLoadouts({
			armor: [
				item('FERMENTO_BOOTS', 'equipped-boots', 'armor:0'),
				item('FERMENTO_LEGGINGS', 'equipped-leggings', 'armor:1'),
				item('FERMENTO_CHESTPLATE', 'equipped-chestplate', 'armor:2'),
				item('FERMENTO_HELMET', 'equipped-helmet', 'armor:3'),
				item('RANCHERS_BOOTS', 'wardrobe-boots', 'wardrobe:8:BOOTS'),
			],
			equipment: [
				item('BLOSSOM_NECKLACE', 'equipped-necklace', 'equipment:0'),
				item('BLOSSOM_CLOAK', 'equipped-cloak', 'equipment:1'),
				item('BLOSSOM_BELT', 'equipped-belt', 'equipment:2'),
				item('BLOSSOM_BRACELET', 'equipped-gloves', 'equipment:3'),
				item('PESTHUNTERS_BELT', 'wardrobe-belt', 'equipment_wardrobe:4:EQUIPMENT_SLOT_3'),
			],
			pets: [],
			loadouts: [],
		});

		expect(state.armorSets.find((set) => set.id === 'hypixel:armor:equipped')?.pieces).toStrictEqual({
			[GearSlot.Helmet]: 'equipped-helmet',
			[GearSlot.Chestplate]: 'equipped-chestplate',
			[GearSlot.Leggings]: 'equipped-leggings',
			[GearSlot.Boots]: 'equipped-boots',
		});
		expect(state.equipmentSets.find((set) => set.id === 'hypixel:equipment:equipped')?.pieces).toStrictEqual({
			[GearSlot.Necklace]: 'equipped-necklace',
			[GearSlot.Cloak]: 'equipped-cloak',
			[GearSlot.Belt]: 'equipped-belt',
			[GearSlot.Gloves]: 'equipped-gloves',
		});
	});
});
