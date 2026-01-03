import { expect, test } from 'vitest';
import { Crop } from '../../constants/crops.js';
import { Stat } from '../../constants/stats.js';
import { UpgradeAction, UpgradeCategory } from '../../constants/upgrades.js';
import { FarmingTool } from '../../fortune/farmingtool.js';

const netherwartHoe = {
	id: 293,
	count: 1,
	skyblockId: 'THEORETICAL_HOE_WARTS_3',
	uuid: '103d2e1f-0351-429f-b116-c85e81886597',
	name: '§dBountiful Newton Nether Warts Hoe',
	lore: [
		'§7Speed: §a+13 §9(+13)',
		'§7Farming Fortune: §a+128 §2(+5) §9(+10) §d(+18)',
		'§7Farming Wisdom: §a+10',
		'§7Nether Wart Fortune: §a+279',
		' §9[§2☘§9] §9[§2☘§9] §9[§2☘§9]',
		'',
		'§9§d§lUltimate Wise V',
		'§9Cultivating X',
		'§9Dedication IV',
		'§9Harvesting VI',
		'§9Replenish I',
		'§9Turbo-Warts V',
		'',
		'§7Gain §6+50☘ Nether Wart Fortune §7and',
		'§7§3+12☯ Farming Wisdom §7for nether',
		'§7warts.',
		'',
		'§7Counter: §e1,102,505,308 Nether Warts',
		'',
		'§6Logarithmic Counter',
		'§7Gain §6+16☘ Nether Wart Fortune §7per',
		'§7digits on the Counter, minus 4!',
		'§7You have §6+96☘ Nether Wart Fortune§7.',
		'',
		'§6Collection Analysis',
		'§7Gain §6+8☘ Nether Wart Fortune §7per digits',
		'§7of your collection, minus 4!',
		'§7You have §6+40☘ Nether Wart Fortune§7.',
		'',
		'§7§8Bonus nether warts percent',
		"§8increases your Farmhand perk's",
		'§8chances.',
		'',
		'§9Bountiful Bonus',
		'§7Grants §a+10 §6☘ Farming Fortune§7, which',
		'§7increases your chance for multiple',
		'§7crops.',
		'§7Grants §6+0.2 coins §7per crop.',
		'',
		'§d§l§ka§r §d§l§d§lMYTHIC HOE §d§l§ka',
	],
	enchantments: {
		replenish: 1,
		dedication: 4,
		harvesting: 6,
		cultivating: 10,
		telekinesis: 1,
		turbo_warts: 5,
		ultimate_wise: 5,
	},
	attributes: {
		modifier: 'bountiful',
		originTag: 'UNKNOWN',
		timestamp: '1631561580000',
		mined_crops: '1102505308',
		rarity_upgrades: '1',
		farmed_cultivating: '1016448482',
		farming_for_dummies_count: '5',
	},
	gems: { PERIDOT_0: 'PERFECT' },
};

