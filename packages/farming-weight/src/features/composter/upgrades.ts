import { ITEM_IDS } from '../../constants/itemids.js';
import { mergeCost, type UpgradeCost } from '../../constants/upgrades.js';
import { ComposterUpgrade } from './composter.js';

interface ComposterUpgradeInfo {
	name: string;
	wiki: string;
	current: (level: number) => number;
	levels: UpgradeCost[];
	totalCost: UpgradeCost;
}

export const COMPOSTER_UPGRADES: Record<ComposterUpgrade, ComposterUpgradeInfo> = {
	[ComposterUpgrade.Speed]: {
		name: 'Composter Speed',
		wiki: 'https://wiki.hypixel.net/Composter#Composter_Speed_',
		current: (level) => (20 * level) / 100,
		levels: [
			{
				// Level 1
				items: {
					[ITEM_IDS.EnchantedWheat]: 128,
				},
				copper: 100,
			},
			{
				// Level 2
				items: {
					[ITEM_IDS.EnchantedGoldenCarrot]: 2,
				},
				copper: 150,
			},
			{
				// Level 3
				items: {
					[ITEM_IDS.EnchantedWheat]: 256,
				},
				copper: 200,
			},
			{
				// Level 4
				items: {
					[ITEM_IDS.EnchantedGoldenCarrot]: 4,
				},
				copper: 250,
			},
			{
				// Level 5
				items: {
					[ITEM_IDS.EnchantedWheat]: 512,
				},
				copper: 300,
			},
			{
				// Level 6
				items: {
					[ITEM_IDS.EnchantedGoldenCarrot]: 8,
				},
				copper: 350,
			},
			{
				// Level 7
				items: {
					[ITEM_IDS.EnchantedHayBale]: 8,
				},
				copper: 400,
			},
			{
				// Level 8
				items: {
					[ITEM_IDS.EnchantedGoldenCarrot]: 16,
					[ITEM_IDS.Cropie]: 3,
				},
				copper: 500,
			},
			{
				// Level 9
				items: {
					[ITEM_IDS.EnchantedHayBale]: 12,
					[ITEM_IDS.Cropie]: 6,
				},
				copper: 600,
			},
			{
				// Level 10
				items: {
					[ITEM_IDS.EnchantedGoldenCarrot]: 32,
					[ITEM_IDS.Cropie]: 12,
				},
				copper: 700,
			},
			{
				// Level 11
				items: {
					[ITEM_IDS.EnchantedHayBale]: 16,
					[ITEM_IDS.Cropie]: 24,
				},
				copper: 800,
			},
			{
				// Level 12
				items: {
					[ITEM_IDS.EnchantedGoldenCarrot]: 40,
					[ITEM_IDS.Cropie]: 48,
				},
				copper: 900,
			},
			{
				// Level 13
				items: {
					[ITEM_IDS.EnchantedHayBale]: 24,
					[ITEM_IDS.Cropie]: 96,
				},
				copper: 1000,
			},
			{
				// Level 14
				items: {
					[ITEM_IDS.EnchantedGoldenCarrot]: 48,
					[ITEM_IDS.Squash]: 3,
				},
				copper: 1200,
			},
			{
				// Level 15
				items: {
					[ITEM_IDS.EnchantedHayBale]: 32,
					[ITEM_IDS.Squash]: 6,
				},
				copper: 1400,
			},
			{
				// Level 16
				items: {
					[ITEM_IDS.EnchantedGoldenCarrot]: 64,
					[ITEM_IDS.Squash]: 12,
				},
				copper: 1600,
			},
			{
				// Level 17
				items: {
					[ITEM_IDS.EnchantedHayBale]: 40,
					[ITEM_IDS.Squash]: 24,
				},
				copper: 1800,
			},
			{
				// Level 18
				items: {
					[ITEM_IDS.EnchantedGoldenCarrot]: 96,
					[ITEM_IDS.Squash]: 48,
				},
				copper: 2000,
			},
			{
				// Level 19
				items: {
					[ITEM_IDS.EnchantedHayBale]: 48,
					[ITEM_IDS.Squash]: 96,
				},
				copper: 2250,
			},
			{
				// Level 20
				items: {
					[ITEM_IDS.EnchantedGoldenCarrot]: 128,
					[ITEM_IDS.Fermento]: 3,
				},
				copper: 2500,
			},
			{
				// Level 21
				items: {
					[ITEM_IDS.EnchantedHayBale]: 64,
					[ITEM_IDS.Fermento]: 6,
				},
				copper: 2750,
			},
			{
				// Level 22
				items: {
					[ITEM_IDS.EnchantedGoldenCarrot]: 192,
					[ITEM_IDS.Fermento]: 12,
				},
				copper: 3000,
			},
			{
				// Level 23
				items: {
					[ITEM_IDS.EnchantedHayBale]: 96,
					[ITEM_IDS.CondensedFermento]: 2,
				},
				copper: 3300,
			},
			{
				// Level 24
				items: {
					[ITEM_IDS.EnchantedGoldenCarrot]: 256,
					[ITEM_IDS.CondensedFermento]: 4,
				},
				copper: 3600,
			},
			{
				// Level 25
				items: {
					[ITEM_IDS.EnchantedHayBale]: 128,
					[ITEM_IDS.CondensedFermento]: 8,
				},
				copper: 4000,
			},
		],
		totalCost: {},
	},
	[ComposterUpgrade.MultiDrop]: {
		name: 'Multi Drop',
		wiki: 'https://wiki.hypixel.net/Composter#Multi_Drop_',
		current: (level) => (3 * level) / 100,
		levels: [
			{
				// Level 1
				items: {
					[ITEM_IDS.EnchantedBakedPotato]: 1,
				},
				copper: 100,
			},
			{
				// Level 2
				items: {
					[ITEM_IDS.EnchantedPumpkin]: 64,
				},
				copper: 150,
			},
			{
				// Level 3
				items: {
					[ITEM_IDS.EnchantedBakedPotato]: 2,
				},
				copper: 200,
			},
			{
				// Level 4
				items: {
					[ITEM_IDS.PolishedPumpkin]: 1,
				},
				copper: 250,
			},
			{
				// Level 5
				items: {
					[ITEM_IDS.EnchantedBakedPotato]: 4,
				},
				copper: 300,
			},
			{
				// Level 6
				items: {
					[ITEM_IDS.PolishedPumpkin]: 2,
				},
				copper: 350,
			},
			{
				// Level 7
				items: {
					[ITEM_IDS.EnchantedBakedPotato]: 8,
				},
				copper: 400,
			},
			{
				// Level 8
				items: {
					[ITEM_IDS.PolishedPumpkin]: 4,
					[ITEM_IDS.Cropie]: 3,
				},
				copper: 500,
			},
			{
				// Level 9
				items: {
					[ITEM_IDS.EnchantedBakedPotato]: 16,
					[ITEM_IDS.Cropie]: 6,
				},
				copper: 600,
			},
			{
				// Level 10
				items: {
					[ITEM_IDS.PolishedPumpkin]: 8,
					[ITEM_IDS.Cropie]: 12,
				},
				copper: 700,
			},
			{
				// Level 11
				items: {
					[ITEM_IDS.EnchantedBakedPotato]: 32,
					[ITEM_IDS.Cropie]: 24,
				},
				copper: 800,
			},
			{
				// Level 12
				items: {
					[ITEM_IDS.PolishedPumpkin]: 16,
					[ITEM_IDS.Cropie]: 48,
				},
				copper: 900,
			},
			{
				// Level 13
				items: {
					[ITEM_IDS.EnchantedBakedPotato]: 48,
					[ITEM_IDS.Cropie]: 96,
				},
				copper: 1000,
			},
			{
				// Level 14
				items: {
					[ITEM_IDS.PolishedPumpkin]: 24,
					[ITEM_IDS.Squash]: 3,
				},
				copper: 1200,
			},
			{
				// Level 15
				items: {
					[ITEM_IDS.EnchantedBakedPotato]: 48,
					[ITEM_IDS.Squash]: 6,
				},
				copper: 1400,
			},
			{
				// Level 16
				items: {
					[ITEM_IDS.PolishedPumpkin]: 32,
					[ITEM_IDS.Squash]: 12,
				},
				copper: 1600,
			},
			{
				// Level 17
				items: {
					[ITEM_IDS.EnchantedBakedPotato]: 80,
					[ITEM_IDS.Squash]: 24,
				},
				copper: 1800,
			},
			{
				// Level 18
				items: {
					[ITEM_IDS.PolishedPumpkin]: 48,
					[ITEM_IDS.Squash]: 48,
				},
				copper: 2000,
			},
			{
				// Level 19
				items: {
					[ITEM_IDS.EnchantedBakedPotato]: 112,
					[ITEM_IDS.Squash]: 96,
				},
				copper: 2250,
			},
			{
				// Level 20
				items: {
					[ITEM_IDS.PolishedPumpkin]: 64,
					[ITEM_IDS.Fermento]: 3,
				},
				copper: 2500,
			},
			{
				// Level 21
				items: {
					[ITEM_IDS.EnchantedBakedPotato]: 144,
					[ITEM_IDS.Fermento]: 6,
				},
				copper: 2750,
			},
			{
				// Level 22
				items: {
					[ITEM_IDS.PolishedPumpkin]: 96,
					[ITEM_IDS.Fermento]: 12,
				},
				copper: 3000,
			},
			{
				// Level 23
				items: {
					[ITEM_IDS.EnchantedBakedPotato]: 176,
					[ITEM_IDS.CondensedFermento]: 2,
				},
				copper: 3300,
			},
			{
				// Level 24
				items: {
					[ITEM_IDS.PolishedPumpkin]: 128,
					[ITEM_IDS.CondensedFermento]: 4,
				},
				copper: 3600,
			},
			{
				// Level 25
				items: {
					[ITEM_IDS.EnchantedBakedPotato]: 224,
					[ITEM_IDS.CondensedFermento]: 8,
				},
				copper: 4000,
			},
		],
		totalCost: {},
	},
	[ComposterUpgrade.FuelCap]: {
		name: 'Fuel Cap',
		wiki: 'https://wiki.hypixel.net/Composter#Fuel_Cap_',
		current: (level) => 30_000 * level + 100_000,
		levels: [
			{
				// Level 1
				items: {
					[ITEM_IDS.EnchantedSugarCane]: 1,
				},
				copper: 100,
			},
			{
				// Level 2
				items: {
					[ITEM_IDS.EnchantedMelonBlock]: 4,
				},
				copper: 150,
			},
			{
				// Level 3
				items: {
					[ITEM_IDS.EnchantedSugarCane]: 2,
				},
				copper: 200,
			},
			{
				// Level 4
				items: {
					[ITEM_IDS.EnchantedMelonBlock]: 8,
				},
				copper: 250,
			},
			{
				// Level 5
				items: {
					[ITEM_IDS.EnchantedSugarCane]: 4,
				},
				copper: 300,
			},
			{
				// Level 6
				items: {
					[ITEM_IDS.EnchantedMelonBlock]: 16,
				},
				copper: 350,
			},
			{
				// Level 7
				items: {
					[ITEM_IDS.EnchantedSugarCane]: 8,
				},
				copper: 400,
			},
			{
				// Level 8
				items: {
					[ITEM_IDS.EnchantedMelonBlock]: 32,
					[ITEM_IDS.Cropie]: 3,
				},
				copper: 500,
			},
			{
				// Level 9
				items: {
					[ITEM_IDS.EnchantedSugarCane]: 16,
					[ITEM_IDS.Cropie]: 6,
				},
				copper: 600,
			},
			{
				// Level 10
				items: {
					[ITEM_IDS.EnchantedMelonBlock]: 40,
					[ITEM_IDS.Cropie]: 12,
				},
				copper: 700,
			},
			{
				// Level 11
				items: {
					[ITEM_IDS.EnchantedSugarCane]: 32,
					[ITEM_IDS.Cropie]: 24,
				},
				copper: 800,
			},
			{
				// Level 12
				items: {
					[ITEM_IDS.EnchantedMelonBlock]: 48,
					[ITEM_IDS.Cropie]: 48,
				},
				copper: 900,
			},
			{
				// Level 13
				items: {
					[ITEM_IDS.EnchantedSugarCane]: 40,
					[ITEM_IDS.Cropie]: 96,
				},
				copper: 1000,
			},
			{
				// Level 14
				items: {
					[ITEM_IDS.EnchantedMelonBlock]: 64,
					[ITEM_IDS.Squash]: 3,
				},
				copper: 1200,
			},
			{
				// Level 15
				items: {
					[ITEM_IDS.EnchantedSugarCane]: 48,
					[ITEM_IDS.Squash]: 6,
				},
				copper: 1400,
			},
			{
				// Level 16
				items: {
					[ITEM_IDS.EnchantedMelonBlock]: 96,
					[ITEM_IDS.Squash]: 12,
				},
				copper: 1600,
			},
			{
				// Level 17
				items: {
					[ITEM_IDS.EnchantedSugarCane]: 64,
					[ITEM_IDS.Squash]: 24,
				},
				copper: 1800,
			},
			{
				// Level 18
				items: {
					[ITEM_IDS.EnchantedMelonBlock]: 128,
					[ITEM_IDS.Squash]: 48,
				},
				copper: 2000,
			},
			{
				// Level 19
				items: {
					[ITEM_IDS.EnchantedSugarCane]: 96,
					[ITEM_IDS.Squash]: 96,
				},
				copper: 2250,
			},
			{
				// Level 20
				items: {
					[ITEM_IDS.EnchantedMelonBlock]: 192,
					[ITEM_IDS.Fermento]: 3,
				},
				copper: 2500,
			},
			{
				// Level 21
				items: {
					[ITEM_IDS.EnchantedSugarCane]: 144,
					[ITEM_IDS.Fermento]: 6,
				},
				copper: 2750,
			},
			{
				// Level 22
				items: {
					[ITEM_IDS.EnchantedMelonBlock]: 288,
					[ITEM_IDS.Fermento]: 12,
				},
				copper: 3000,
			},
			{
				// Level 23
				items: {
					[ITEM_IDS.EnchantedSugarCane]: 192,
					[ITEM_IDS.CondensedFermento]: 2,
				},
				copper: 3300,
			},
			{
				// Level 24
				items: {
					[ITEM_IDS.EnchantedMelonBlock]: 384,
					[ITEM_IDS.CondensedFermento]: 4,
				},
				copper: 3600,
			},
			{
				// Level 25
				items: {
					[ITEM_IDS.EnchantedSugarCane]: 256,
					[ITEM_IDS.CondensedFermento]: 8,
				},
				copper: 4000,
			},
		],
		totalCost: {},
	},
	[ComposterUpgrade.OrganicMatterCap]: {
		name: 'Organic Matter Cap',
		wiki: 'https://wiki.hypixel.net/Composter#Organic_Matter_Cap_',
		current: (level) => 30_000 * level + 40_000,
		levels: [
			{
				// Level 1
				items: {
					[ITEM_IDS.EnchantedCactus]: 1,
				},
				copper: 100,
			},
			{
				// Level 2
				items: {
					[ITEM_IDS.EnchantedCookie]: 3,
				},
				copper: 150,
			},
			{
				// Level 3
				items: {
					[ITEM_IDS.EnchantedCactus]: 2,
				},
				copper: 200,
			},
			{
				// Level 4
				items: {
					[ITEM_IDS.EnchantedCookie]: 6,
				},
				copper: 250,
			},
			{
				// Level 5
				items: {
					[ITEM_IDS.EnchantedCactus]: 4,
				},
				copper: 300,
			},
			{
				// Level 6
				items: {
					[ITEM_IDS.EnchantedCookie]: 12,
				},
				copper: 350,
			},
			{
				// Level 7
				items: {
					[ITEM_IDS.EnchantedCactus]: 7,
				},
				copper: 400,
			},
			{
				// Level 8
				items: {
					[ITEM_IDS.EnchantedCookie]: 24,
					[ITEM_IDS.Cropie]: 3,
				},
				copper: 500,
			},
			{
				// Level 9
				items: {
					[ITEM_IDS.EnchantedCactus]: 10,
					[ITEM_IDS.Cropie]: 6,
				},
				copper: 600,
			},
			{
				// Level 10
				items: {
					[ITEM_IDS.EnchantedCookie]: 48,
					[ITEM_IDS.Cropie]: 12,
				},
				copper: 700,
			},
			{
				// Level 11
				items: {
					[ITEM_IDS.EnchantedCactus]: 16,
					[ITEM_IDS.Cropie]: 24,
				},
				copper: 800,
			},
			{
				// Level 12
				items: {
					[ITEM_IDS.EnchantedCookie]: 64,
					[ITEM_IDS.Cropie]: 48,
				},
				copper: 900,
			},
			{
				// Level 13
				items: {
					[ITEM_IDS.EnchantedCactus]: 24,
					[ITEM_IDS.Cropie]: 96,
				},
				copper: 1000,
			},
			{
				// Level 14
				items: {
					[ITEM_IDS.EnchantedCookie]: 96,
					[ITEM_IDS.Squash]: 3,
				},
				copper: 1200,
			},
			{
				// Level 15
				items: {
					[ITEM_IDS.EnchantedCactus]: 32,
					[ITEM_IDS.Squash]: 6,
				},
				copper: 1400,
			},
			{
				// Level 16
				items: {
					[ITEM_IDS.EnchantedCookie]: 128,
					[ITEM_IDS.Squash]: 12,
				},
				copper: 1600,
			},
			{
				// Level 17
				items: {
					[ITEM_IDS.EnchantedCactus]: 40,
					[ITEM_IDS.Squash]: 24,
				},
				copper: 1800,
			},
			{
				// Level 18
				items: {
					[ITEM_IDS.EnchantedCookie]: 160,
					[ITEM_IDS.Squash]: 48,
				},
				copper: 2000,
			},
			{
				// Level 19
				items: {
					[ITEM_IDS.EnchantedCactus]: 48,
					[ITEM_IDS.Squash]: 96,
				},
				copper: 2250,
			},
			{
				// Level 20
				items: {
					[ITEM_IDS.EnchantedCookie]: 208,
					[ITEM_IDS.Fermento]: 3,
				},
				copper: 2500,
			},
			{
				// Level 21
				items: {
					[ITEM_IDS.EnchantedCactus]: 64,
					[ITEM_IDS.Fermento]: 6,
				},
				copper: 2750,
			},
			{
				// Level 22
				items: {
					[ITEM_IDS.EnchantedCookie]: 256,
					[ITEM_IDS.Fermento]: 12,
				},
				copper: 3000,
			},
			{
				// Level 23
				items: {
					[ITEM_IDS.EnchantedCactus]: 96,
					[ITEM_IDS.CondensedFermento]: 2,
				},
				copper: 3300,
			},
			{
				// Level 24
				items: {
					[ITEM_IDS.EnchantedCookie]: 320,
					[ITEM_IDS.CondensedFermento]: 4,
				},
				copper: 3600,
			},
			{
				// Level 25
				items: {
					[ITEM_IDS.EnchantedCactus]: 128,
					[ITEM_IDS.CondensedFermento]: 8,
				},
				copper: 4000,
			},
		],
		totalCost: {},
	},
	[ComposterUpgrade.CostReduction]: {
		name: 'Cost Reduction',
		wiki: 'https://wiki.hypixel.net/Composter#Cost_Reduction_',
		current: (level) => level / 100,
		levels: [
			{
				// Level 1
				items: {
					[ITEM_IDS.EnchantedBrownMushroom]: 32,
				},
				copper: 100,
			},
			{
				// Level 2
				items: {
					[ITEM_IDS.MutantNetherWart]: 1,
				},
				copper: 150,
			},
			{
				// Level 3
				items: {
					[ITEM_IDS.EnchantedRedMushroomBlock]: 2,
				},
				copper: 200,
			},
			{
				// Level 4
				items: {
					[ITEM_IDS.MutantNetherWart]: 2,
				},
				copper: 250,
			},
			{
				// Level 5
				items: {
					[ITEM_IDS.EnchantedBrownMushroomBlock]: 4,
				},
				copper: 300,
			},
			{
				// Level 6
				items: {
					[ITEM_IDS.MutantNetherWart]: 4,
				},
				copper: 350,
			},
			{
				// Level 7
				items: {
					[ITEM_IDS.EnchantedRedMushroomBlock]: 8,
				},
				copper: 400,
			},
			{
				// Level 8
				items: {
					[ITEM_IDS.MutantNetherWart]: 8,
					[ITEM_IDS.Cropie]: 3,
				},
				copper: 500,
			},
			{
				// Level 9
				items: {
					[ITEM_IDS.EnchantedBrownMushroomBlock]: 16,
					[ITEM_IDS.Cropie]: 6,
				},
				copper: 600,
			},
			{
				// Level 10
				items: {
					[ITEM_IDS.MutantNetherWart]: 16,
					[ITEM_IDS.Cropie]: 12,
				},
				copper: 700,
			},
			{
				// Level 11
				items: {
					[ITEM_IDS.EnchantedRedMushroomBlock]: 24,
					[ITEM_IDS.Cropie]: 24,
				},
				copper: 800,
			},
			{
				// Level 12
				items: {
					[ITEM_IDS.MutantNetherWart]: 32,
					[ITEM_IDS.Cropie]: 48,
				},
				copper: 900,
			},
			{
				// Level 13
				items: {
					[ITEM_IDS.EnchantedBrownMushroomBlock]: 32,
					[ITEM_IDS.Cropie]: 96,
				},
				copper: 1000,
			},
			{
				// Level 14
				items: {
					[ITEM_IDS.MutantNetherWart]: 48,
					[ITEM_IDS.Squash]: 3,
				},
				copper: 1200,
			},
			{
				// Level 15
				items: {
					[ITEM_IDS.EnchantedRedMushroomBlock]: 48,
					[ITEM_IDS.Squash]: 6,
				},
				copper: 1400,
			},
			{
				// Level 16
				items: {
					[ITEM_IDS.MutantNetherWart]: 64,
					[ITEM_IDS.Squash]: 12,
				},
				copper: 1600,
			},
			{
				// Level 17
				items: {
					[ITEM_IDS.EnchantedBrownMushroomBlock]: 64,
					[ITEM_IDS.Squash]: 24,
				},
				copper: 1800,
			},
			{
				// Level 18
				items: {
					[ITEM_IDS.MutantNetherWart]: 80,
					[ITEM_IDS.Squash]: 48,
				},
				copper: 2000,
			},
			{
				// Level 19
				items: {
					[ITEM_IDS.EnchantedRedMushroomBlock]: 96,
					[ITEM_IDS.Squash]: 96,
				},
				copper: 2250,
			},
			{
				// Level 20
				items: {
					[ITEM_IDS.MutantNetherWart]: 112,
					[ITEM_IDS.Fermento]: 3,
				},
				copper: 2500,
			},
			{
				// Level 21
				items: {
					[ITEM_IDS.EnchantedBrownMushroomBlock]: 128,
					[ITEM_IDS.Fermento]: 6,
				},
				copper: 2750,
			},
			{
				// Level 22
				items: {
					[ITEM_IDS.MutantNetherWart]: 160,
					[ITEM_IDS.Fermento]: 12,
				},
				copper: 3000,
			},
			{
				// Level 23
				items: {
					[ITEM_IDS.EnchantedRedMushroomBlock]: 160,
					[ITEM_IDS.CondensedFermento]: 2,
				},
				copper: 3300,
			},
			{
				// Level 24
				items: {
					[ITEM_IDS.MutantNetherWart]: 224,
					[ITEM_IDS.CondensedFermento]: 4,
				},
				copper: 3600,
			},
			{
				// Level 25
				items: {
					[ITEM_IDS.EnchantedBrownMushroomBlock]: 192,
					[ITEM_IDS.CondensedFermento]: 8,
				},
				copper: 4000,
			},
		],
		totalCost: {},
	},
};

for (const upgrade of Object.values(COMPOSTER_UPGRADES)) {
	upgrade.totalCost = mergeCost(...upgrade.levels);
}
