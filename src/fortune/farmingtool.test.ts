import { expect, test } from 'vitest';
import { FarmingTool } from './farmingtool.js';
import { FarmingPet } from './farmingpet.js';
import { Stat } from '../constants/stats.js';

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
	gems: { PERIDOT_0: 'FINE', PERIDOT_1: 'FINE', PERIDOT_2: 'FINE' },
};

test('Farming Tool Test', () => {
	const tool = new FarmingTool(netherwartHoe);
	expect(tool.counter).toBe(1102505308);
	expect(tool.cultivating).toBe(1016448482);
	expect(tool.recombobulated).toBe(true);
	expect(tool.farmingForDummies).toBe(5);
	expect(tool.fortune).toBe(339);
	expect(tool.collAnalysis).toBe(40);
	expect(tool.logCounter).toBe(96);

	tool.changeReforgeTo('blessed');
	expect(tool.fortune).toBe(349);

	tool.setOptions({ milestones: { NETHER_STALK: 46 } });
	expect(tool.fortune).toBe(349 + 46 * 2);

	expect(tool.collAnalysis).toBe(40);
	expect(tool.logCounter).toBe(96);
});

const deadalusAxe = {
	id: 286,
	count: 1,
	skyblockId: 'STARRED_DAEDALUS_AXE',
	uuid: '8f549129-c819-46c3-a133-1040f7481a5d',
	name: '§d⚚ Withered Daedalus Axe',
	lore: [
		'§7Damage: §c+333 §e(+30)',
		'§7Strength: §c+269 §e(+30) §6[+5] §9(+202) §d(+32)',
		'§7Crit Damage: §c+100%',
		'§7Health: §a+200',
		'§7Speed: §a+40',
		'§7Magic Find: §a+6',
		'§7Ferocity: §a+5',
		' §6[§d⚔§6] §6[§d⚔§6]',
		'',
		'§d§l§d§lChimera V§9, §9Champion I§9, §9Cleave VI',
		'§9Critical VII§9, §9Cubism VI§9, §9Divine Gift III',
		'§9Dragon Hunter V§9, §9Ender Slayer VII§9, §9Experience V',
		'§9Fire Aspect III§9, §9First Strike V§9, §9Giant Killer VII',
		'§9Impaling III§9, §9Lethality VI§9, §9Looting V',
		'§9Luck VII§9, §9Prosecute VI§9, §9Scavenger V',
		'§9Sharpness VII§9, §9Smoldering V§9, §9Syphon V',
		'§9Tabasco III§9, §9Thunderlord VII§9, §9Vampirism VI',
		'§9Venomous VI§9, §9Vicious V',
		'',
		'§7§7Gains §c+5 Damage §7per Taming level.',
		'§7§7Copies the stats from your active',
		'§7pet.',
		'',
		'§7§7Earn §6+35 coins §7from monster kills.',
		'',
		'§7Deals §a+200% §7damage against',
		'§7§2Mythological Creatures§7.',
		'',
		'§7Gain §b+0.5✯ §7against §2Mythological',
		'§2Creatures §7for each §3Bestiary §7tier',
		'§7you have unlocked for §2Mythological',
		'§2Creatures§7.',
		'',
		'§9Withered Bonus',
		'§7Grants §a+1 §c❁ Strength §7per',
		'§7§cCatacombs §7level.',
		'',
		'§d§l§ka§r §d§lMYTHIC SWORD §d§l§ka',
	],
	enchantments: {
		luck: 7,
		cleave: 6,
		cubism: 6,
		syphon: 5,
		looting: 5,
		tabasco: 3,
		vicious: 5,
		champion: 1,
		critical: 7,
		impaling: 3,
		venomous: 6,
		PROSECUTE: 6,
		lethality: 6,
		scavenger: 5,
		sharpness: 7,
		vampirism: 6,
		experience: 5,
		smoldering: 5,
		divine_gift: 3,
		fire_aspect: 3,
		thunderlord: 7,
		ender_slayer: 7,
		first_strike: 5,
		giant_killer: 7,
		dragon_hunter: 5,
		ultimate_chimera: 5,
	},
	attributes: {
		modifier: 'withered',
		timestamp: '1714098101302',
		rarity_upgrades: '1',
		art_of_war_count: '1',
		hot_potato_count: '15',
		champion_combat_xp: '886.2387999999997',
	},
	gems: { COMBAT_0: 'PERFECT', COMBAT_1: 'PERFECT', COMBAT_0_gem: 'JASPER', COMBAT_1_gem: 'JASPER' },
};

test('Daedalus Axe Test', () => {
	const tool = new FarmingTool(deadalusAxe);
	expect(tool.counter).toBe(undefined);
	expect(tool.fortune).toBe(0);

	const tool2 = new FarmingTool(deadalusAxe, {
		selectedPet: new FarmingPet({
			uuid: 'ec3f021c-d92d-4b56-95fe-0a18653d2238',
			type: 'MOOSHROOM_COW',
			exp: 3732885279.595839,
			active: true,
			tier: 'LEGENDARY',
			heldItem: 'GREEN_BANDANA',
			candyUsed: 0,
			skin: 'MOOSHROOM_COW_MOOCELIUM',
		}),
	});

	expect(tool2.counter).toBe(undefined);

	expect(tool2.options?.selectedPet).toBeDefined();
	expect(tool2.options?.selectedPet?.getChimeraAffectedStats(1)).toStrictEqual({
		[Stat.FarmingFortune]: 110,
	});

	expect(tool2.info.computedStats?.(tool2.options ?? {})).toStrictEqual({
		[Stat.FarmingFortune]: 110,
	});

	expect(tool2.getCalculatedStats()).toStrictEqual({
		[Stat.FarmingFortune]: 110,
	});

	expect(tool2.fortune).toBe(220);
	expect(tool2.fortuneBreakdown).toStrictEqual({
		'Chimera': 110,
		'Item Ability': 110,
	});

	expect(tool2.getProgress()).toStrictEqual([
		{
			name: 'Item Ability',
			fortune: 110,
			maxFortune: 170,
			ratio: 110 / 170,
		},
		{
			name: 'Chimera',
			fortune: 110,
			maxFortune: 110,
			ratio: 1,
			wiki: 'https://wiki.hypixel.net/Chimera_Enchantment',
		},
	]);
});
