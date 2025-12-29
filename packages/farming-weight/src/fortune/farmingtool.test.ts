import { expect, test } from 'vitest';
import { Stat } from '../constants/stats.js';
import { TOOL_EXP_LEVELS } from '../constants/toollevels.js';
import { FarmingTool } from './farmingtool.js';

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
		'§6§lLEGENDARY HOE',
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
		levelable_lvl: '50',
		levelable_overclocks: '10',
		levelable_exp: '0',
	},
	gems: { PERIDOT_0: 'FINE', PERIDOT_1: 'FINE', PERIDOT_2: 'FINE' },
};

test('Farming Tool Test', () => {
	const tool = new FarmingTool(netherwartHoe);
	expect(tool.counter).toBe(1102505308);
	expect(tool.cultivating).toBe(1016448482);
	expect(tool.recombobulated).toBe(true);
	expect(tool.farmingForDummies).toBe(5);
	expect(tool.fortune).toBeGreaterThan(0);
	expect(tool.collAnalysis).toBe(0);
	expect(tool.logCounter).toBe(0);

	tool.changeReforgeTo('blessed');
	expect(tool.fortune).toBeGreaterThan(0);

	tool.setOptions({ milestones: { NETHER_STALK: 46 } });
	expect(tool.fortune).toBeGreaterThan(0);

	expect(tool.collAnalysis).toBe(0);
	expect(tool.logCounter).toBe(0);
});

test('Farming tool current level progress', () => {
	const tool = new FarmingTool({
		...netherwartHoe,
		attributes: {
			...netherwartHoe.attributes,
			levelable_lvl: '1',
			levelable_exp: '250',
		},
	});

	const progress = tool.getCurrentLevelProgress();

	expect(progress.level).toBe(1);
	expect(progress.next).toBe(2);
	expect(progress.goal).toBe(TOOL_EXP_LEVELS[0]);
	expect(progress.progress).toBe(250);
	expect(progress.ratio).toBe(0.25);
	expect(progress.maxed).toBe(false);
	expect(progress.total).toBe(250);
});

test('Mk 1 cap: stays at level 14 with 100% progress to 15', () => {
	const tool = new FarmingTool({
		...netherwartHoe,
		skyblockId: 'THEORETICAL_HOE_WHEAT_1',
		name: '§aWheat Hoe Mk. I',
		attributes: {
			...netherwartHoe.attributes,
			levelable_lvl: '14',
			levelable_exp: '1351146',
		},
	});

	const p = tool.getCurrentLevelProgress();
	expect(p.level).toBe(14);
	expect(p.next).toBe(15);
	expect(p.goal).toBe(TOOL_EXP_LEVELS[13]);
	expect(p.ratio).toBe(1);
	expect(p.maxed).toBe(true);
	expect(p.progress).toBe(TOOL_EXP_LEVELS[13]);
});

test('Mk 2 cap: stays at level 29 with 100% progress to 30', () => {
	const tool = new FarmingTool({
		...netherwartHoe,
		skyblockId: 'THEORETICAL_HOE_WHEAT_2',
		name: '§bWheat Hoe Mk. II',
		attributes: {
			...netherwartHoe.attributes,
			levelable_lvl: '29',
			levelable_exp: '1004745.55',
		},
	});

	const p = tool.getCurrentLevelProgress();
	expect(p.level).toBe(29);
	expect(p.next).toBe(30);
	expect(p.goal).toBe(TOOL_EXP_LEVELS[28]);
	expect(p.ratio).toBe(1);
	expect(p.maxed).toBe(true);
	expect(p.progress).toBe(TOOL_EXP_LEVELS[28]);
});

test('Mk 3 cap: stays at level 40 with 100% progress to 41', () => {
	const tool = new FarmingTool({
		...netherwartHoe,
		attributes: {
			...netherwartHoe.attributes,
			levelable_lvl: '40',
			levelable_exp: '262735760',
		},
	});

	const p = tool.getCurrentLevelProgress();
	expect(p.level).toBe(40);
	expect(p.next).toBe(41);
	expect(p.goal).toBe(TOOL_EXP_LEVELS[39]);
	expect(p.ratio).toBe(1);
	expect(p.maxed).toBe(true);
	expect(p.progress).toBe(TOOL_EXP_LEVELS[39]);
});

test('Level 50 is always maxed', () => {
	const tool = new FarmingTool({
		...netherwartHoe,
		attributes: {
			...netherwartHoe.attributes,
			levelable_lvl: '50',
			levelable_exp: '0',
		},
	});

	const p = tool.getCurrentLevelProgress();
	expect(p.level).toBe(50);
	expect(p.maxed).toBe(true);
	expect(p.ratio).toBe(1);
	expect(p.goal).toBeUndefined();
	expect(p.next).toBeUndefined();
});

test('Lore match: Level 10 -> 11 (2.6k/40k) = 6.47%', () => {
	const tool = new FarmingTool({
		...netherwartHoe,
		attributes: {
			...netherwartHoe.attributes,
			timestamp: '1765930312420',
			levelable_lvl: '10',
			levelable_exp: '2588.65',
			donated_museum: '1',
		},
	});

	const p = tool.getCurrentLevelProgress();
	expect(p.level).toBe(10);
	expect(p.next).toBe(11);
	expect(p.goal).toBe(TOOL_EXP_LEVELS[9]);
	expect(p.progress).toBeCloseTo(2588.65, 6);
	expect(p.ratio).toBeCloseTo(2588.65 / 40000, 6);
	expect(p.maxed).toBe(false);
});

