import { expect, test } from 'vitest';
import { Stat } from '../constants/stats.js';
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