test('Test tool fortune sources', () => {
	const tool = new FarmingTool(netherwartHoe, {
		milestones: {
			[Crop.NetherWart]: 12,
		},
	});

	expect(tool.fortune).toBe(173);

	expect(tool.counter).toBe(1102505308);

	const progress = tool.getProgress();

	// These are outside of the scope of this test
	progress.forEach((piece) => {
		delete piece.wiki;
		delete piece.nextInfo;
		delete piece.info;
		delete piece.upgrades;
		delete piece.item;
		delete piece.maxInfo;
	});

	expect(progress).toStrictEqual([
		{
			name: 'Tool Level',
			current: 4,
			max: 200,
			ratio: 4 / 200,
		},
		{
			name: 'Reforge Stats',
			current: 10,
			max: 7,
			ratio: 1,
		},
		{
			name: 'Gemstone Slots',
			current: 10,
			max: 32,
			ratio: 10 / 32,
		},
		{
			name: 'Farming For Dummies',
			current: 5,
			max: 5,
			ratio: 1,
		},
		{
			name: 'Harvesting',
			current: 75,
			max: 75,
			ratio: 1,
		},
		{
			name: 'Cultivating',
			current: 20,
			max: 20,
			ratio: 1,
		},
		{
			name: 'Dedication',
			current: 24,
			max: 92,
			ratio: 24 / 92,
		},
		{
			name: 'Turbo-Warts',
			current: 25,
			max: 25,
			ratio: 1,
		},
		{
			name: 'Crop Fever',
			alwaysInclude: true,
			current: 0,
			max: 0,
			ratio: 0,
			progress: [
				{
					name: 'Level',
					current: 0,
					max: 5,
					ratio: 0,
				},
			],
		},
	]);

	expect(progress.reduce((acc, curr) => acc + curr.current, 0)).toBe(173);

	tool.changeReforgeTo('blessed');
	expect(tool.fortune).toBe(183);

	expect(tool.getProgress().reduce((acc, curr) => acc + curr.current, 0)).toBe(183);
	expect(tool.getProgress().reduce((acc, curr) => acc + curr.max, 0)).toBe(465);
});

const t1WheatHoe = {
	id: 291,
	count: 1,
	skyblockId: 'THEORETICAL_HOE_WHEAT_1',
	uuid: '2b15e5f1-94e3-424e-a265-461ca617672b',
	name: "§fEuclid's Wheat Hoe",
	lore: [
		'§7Wheat Fortune: §a+10',
		' §8[§8☘§8]',
		'',
		'§7Gain §6+10☘ Wheat Fortune §7and §3+1☯',
		'§3Farming Wisdom §7for wheat.',
		'',
		'§7Counter: §e0 Wheat',
		'',
		'§eReach 100k Counter for +1 Rarity!',
		'',
		'§eRight-click to view recipes!',
		'',
		'§7§8This item can be reforged!',
		'§f§lCOMMON HOE',
	],
	enchantments: null,
	attributes: { timestamp: '1722345370015', levelable_lvl: '1' },
};

const t3CaneHoe = {
	id: 123,
	count: 1,
	skyblockId: 'THEORETICAL_HOE_CANE_3',
	uuid: '00000000-0000-0000-0000-000000000000',
	name: '§6Turing Sugar Cane Hoe',
	lore: [
		'§7Farming Fortune: §a+0',
		'§7Sugar Cane Fortune: §a+0',
		' §9[§2☘§9] §9[§2☘§9] §9[§8☘§9] §9[§8☘§9]',
		'',
		'§6§lLEGENDARY HOE',
	],
	enchantments: {},
	attributes: {
		timestamp: '1722345370015',
		levelable_lvl: '40',
		levelable_overclocks: '0',
	},
	gems: {
		PERIDOT_0: 'FINE',
		PERIDOT_1: 'FINE',
	},
};

test('Tier 1 Wheat Hoe', () => {
	const tool = new FarmingTool(t1WheatHoe);
	expect(tool.fortune).toBe(4);

	const progress = tool.getProgress();

	// These are outside of the scope of this test
	progress.forEach((piece) => {
		delete piece.wiki;
		delete piece.nextInfo;
		delete piece.info;
		delete piece.upgrades;
		delete piece.item;
		delete piece.maxInfo;
	});

	expect(progress).toStrictEqual([
		{
			name: 'Tool Level',
			current: 4,
			max: 200,
			ratio: 4 / 200,
		},
		{
			name: 'Reforge Stats',
			current: 0,
			max: 16,
			ratio: 0,
		},
		{
			name: 'Gemstone Slots',
			current: 0,
			max: 32,
			ratio: 0,
		},
		{
			name: 'Farming For Dummies',
			current: 0,
			max: 5,
			ratio: 0,
		},
		{
			name: 'Harvesting',
			current: 0,
			max: 75,
			ratio: 0,
		},
		{
			name: 'Cultivating',
			current: 0,
			max: 20,
			ratio: 0,
		},
		{
			name: 'Dedication',
			current: 0,
			max: 92,
			ratio: 0,
		},
		{
			name: 'Turbo-Wheat',
			current: 0,
			max: 25,
			ratio: 0,
		},
		{
			name: 'Crop Fever',
			alwaysInclude: true,
			current: 0,
			max: 0,
			ratio: 0,
			progress: [
				{
					name: 'Level',
					current: 0,
					max: 5,
					ratio: 0,
				},
			],
		},
	]);

	expect(progress.reduce((acc, curr) => acc + curr.max, 0)).toBe(465);
});

