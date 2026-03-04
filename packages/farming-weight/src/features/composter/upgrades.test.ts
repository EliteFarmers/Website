import { expect, test } from 'vitest';
import { ITEM_IDS } from '../../constants/itemids.js';
import { ComposterUpgrade } from './composter.js';
import { COMPOSTER_UPGRADES } from './upgrades.js';

test('Composter Upgrades', () => {
	expect(COMPOSTER_UPGRADES[ComposterUpgrade.CostReduction].totalCost).toStrictEqual({
		items: {
			[ITEM_IDS.EnchantedBrownMushroom]: 32,
			[ITEM_IDS.MutantNetherWart]: 751,
			[ITEM_IDS.EnchantedRedMushroomBlock]: 338,
			[ITEM_IDS.EnchantedBrownMushroomBlock]: 436,
			[ITEM_IDS.Cropie]: 189,
			[ITEM_IDS.Squash]: 189,
			[ITEM_IDS.Fermento]: 21,
			[ITEM_IDS.CondensedFermento]: 14,
		},
		copper: 35650,
	});
});