test('Lore match: Level 26 -> 27 (109.5k/600k) = 18.26%', () => {
	const tool = new FarmingTool({
		...netherwartHoe,
		attributes: {
			...netherwartHoe.attributes,
			levelable_lvl: '26',
			levelable_exp: '109549',
			levelable_overclocks: '1',
			farming_for_dummies_count: '5',
		},
	});

	const p = tool.getCurrentLevelProgress();
	expect(p.level).toBe(26);
	expect(p.next).toBe(27);
	expect(p.goal).toBe(TOOL_EXP_LEVELS[25]);
	expect(p.progress).toBe(109549);
	expect(p.ratio).toBeCloseTo(109549 / 600000, 6);
	expect(p.maxed).toBe(false);
});

test('Lore match: Level 46 -> 47 (2.8M/4M) = 70.32%', () => {
	const tool = new FarmingTool({
		...netherwartHoe,
		attributes: {
			...netherwartHoe.attributes,
			modifier: 'blessed',
			timestamp: '1688830800000',
			levelable_lvl: '46',
			levelable_exp: '2812878.7',
			levelable_overclocks: '10',
			farming_for_dummies_count: '5',
			rarity_upgrades: '1',
			donated_museum: '1',
		},
	});

	const p = tool.getCurrentLevelProgress();
	expect(p.level).toBe(46);
	expect(p.next).toBe(47);
	expect(p.goal).toBe(TOOL_EXP_LEVELS[45]);
	expect(p.progress).toBeCloseTo(2812878.7, 3);
	expect(p.ratio).toBeCloseTo(2812878.7 / 4000000, 6);
	expect(p.maxed).toBe(false);
});

const pumpkinDicer = {
	id: 286,
	count: 1,
	skyblockId: 'PUMPKIN_DICER_3',
	uuid: '36ef96fb-eca8-407f-9ce4-5ad9d861816d',
	name: '§dBlessed Pumpkin Dicer 3.0',
	lore: [
		'§7Damage: §c+30.6 §e(+30)',
		'§7Strength: §c+30.6 §e(+30)',
		'§7Farming Fortune: §6+144.84 §2(+5) §9(+20) §d(+24)',
		'§7Pumpkin Fortune: §6+119.34',
		'§7Speed: §f+20.4 §9(+20)',
		'§7Farming Wisdom: §3+15.3 §9(+6)',
		' §5[§2☘§5] §5[§2☘§5] §5[§2☘§5]',
		'',
		'§9Cultivating IX §882,128,493',
		'§9Dedication IV',
		'§9Delicate V',
		'§9Efficiency V',
		'§9Sunder VI',
		'§9Turbo-Pumpkin V',
		'',
		'§7§7Gain §3+10☯ Farming Wisdom §7while',
		'§7harvesting pumpkins§7.',
		'',
		"§6Ability: Roll em'++ ",
		'§7Every pumpkin you break, you',
		'§7make a wish to §dRNGesus §7which may',
		'§7grant you with a few or TONS of',
		'§7extra pumpkins!',
		'',
		'§7§o"3.0 is better than the 2.0 version" -',
		'§7§oCEO of PumpkinDicer LLC.',
		'',
		'§9Blessed Bonus',
		'§7Grants §6+20☘ Farming Fortune §7and',
		'§7§3+6☯ Farming Wisdom§7.',
		'',
		'§6§lLEGENDARY AXE',
	],
	enchantments: {
		sunder: 6,
		delicate: 5,
		dedication: 4,
		efficiency: 5,
		cultivating: 9,
		turbo_pumpkin: 5,
	},
	attributes: {
		modifier: 'blessed',
		timestamp: '1755381054902',
		rarity_upgrades: '1',
		hot_potato_count: '15',
		farmed_cultivating: '82128493',
		farming_for_dummies_count: '5',
		levelable_lvl: '40',
		levelable_overclocks: '0',
		levelable_exp: '0',
	},
	gems: {
		PERIDOT_0: 'FLAWLESS',
		PERIDOT_1: 'FLAWLESS',
		PERIDOT_2: 'FLAWLESS',
	},
};

test('Pumpkin Dicer Test', () => {
	const tool = new FarmingTool(pumpkinDicer, {
		milestones: { PUMPKIN: 46 },
	});
	expect(tool.cultivating).toBe(82128493);
	expect(tool.recombobulated).toBe(true);
	expect(tool.farmingForDummies).toBe(5);

	expect(tool.fortune).toBeGreaterThan(0);

	const progress = tool.getProgress();
	const axed = progress.find((p) => p.name === 'Axed Perk');
	expect(axed).toBeDefined();
});

test('FarmingTool getStats returns multiple stats', () => {
	const tool = new FarmingTool(netherwartHoe);
	const stats = tool.getStats();

	// Should have FarmingFortune
	expect(stats[Stat.FarmingFortune]).toBeDefined();
	expect(stats[Stat.FarmingFortune]).toBe(tool.getFortune());

	// Bountiful reforge gives Speed
	expect(stats[Stat.Speed]).toBeDefined();
	expect(stats[Stat.Speed]).toBeGreaterThan(0);

	// Verify getStat works for individual stats
	expect(tool.getStat(Stat.Speed)).toBe(stats[Stat.Speed]);
	expect(tool.getStat(Stat.FarmingFortune)).toBe(stats[Stat.FarmingFortune]);

	// Blessed reforge for pumpkin dicer also gives Speed and FarmingWisdom
	const dicer = new FarmingTool(pumpkinDicer);
	const dicerStats = dicer.getStats();

	expect(dicerStats[Stat.FarmingFortune]).toBeDefined();
	expect(dicerStats[Stat.Speed]).toBeDefined();
	expect(dicerStats[Stat.FarmingWisdom]).toBeDefined();
});
