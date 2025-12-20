import { expect, test } from 'vitest';
import { ITEM_IDS } from './itemids';
import { mergeCost, type UpgradeCost } from './upgrades';

test('Upgrade cost merge', () => {
	const cost1: UpgradeCost = {
		items: {
			[ITEM_IDS.EnchantedWheat]: 10,
		},
		coins: 100,
		copper: 200,
		bits: 50,
		medals: {
			gold: 1,
			silver: 2,
			bronze: 3,
		},
	};

	const cost2: UpgradeCost = {
		items: {
			[ITEM_IDS.EnchantedWheat]: 5,
			[ITEM_IDS.EnchantedGoldenCarrot]: 2,
		},
		coins: 50,
		copper: 100,
		bits: 25,
		medals: {
			gold: 1,
		},
	};

	const merged = mergeCost(cost1, cost2);

	expect(merged).toEqual({
		items: {
			[ITEM_IDS.EnchantedWheat]: 15,
			[ITEM_IDS.EnchantedGoldenCarrot]: 2,
		},
		coins: 150,
		copper: 300,
		bits: 75,
		medals: {
			gold: 2,
			silver: 2,
			bronze: 3,
		},
	});
});

test('Apply cost merge', () => {
	const cost1: UpgradeCost = {
		items: {
			[ITEM_IDS.EnchantedWheat]: 10,
		},
		coins: 100,
		copper: 200,
		applyCost: {
			items: {
				[ITEM_IDS.EnchantedWheat]: 5,
			},
			coins: 50,
			copper: 100,
		},
	};

	const cost2: UpgradeCost = {
		items: {
			[ITEM_IDS.EnchantedWheat]: 5,
			[ITEM_IDS.EnchantedGoldenCarrot]: 2,
		},
		coins: 50,
		copper: 100,
		applyCost: {
			items: {
				[ITEM_IDS.EnchantedGoldenCarrot]: 1,
			},
			coins: 25,
			copper: 50,
		},
	};

	const merged = mergeCost(cost1, cost2);

	expect(merged).toEqual({
		items: {
			[ITEM_IDS.EnchantedWheat]: 15,
			[ITEM_IDS.EnchantedGoldenCarrot]: 2,
		},
		coins: 150,
		copper: 300,
		applyCost: {
			items: {
				[ITEM_IDS.EnchantedWheat]: 5,
				[ITEM_IDS.EnchantedGoldenCarrot]: 1,
			},
			coins: 75,
			copper: 150,
		},
	});
});