test('Tier 1 Wheat Hoe Upgrades', () => {
	const tool = new FarmingTool(t1WheatHoe);
	expect(tool.fortune).toBe(4);

	const upgrades = tool.getUpgrades();

	// Gem slots now respect tool-level unlock requirements (this item has no tool level data,
	// so its effective level is 1 and gemstone slot upgrades are not yet available).
	// Upgrades come from individual sources, plus self and rarity upgrades added in getUpgrades().
	expect(upgrades).toHaveLength(6);

	const selfUpgrade = upgrades.find((u) => u.title === "Euclid's Wheat Hoe Mk. II");
	expect(selfUpgrade).toBeDefined();
	expect(selfUpgrade?.increase).toBe(0);
	expect(selfUpgrade?.action).toBe(UpgradeAction.Upgrade);
	expect(selfUpgrade?.category).toBe(UpgradeCategory.Item);

	const bountiful = upgrades.find((u) => u.title === 'Reforge to Bountiful');
	expect(bountiful).toBeDefined();
	expect(bountiful?.increase).toBe(1);
	expect(bountiful?.action).toBe(UpgradeAction.Apply);
	expect(bountiful?.category).toBe(UpgradeCategory.Reforge);
	expect(bountiful?.cost).toStrictEqual({
		items: {
			GOLDEN_BALL: 1,
		},
		applyCost: {
			coins: 20000,
		},
	});

	const cultivating = upgrades.find((u) => u.title === 'Cultivating 1');
	expect(cultivating).toBeDefined();
	expect(cultivating?.increase).toBe(2);
	expect(cultivating?.action).toBe(UpgradeAction.Apply);
	expect(cultivating?.category).toBe(UpgradeCategory.Enchant);
	expect(cultivating?.cost?.items).toStrictEqual({
		ENCHANTMENT_CULTIVATING_1: 1,
	});

	const farmingForDummies = upgrades.find((u) => u.title === 'Farming For Dummies');
	expect(farmingForDummies).toBeDefined();
	expect(farmingForDummies?.increase).toBe(1);
	expect(farmingForDummies?.action).toBe(UpgradeAction.Apply);
	expect(farmingForDummies?.category).toBe(UpgradeCategory.Item);
	expect(farmingForDummies?.cost?.items).toStrictEqual({
		FARMING_FOR_DUMMIES: 1,
	});
});

test('Blessed hoe still recommends Bountiful', () => {
	const blessedHoe = {
		...t1WheatHoe,
		attributes: { ...t1WheatHoe.attributes, modifier: 'blessed' },
	};

	const tool = new FarmingTool(blessedHoe);
	const reforges = tool.getUpgrades().filter((u) => u.category === 'reforge');

	const bountiful = reforges.find((u) => u.title === 'Reforge to Bountiful');
	const blessed = reforges.find((u) => u.title === 'Reforge to Blessed');

	expect(bountiful).toBeDefined();
	expect(bountiful?.increase).toBe(-4);
	expect(blessed).toBeUndefined();
});

test('Tier 3 Cane Hoe Upgrades (crop stat includes Farming Fortune upgrades)', () => {
	const tool = new FarmingTool(t3CaneHoe);

	// When filtering upgrades by crop fortune stat, we still expect to see
	// upgrades that increase Farming Fortune (they affect total crop fortune).
	const upgrades = tool.getUpgrades({ stat: Stat.SugarCaneFortune });

	const peridot2 = upgrades.find((u) => u.meta?.type === 'gem' && u.meta?.slot === 'PERIDOT_2');
	expect(peridot2).toBeDefined();
});

