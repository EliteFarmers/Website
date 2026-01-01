import { describe, expect, test } from 'vitest';
import { Crop } from '../constants/crops.js';
import { FarmingPlayer } from './player.js';

describe('Fortune breakdown totals should match calculated fortune', () => {
	test('breakdown sum should equal fortune with temporary fortune', () => {
		const player = new FarmingPlayer({
			temporaryFortune: {
				pestTurnIn: 200,
				harvestPotion: true,
			},
		});

		const breakdownSum = Object.values(player.breakdown).reduce((sum, val) => sum + val, 0);
		expect(breakdownSum).toBe(player.fortune);
	});

	test('breakdown should include all sources contributing to fortune', () => {
		const player = new FarmingPlayer({
			farmingLevel: 53,
			plotsUnlocked: 17,
			communityCenter: 10,
			anitaBonus: 5,
			refinedTruffles: 5,
			dnaMilestone: 1,
			temporaryFortune: {
				pestTurnIn: 200,
			},
		});

		const breakdownSum = Object.values(player.breakdown).reduce((sum, val) => sum + val, 0);
		expect(breakdownSum).toBe(player.fortune);
	});

	test('crop-specific accessories should not be double-counted in combined breakdown', () => {
		// Regression test for bug where Fermento Artifact appeared in both
		// player.breakdown and cropFortune.breakdown with the same key
		const fermentoArtifact = {
			id: 397,
			count: 1,
			damage: 3,
			skyblockId: 'FERMENTO_ARTIFACT',
			uuid: 'c0ada2dd-92eb-400b-b63c-1fd04d41996c',
			name: '§9Fermento Artifact',
			lore: ['§7Melon Slice Fortune: §6+30'],
			enchantments: null,
			attributes: {},
		};

		const melonTool = {
			id: 279,
			skyblockId: 'MELON_DICER_3',
			uuid: 'd1feb274-900e-4809-9721-20079ad54af7',
			name: '§6Melon Dicer Mk. III',
			lore: [],
			enchantments: {},
			attributes: { levelable_lvl: '1' },
		};

		const player = new FarmingPlayer({
			tools: [melonTool],
			accessories: [fermentoArtifact],
			farmingLevel: 53,
			plotsUnlocked: 17,
		});

		const cropFortune = player.getCropFortune(Crop.Melon);

		// The Fermento Artifact should ONLY appear in crop breakdown, not general breakdown
		expect(player.breakdown['§9Fermento Artifact']).toBeUndefined();
		expect(cropFortune.breakdown['§9Fermento Artifact']).toBe(30);

		// Combined breakdown should match combined fortune total
		const combinedBreakdown = { ...player.breakdown, ...cropFortune.breakdown };
		const combinedBreakdownSum = Object.values(combinedBreakdown).reduce((sum, val) => sum + val, 0);
		const combinedTotalFortune = player.fortune + cropFortune.fortune;

		expect(combinedBreakdownSum).toBe(combinedTotalFortune);
	});

	test('non-crop-specific accessories should still appear in general breakdown', () => {
		// The Helianthus Relic has no crops array, so it provides general fortune
		const helianthusRelic = {
			id: 397,
			skyblockId: 'HELIANTHUS_RELIC',
			uuid: 'test-uuid',
			name: '§9Helianthus Relic',
			lore: [],
			enchantments: null,
			attributes: {},
		};

		const player = new FarmingPlayer({
			accessories: [helianthusRelic],
		});

		// General accessory should appear in breakdown
		expect(player.breakdown['§9Helianthus Relic']).toBe(40);

		const breakdownSum = Object.values(player.breakdown).reduce((sum, val) => sum + val, 0);
		expect(breakdownSum).toBe(player.fortune);
	});

	test('full user scenario with all item types - breakdown sum should match total', () => {
		const melonTool = {
			id: 279,
			skyblockId: 'MELON_DICER_3',
			uuid: 'd1feb274-900e-4809-9721-20079ad54af7',
			name: '§6Bountiful Melon Dicer Mk. III',
			lore: ['§7Farming Fortune: §6+133.62 §2(+5) §9(+7) §d(+24)'],
			enchantments: {
				sunder: 6,
				dedication: 4,
				cultivating: 10,
				turbo_melon: 5,
			},
			attributes: {
				modifier: 'bountiful',
				levelable_lvl: '50',
				farmed_cultivating: '265034000',
				farming_for_dummies_count: '5',
			},
			gems: {
				PERIDOT_0: 'FLAWLESS',
				PERIDOT_1: 'FLAWLESS',
				PERIDOT_2: 'FLAWLESS',
				PERIDOT_3: 'FLAWLESS',
			},
		};

		const fermentoLeggings = {
			id: 300,
			skyblockId: 'FERMENTO_LEGGINGS',
			uuid: '943e3dd2-45be-41c6-91c9-2d7454ba9106',
			name: '§6Mossy Fermento Leggings',
			lore: ['§7Farming Fortune: §6+84'],
			enchantments: { pesterminator: 6 },
			attributes: { modifier: 'mossy', rarity_upgrades: '1' },
			gems: { PERIDOT_0: 'FLAWLESS', PERIDOT_1: 'FLAWLESS' },
		};

		const fermentoChestplate = {
			id: 299,
			skyblockId: 'FERMENTO_CHESTPLATE',
			uuid: '961237e5-e3ed-4551-b5fb-ac77a5e39a55',
			name: '§6Mossy Fermento Chestplate',
			lore: ['§7Farming Fortune: §6+84'],
			enchantments: { pesterminator: 6 },
			attributes: { modifier: 'mossy', rarity_upgrades: '1' },
			gems: { PERIDOT_0: 'FLAWLESS', PERIDOT_1: 'FLAWLESS' },
		};

		const fermentoBoots = {
			id: 301,
			skyblockId: 'FERMENTO_BOOTS',
			uuid: 'e0f7352a-afc0-42af-8079-14b4ac3c0bbc',
			name: '§6Mossy Fermento Boots',
			lore: ['§7Farming Fortune: §6+79'],
			enchantments: { pesterminator: 6 },
			attributes: { modifier: 'mossy', rarity_upgrades: '1' },
			gems: { PERIDOT_0: 'FLAWLESS', PERIDOT_1: 'FLAWLESS' },
		};

		const fermentoHelmet = {
			id: 397,
			skyblockId: 'FERMENTO_HELMET',
			uuid: '5e6ee9c6-0a8b-402c-acc7-09e1921be7c4',
			name: '§6Mossy Fermento Helmet',
			lore: ['§7Farming Fortune: §6+79'],
			enchantments: { pesterminator: 6 },
			attributes: { modifier: 'mossy', rarity_upgrades: '1' },
			gems: { PERIDOT_0: 'FLAWLESS', PERIDOT_1: 'FLAWLESS' },
		};

		const blossomBelt = {
			id: 397,
			skyblockId: 'BLOSSOM_BELT',
			uuid: '5ab34b1a-0016-467b-92e4-034465fbfdbe',
			name: '§6Rooted Blossom Belt',
			lore: ['§7Farming Fortune: §6+38.05'],
			enchantments: { green_thumb: 3 },
			attributes: { modifier: 'rooted', rarity_upgrades: '1' },
		};

		const blossomBracelet = {
			id: 397,
			skyblockId: 'BLOSSOM_BRACELET',
			uuid: '7c2a3fb0-bae6-426e-a363-709b629c6e11',
			name: '§6Rooted Blossom Bracelet',
			lore: ['§7Farming Fortune: §6+38.05'],
			enchantments: { green_thumb: 3 },
			attributes: { modifier: 'rooted', rarity_upgrades: '1' },
		};

		const lotusNecklace = {
			id: 397,
			skyblockId: 'LOTUS_NECKLACE',
			uuid: '9a89598c-e12e-4541-aca7-26d4c96d8f80',
			name: '§5Rooted Lotus Necklace',
			lore: ['§7Farming Fortune: §6+33.05'],
			enchantments: { green_thumb: 3 },
			attributes: { modifier: 'rooted', rarity_upgrades: '1' },
		};

		const lotusCloak = {
			id: 397,
			skyblockId: 'LOTUS_CLOAK',
			uuid: 'a652dfa5-4ccf-4e13-a6c7-8cda02eb6310',
			name: '§5Rooted Lotus Cloak',
			lore: ['§7Farming Fortune: §6+33.05'],
			enchantments: { green_thumb: 3 },
			attributes: { modifier: 'rooted', rarity_upgrades: '1' },
		};

		const mooshroomPet = {
			uuid: '89e8c216-27e4-4676-8bb8-45cef53ffac6',
			type: 'MOOSHROOM_COW',
			exp: 62379651.709864475,
			active: true,
			tier: 'LEGENDARY',
			heldItem: 'GREEN_BANDANA',
			candyUsed: 0,
			skin: null,
		};

		const fermentoArtifact = {
			id: 397,
			skyblockId: 'FERMENTO_ARTIFACT',
			uuid: 'c0ada2dd-92eb-400b-b63c-1fd04d41996c',
			name: '§9Fermento Artifact',
			lore: ['§7Melon Slice Fortune: §6+30'],
			enchantments: null,
			attributes: {},
		};

		const options = {
			tools: [melonTool],
			armor: [fermentoLeggings, fermentoChestplate, fermentoBoots, fermentoHelmet],
			equipment: [blossomBelt, blossomBracelet, lotusNecklace, lotusCloak],
			accessories: [fermentoArtifact],
			pets: [mooshroomPet],
			farmingLevel: 53,
			plotsUnlocked: 17,
			communityCenter: 10,
			anitaBonus: 5,
			refinedTruffles: 5,
			dnaMilestone: 1,
			perks: { axed: 1 },
			uniqueVisitors: 87,
			chips: {
				CROPSHOT_GARDEN_CHIP: 20,
				HYPERCHARGE_GARDEN_CHIP: 20,
			},
			temporaryFortune: {
				pestTurnIn: 200,
			},
			strength: 1100,
		};

		const player = new FarmingPlayer(options);
		const cropFortune = player.getCropFortune(Crop.Melon);

		// Player breakdown should not include Fermento Artifact
		expect(player.breakdown['§9Fermento Artifact']).toBeUndefined();

		// Crop breakdown should include Fermento Artifact
		expect(cropFortune.breakdown['§9Fermento Artifact']).toBe(30);

		// General breakdown sum should match
		const breakdownSum = Object.values(player.breakdown).reduce((sum, val) => sum + val, 0);
		expect(breakdownSum).toBe(player.fortune);

		// Combined breakdown sum should also match the combined total
		const combinedBreakdown = { ...player.breakdown, ...cropFortune.breakdown };
		const combinedBreakdownSum = Object.values(combinedBreakdown).reduce((sum, val) => sum + val, 0);
		const combinedTotalFortune = player.fortune + cropFortune.fortune;

		expect(combinedBreakdownSum).toBe(combinedTotalFortune);
	});
});
