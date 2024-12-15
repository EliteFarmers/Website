import { expect, test } from 'vitest';
import { Crop } from '../../constants/crops.js';
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

	expect(tool.fortune).toBe(355);

	expect(tool.counter).toBe(1102505308);

	const progress = tool.getProgress();

	// These are outside of the scope of this test
	progress.forEach((piece) => {
		delete piece.wiki;
		delete piece.nextInfo;
		delete piece.info;
	});

	expect(progress).toStrictEqual([
		{
			name: 'Base Stats',
			fortune: 50,
			maxFortune: 50,
			ratio: 1,
		},
		{
			name: 'Reforge Stats',
			fortune: 10,
			maxFortune: 10,
			ratio: 1,
		},
		{
			name: 'Gemstone Slots',
			fortune: 10,
			maxFortune: 30,
			ratio: 10 / 30,
		},
		{
			name: 'Farming For Dummies',
			fortune: 5,
			maxFortune: 5,
			ratio: 1,
		},
		{
			name: 'Logarithmic Counter',
			fortune: 96,
			maxFortune: 112,
			ratio: 96 / 112,
		},
		{
			name: 'Collection Analysis',
			fortune: 40,
			maxFortune: 56,
			ratio: 40 / 56,
		},
		{
			name: 'Harvesting',
			fortune: 75,
			maxFortune: 75,
			ratio: 1,
		},
		{
			name: 'Cultivating',
			fortune: 20,
			maxFortune: 20,
			ratio: 1,
		},
		{
			name: 'Dedication',
			fortune: 24,
			maxFortune: 92,
			ratio: 24 / 92,
		},
		{
			name: 'Turbo-Warts',
			fortune: 25,
			maxFortune: 25,
			ratio: 1,
		},
	]);

	expect(progress.reduce((acc, curr) => acc + curr.fortune, 0)).toBe(tool.fortune);

	tool.changeReforgeTo('blessed');
	expect(tool.fortune).toBe(365);

	expect(tool.getProgress().reduce((acc, curr) => acc + curr.fortune, 0)).toBe(tool.fortune);
	expect(tool.getProgress().reduce((acc, curr) => acc + curr.maxFortune, 0)).toBe(485);
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
	attributes: { timestamp: '1722345370015' },
};

test('Tier 1 Wheat Hoe', () => {
	const tool = new FarmingTool(t1WheatHoe);
	expect(tool.fortune).toBe(10);

	const progress = tool.getProgress();

	// These are outside of the scope of this test
	progress.forEach((piece) => {
		delete piece.wiki;
		delete piece.nextInfo;
		delete piece.info;
	});

	expect(progress).toStrictEqual([
		{
			name: 'Base Stats',
			fortune: 10,
			maxFortune: 50,
			ratio: 1 / 5,
		},
		{
			name: 'Reforge Stats',
			fortune: 0,
			maxFortune: 20,
			ratio: 0,
		},
		{
			name: 'Gemstone Slots',
			fortune: 0,
			maxFortune: 30,
			ratio: 0,
		},
		{
			name: 'Farming For Dummies',
			fortune: 0,
			maxFortune: 5,
			ratio: 0,
		},
		{
			name: 'Logarithmic Counter',
			fortune: 0,
			maxFortune: 112,
			ratio: 0,
		},
		{
			name: 'Collection Analysis',
			fortune: 0,
			maxFortune: 56,
			ratio: 0,
		},
		{
			name: 'Harvesting',
			fortune: 0,
			maxFortune: 75,
			ratio: 0,
		},
		{
			name: 'Cultivating',
			fortune: 0,
			maxFortune: 20,
			ratio: 0,
		},
		{
			name: 'Dedication',
			fortune: 0,
			maxFortune: 92,
			ratio: 0,
		},
		{
			name: 'Turbo-Wheat',
			fortune: 0,
			maxFortune: 25,
			ratio: 0,
		},
	]);

	expect(progress.reduce((acc, curr) => acc + curr.maxFortune, 0)).toBe(485);
});