const wildRoseHoe = {
	id: 292,
	count: 1,
	damage: 0,
	skyblockId: 'THEORETICAL_HOE_WILD_ROSE_1',
	uuid: 'd8ee617c-e391-4d8b-b8c5-d2bfea1197e2',
	name: '§aWild Rose Hoe Mk. I',
	lore: [
		'§7Wild Rose Fortune: §6+4',
		'§7Farming Wisdom: §3+1',
		'',
		'§9Replenish I',
		'§7Upon breaking crops, nether wart,',
		'§7cocoa, wild rose, or sunflower,',
		'§7automatically replant from materials',
		'§7in your inventory.',
		'',
		'§7Level §a1 §8-> §62   §8(0/1k)',
		'§f§l§m                         §r §e0§6%',
		'',
		'§eRight-click to view recipes!',
		'',
		'§7§8This item can be reforged!',
		'§a§lUNCOMMON HOE',
	],
	enchantments: {
		replenish: 1,
	},
	attributes: {
		timestamp: '1765828082737',
		levelable_exp: '0',
		levelable_lvl: '1',
	},
};

test('Wild Rose Hoe Upgrades', () => {
	const tool = new FarmingTool(wildRoseHoe);
	expect(tool.fortune).toBeGreaterThan(0);

	const progress = tool.getProgress();

	// Tool Level should have item info for frontend dialog
	const toolLevelProgress = progress.find((p) => p.name === 'Tool Level');
	expect(toolLevelProgress?.item?.skyblockId).toBe('THEORETICAL_HOE_WILD_ROSE_1');
	expect(toolLevelProgress?.info?.name).toBe('Wild Rose Hoe Mk. I');

	// tool.getUpgrades() should return all available upgrades
	const upgrades = tool.getUpgrades();
	expect(upgrades.length).toBeGreaterThan(0);

	const selfUpgrade = upgrades.find((u) => u.title === 'Wild Rose Hoe Mk. II');
	expect(selfUpgrade).toBeDefined();
});

const maxedBountifulAxe = {
	id: 258,
	count: 1,
	skyblockId: 'COCO_CHOPPER_3',
	uuid: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
	name: '§6Bountiful Cocoa Chopper Mk. III',
	lore: [
		'§7Farming Fortune: §a+210 §2(+5) §9(+10) §d(+20)',
		'§7Speed: §a+13',
		' §9[§2☘§9] §9[§2☘§9] §9[§2☘§9] §9[§2☘§9]',
		'',
		'§9Cultivating X',
		'§9Harvesting VI',
		'§9Replenish I',
		'§9Turbo-Cocoa V',
		'',
		'§9Bountiful Bonus',
		'§7Grants §a+10 §6☘ Farming Fortune§7, which',
		'§7increases your chance for multiple',
		'§7crops.',
		'§7Grants §6+0.2 coins §7per crop.',
		'',
		'§6§lLEGENDARY AXE',
	],
	enchantments: {
		replenish: 1,
		harvesting: 6,
		cultivating: 10,
		turbo_cocoa: 5,
	},
	attributes: {
		modifier: 'bountiful',
		timestamp: '1631561580000',
		rarity_upgrades: '1',
		farming_for_dummies_count: '5',
	},
	gems: { PERIDOT_0: 'PERFECT', PERIDOT_1: 'PERFECT', PERIDOT_2: 'PERFECT', PERIDOT_3: 'PERFECT' },
};

test('Maxed Bountiful Axe should not suggest Earthy reforge', () => {
	const tool = new FarmingTool(maxedBountifulAxe);

	const reforges = tool.getUpgrades().filter((u) => u.category === 'reforge');

	const earthy = reforges.find((u) => u.title === 'Reforge to Earthy');
	const blessed = reforges.find((u) => u.title === 'Reforge to Blessed');

	// Earthy has less fortune than Bountiful at Legendary (10 vs 7), so shouldn't be suggested
	expect(earthy).toBeUndefined();
	// Blessed should also not be suggested due to Bountiful preference
	expect(blessed).toBeUndefined();
	// Should have no reforge upgrades since Bountiful is already the best
	expect(reforges).toHaveLength(0);
});

