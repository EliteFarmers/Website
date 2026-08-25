import { describe, expect, test } from 'vitest';
import { compareRarity, Rarity } from '../constants/reforges.js';
import { FARMING_ACCESSORIES_INFO } from '../items/accessories/index.js';
import { FARMING_ARMOR_INFO } from '../items/armor.js';
import type { ItemDefinition } from '../items/definitions.js';
import { FARMING_EQUIPMENT_INFO } from '../items/equipment.js';
import { FARMING_TOOLS } from '../items/tools.js';
import { VACUUMS } from '../items/vacuums.js';
import { nextRarity } from '../util/itemstats.js';
import { FarmingArmor } from './farmingarmor.js';
import { FarmingTool } from './farmingtool.js';
import { Vacuum } from './vacuum.js';

const catalogs = {
	accessories: FARMING_ACCESSORIES_INFO,
	armor: FARMING_ARMOR_INFO,
	equipment: FARMING_EQUIPMENT_INFO,
	tools: FARMING_TOOLS,
	vacuums: VACUUMS,
} satisfies Record<string, Partial<Record<string, ItemDefinition>>>;

describe('item rarity definitions', () => {
	for (const [catalogName, catalog] of Object.entries(catalogs)) {
		test(`${catalogName} declare a base rarity and reachable maximum`, () => {
			for (const [id, info] of Object.entries(catalog)) {
				expect(info, `${id} definition`).toBeDefined();
				if (!info) continue;
				expect(info.baseRarity, `${id} base rarity`).toBeDefined();
				expect(info.maxRarity, `${id} max rarity`).toBeDefined();
				expect(compareRarity(info.maxRarity, info.baseRarity), `${id} rarity ordering`).toBeGreaterThanOrEqual(
					0
				);

				if (id === 'POWER_RELIC') continue;
				expect(info.maxRarity, `${id} recombobulated rarity`).toBe(nextRarity(info.baseRarity));
			}
		});
	}

	test('special rarity paths are explicit', () => {
		expect(FARMING_ACCESSORIES_INFO.POWER_RELIC).toMatchObject({
			baseRarity: Rarity.Epic,
			maxRarity: Rarity.Mythic,
		});
	});

	test('known item definitions distinguish innate and recombobulated rarity', () => {
		expect(FARMING_TOOLS.THEORETICAL_HOE_WARTS_3).toMatchObject({
			baseRarity: Rarity.Epic,
			maxRarity: Rarity.Legendary,
		});
		expect(VACUUMS.INFINI_VACUUM_HOOVERIUS).toMatchObject({
			baseRarity: Rarity.Legendary,
			maxRarity: Rarity.Mythic,
		});
		expect(FARMING_ARMOR_INFO.FERMENTO_HELMET).toMatchObject({
			baseRarity: Rarity.Epic,
			maxRarity: Rarity.Legendary,
		});
		expect(FARMING_ARMOR_INFO.HELIANTHUS_HELMET).toMatchObject({
			baseRarity: Rarity.Legendary,
			maxRarity: Rarity.Mythic,
		});
	});

	test('fake items start at their declared base rarity', () => {
		expect(FarmingTool.fakeItem(FARMING_TOOLS.THEORETICAL_HOE_WARTS_3!)?.rarity).toBe(Rarity.Epic);
		expect(Vacuum.fakeItem(VACUUMS.INFINI_VACUUM_HOOVERIUS!)?.rarity).toBe(Rarity.Legendary);
		expect(FarmingArmor.fakeItem(FARMING_ARMOR_INFO.FERMENTO_HELMET!)?.rarity).toBe(Rarity.Epic);
	});
});