test('Earthy Axe should recommend switching to Bountiful', () => {
	const earthyAxe = {
		...maxedBountifulAxe,
		attributes: { ...maxedBountifulAxe.attributes, modifier: 'earthy' },
	};

	const tool = new FarmingTool(earthyAxe);
	const reforges = tool.getUpgrades().filter((u) => u.category === 'reforge');

	const bountiful = reforges.find((u) => u.title === 'Reforge to Bountiful');
	const blessed = reforges.find((u) => u.title === 'Reforge to Blessed');

	// Should recommend Bountiful despite it having less fortune (7 vs 10)
	expect(bountiful).toBeDefined();
	expect(bountiful?.increase).toBe(-3); // Shows the fortune decrease
	// Blessed should not be suggested
	expect(blessed).toBeUndefined();
});

test('Axed perk should be detected from perks string or number', () => {
	const axe = {
		id: 258,
		count: 1,
		skyblockId: 'COCO_CHOPPER_3',
		uuid: 'test-axe-uuid',
		name: '§6Cocoa Chopper',
		lore: ['§7Farming Fortune: §a+100', '', '§6§lLEGENDARY AXE'],
		enchantments: {},
		attributes: {
			modifier: 'bountiful',
			farming_for_dummies_count: '5',
		},
	};

	// Test with string "1"
	const toolWithAxedString = new FarmingTool(axe, {
		perks: {
			axed: '1',
		},
	});

	expect(toolWithAxedString.hasAxedPerk()).toBe(true);
	expect(toolWithAxedString.fortuneBreakdown['Axed Perk']).toBeGreaterThan(0);

	const progressString = toolWithAxedString.getProgress();
	const axedProgressString = progressString.find((p) => p.name === 'Axed Perk');
	expect(axedProgressString).toBeDefined();
	expect(axedProgressString?.current).toBeGreaterThan(0);

	// Test with number 1
	const toolWithAxedNumber = new FarmingTool(axe, {
		perks: {
			axed: 1,
		},
	});

	expect(toolWithAxedNumber.hasAxedPerk()).toBe(true);
	expect(toolWithAxedNumber.fortuneBreakdown['Axed Perk']).toBeGreaterThan(0);

	const progressNumber = toolWithAxedNumber.getProgress();
	const axedProgressNumber = progressNumber.find((p) => p.name === 'Axed Perk');
	expect(axedProgressNumber).toBeDefined();
	expect(axedProgressNumber?.current).toBeGreaterThan(0);

	// Without the perk
	const toolWithoutAxed = new FarmingTool(axe, {
		perks: {},
	});

	expect(toolWithoutAxed.hasAxedPerk()).toBe(false);
	expect(toolWithoutAxed.fortuneBreakdown['Axed Perk']).toBeUndefined();

	const progressWithout = toolWithoutAxed.getProgress();
	const axedProgressWithout = progressWithout.find((p) => p.name === 'Axed Perk');
	expect(axedProgressWithout).toBeDefined(); // Still present as an available upgrade
	expect(axedProgressWithout?.current).toBe(0); // But not active
	expect(axedProgressWithout?.upgrades).toBeDefined();

	// With number 0
	const toolWithZero = new FarmingTool(axe, {
		perks: {
			axed: 0,
		},
	});

	expect(toolWithZero.hasAxedPerk()).toBe(false);
	expect(toolWithZero.fortuneBreakdown['Axed Perk']).toBeUndefined();

	// With null perk
	const toolWithNull = new FarmingTool(axe, {
		perks: {
			axed: null,
		},
	});

	expect(toolWithNull.hasAxedPerk()).toBe(false);
	expect(toolWithNull.fortuneBreakdown['Axed Perk']).toBeUndefined();
});

test('Axed perk should not be applied twice in progress', () => {
	const axe = {
		id: 258,
		count: 1,
		skyblockId: 'COCO_CHOPPER_3',
		uuid: 'test-axe-uuid',
		name: '§6Cocoa Chopper',
		lore: ['§7Farming Fortune: §a+100', '', '§6§lLEGENDARY AXE'],
		enchantments: {},
		attributes: {
			modifier: 'bountiful',
			farming_for_dummies_count: '5',
		},
	};

	const toolWithAxed = new FarmingTool(axe, {
		perks: {
			axed: 1,
		},
	});

	// Get the base fortune without progress calculation
	const baseFortune = toolWithAxed.fortune;
	expect(baseFortune).toBeGreaterThan(0);

	// Get progress which should recalculate fortune
	const progress = toolWithAxed.getProgress();
	const axedProgress = progress.find((p) => p.name === 'Axed Perk');

	// The Axed Perk in progress should be 2% of other sources
	const otherSourcesSum = progress.filter((p) => p.name !== 'Axed Perk').reduce((acc, p) => acc + p.current, 0);
	const expectedAxed = otherSourcesSum * 0.02;

	expect(axedProgress?.current).toBeCloseTo(expectedAxed, 1);

	// The total fortune should equal the sum of progress items
	const totalFromProgress = progress.reduce((acc, p) => acc + p.current, 0);
	expect(baseFortune).toBeCloseTo(totalFromProgress, 1);
});

test('Axed perk fortune should match between breakdown and progress', () => {
	const axe = {
		id: 258,
		count: 1,
		skyblockId: 'COCO_CHOPPER_3',
		uuid: 'test-axe-uuid',
		name: '§6Cocoa Chopper',
		lore: [],
		enchantments: {
			dedication: 4,
		},
		attributes: {
			modifier: 'bountiful',
			farming_for_dummies_count: '5',
		},
		gems: {},
	};

	const tool = new FarmingTool(axe, {
		perks: {
			axed: 1,
		},
	});

	// Check breakdown
	const breakdownAxed = tool.fortuneBreakdown['Axed Perk'] ?? 0;

	// Get progress
	const progress = tool.getProgress();
	const axedFromProgress = progress.find((p) => p.name === 'Axed Perk')?.current ?? 0;

	expect(Math.abs(breakdownAxed - axedFromProgress)).toBeLessThan(0.1);

	// Verify total fortune equals sum of progress
	const totalFromProgress = progress.reduce((acc, p) => acc + p.current, 0);
	expect(Math.abs(tool.fortune - totalFromProgress)).toBeLessThan(0.01);

	// Check that Axed Perk only appears once in the progress array
	const axedPerkCount = progress.filter((p) => p.name === 'Axed Perk').length;
	expect(axedPerkCount).toBe(1);
});

test('alwaysInclude enchants should not contribute to max/current totals', () => {
	const tool = {
		id: 279,
		count: 1,
		skyblockId: 'MELON_DICER_3',
		uuid: '52e12254-6f3a-4e17-a5ca-b472eedb5a5b',
		name: '§6Bountiful Melon Dicer Mk. III',
		lore: [],
		enchantments: {
			ultimate_crop_fever: 5,
		},
		attributes: {
			modifier: 'bountiful',
		},
		gems: {},
	};

	const farmingTool = new FarmingTool(tool);
	const progress = farmingTool.getProgress();

	// Find Crop Fever entry
	const cropFever = progress.find((p) => p.name === 'Crop Fever');
	expect(cropFever).toBeDefined();

	expect(cropFever?.alwaysInclude).toBe(true);

	expect(cropFever?.max).toBe(0);
	expect(cropFever?.current).toBe(0);

	expect(cropFever?.progress).toBeDefined();
	expect(cropFever?.progress?.[0]?.max).toBe(5);
	expect(cropFever?.progress?.[0]?.current).toBe(5);
});
