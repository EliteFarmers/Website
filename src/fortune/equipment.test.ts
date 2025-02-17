import { expect, test } from 'vitest';
import { ZorroMode } from '../player/playeroptions.js';
import { ArmorSet } from './farmingarmor.js';
import { FarmingEquipment } from './farmingequipment.js';

const zorrosCape = {
	id: 397,
	count: 1,
	skyblockId: 'ZORROS_CAPE',
	uuid: 'b8e008d4-cf6c-41a9-afe0-b0ea750b786e',
	name: "§dRooted Zorro's Cape",
	lore: [
		'§7Strength: §c+20',
		'§7Health: §a+34 §9(+17)',
		'§7Ferocity: §a+4',
		'§7Farming Fortune: §a+104 §9(+21)',
		'§7Farming Wisdom: §a+2',
		'',
		'§9Green Thumb V',
		'§7Grants §60.25☘ Farming Fortune §7per',
		'§7unique visitor served.',
		'',
		'§7The stats of this Cape §adouble §7',
		"§7§7during §eJacob's Farming Contest§7.",
		'§7Additionally, you have a §a20% §7chance',
		'§7to obtain an extra medal from',
		'§7contests.',
		'',
		'§7§8§oNot all Rabbits wear capes.',
		'',
		"§7§4❣ §cRequires §dZorro §cin Hoppity's Collection§c.",
		'§d§l§ka§r §d§l§d§lMYTHIC CLOAK §d§l§ka',
	],
	enchantments: { green_thumb: 5 },
	attributes: { modifier: 'rooted', timestamp: '1717854193084', rarity_upgrades: '1' },
};

test("Doubled Zorro's Cloak Test", () => {
	const cape = new FarmingEquipment(zorrosCape, {
		uniqueVisitors: 84,
		zorro: { enabled: true, mode: ZorroMode.Contest },
	});
	expect(cape.fortuneBreakdown).toStrictEqual({
		'Base Stats': 20,
		'Green Thumb': 42,
		Reforge: 42,
	});
	expect(cape.getFortune()).toBe(104);
});

test("Averaged Zorro's Cloak Test", () => {
	const cape = new FarmingEquipment(zorrosCape, {
		uniqueVisitors: 84,
		zorro: { enabled: true, mode: ZorroMode.Averaged },
	});

	expect(cape.fortuneBreakdown['Base Stats']).toBeCloseTo(10 * 1.3333);
	expect(cape.fortuneBreakdown['Green Thumb']).toBeCloseTo(21 * 1.3333);
	expect(cape.fortuneBreakdown['Reforge']).toBeCloseTo(21 * 1.3333);

	expect(cape.getFortune()).toBeCloseTo(52 * 1.3333);
});

test("Normal Zorro's Cloak Test", () => {
	const cape = new FarmingEquipment(zorrosCape, {
		uniqueVisitors: 84,
		zorro: { enabled: true, mode: ZorroMode.Normal },
	});

	expect(cape.fortuneBreakdown['Base Stats']).toBeCloseTo(10);
	expect(cape.fortuneBreakdown['Green Thumb']).toBeCloseTo(21);
	expect(cape.fortuneBreakdown['Reforge']).toBeCloseTo(21);

	expect(cape.getFortune()).toBeCloseTo(52);
});

const lotusNecklace = {
	id: 397,
	count: 1,
	skyblockId: 'LOTUS_NECKLACE',
	uuid: '2c0af2b1-234d-4a7d-8560-10a2b0eb8da4',
	name: '§5Rooted Lotus Necklace',
	lore: [
		'§7Health: §a+21 §9(+11)',
		'§7Farming Fortune: §a+41 §9(+15)',
		'§7Vitality: §a+4',
		'',
		'§9Green Thumb V',
		'§7Grants §60.25☘ Farming Fortune §7per',
		'§7unique visitor served.',
		'§9Quantum V',
		'§7Grants §4+4♨ Vitality §7on weekdays and',
		'§7§3+2☯ §7of a random §3Wisdom §7stat on',
		'§7weekends.',
		'',
		'§6Piece Bonus: Salesperson',
		'§7Complete §aGarden Visitor Offers §7to',
		'§7gain §6☘ Farming Fortune§7.',
		'',
		'§7Piece Bonus: §6+15☘',
		'§a§lMAXED OUT! NICE!',
		'',
		'§7Garden Visitors Served: §c10,991',
		'',
		'§5§l§ka§r §5§l§5§lEPIC NECKLACE §5§l§ka',
	],
	enchantments: { quantum: 5, green_thumb: 5 },
	attributes: { modifier: 'rooted', timestamp: '1676441040000', rarity_upgrades: '1' },
};

test('Lotus Necklace Test', () => {
	const necklace = new FarmingEquipment(lotusNecklace, {
		uniqueVisitors: 84,
	});
	expect(necklace.fortuneBreakdown).toStrictEqual({
		'Base Stats': 5,
		'Green Thumb': 21,
		Reforge: 15,
		Salesperson: 15,
	});
	expect(necklace.getFortune()).toBe(56);

	// Test fallback to Green Thumb from lore
	const necklace2 = new FarmingEquipment(lotusNecklace);
	expect(necklace2.fortuneBreakdown).toStrictEqual(necklace.fortuneBreakdown);
});

const pestVest = {
	id: 397,
	count: 1,
	skyblockId: 'PEST_VEST',
	uuid: '0570d6b8-0caf-4d19-a7b6-0bcc893e4683',
	name: '§6Rooted Pest Vest',
	lore: [
		'§7Health: §a+14 §9(+14)',
		'§7Farming Fortune: §a+39 §9(+18)',
		'§7Bonus Pest Chance: §a+10%',
		'',
		'§9Green Thumb V',
		'§7Grants §60.25☘ Farming Fortune §7per',
		'§7unique visitor served.',
		'',
		'§7Decreases the spawn cooldown of',
		'§7§6Pests §7by §a20%§7.',
		'',
		'§8§l* §8Co-op Soulbound §8§l*',
		'§6§l§ka§r §6§l§6§lLEGENDARY CLOAK §6§l§ka',
	],
	enchantments: { green_thumb: 5 },
	attributes: { modifier: 'rooted', timestamp: '1723853114556', donated_museum: 'True', rarity_upgrades: '1' },
};

test('Pest Vest Test', () => {
	const vest = new FarmingEquipment(pestVest, {
		uniqueVisitors: 84,
	});

	expect(vest.fortuneBreakdown).toStrictEqual({
		'Green Thumb': 21,
		Reforge: 18,
	});

	expect(vest.getFortune()).toBe(39);
});

const pesthunterCloak = {
	id: 397,
	count: 1,
	skyblockId: 'PESTHUNTERS_CLOAK',
	uuid: 'b8e008d4-cf6c-41a9-afe0-b0ea750b786e',
	name: "§dSqueaky Pesthunter's Cloak",
	lore: ['§d§l§ka§r §d§l§d§lEPIC CLOAK §d§l§ka'],
	enchantments: { green_thumb: 5 },
	attributes: { modifier: 'squeaky', timestamp: '1717854193084', rarity_upgrades: '1' },
};

const pesthunterGloves = {
	id: 397,
	count: 1,
	skyblockId: 'PESTHUNTERS_GLOVES',
	uuid: 'b8e008d4-cf6c-41a9-afe0-b0ea750b786e',
	name: "§dSqueaky Pesthunter's Gloves",
	lore: ['§d§l§ka§r §d§l§d§lEPIC GLOVES §d§l§ka'],
	enchantments: { green_thumb: 5 },
	attributes: { modifier: 'squeaky', timestamp: '1717854193084', rarity_upgrades: '1' },
};

test('Pesthunter Cloak Test', () => {
	const cloak = new FarmingEquipment(pesthunterCloak, {
		uniqueVisitors: 84,
	});

	expect(cloak.fortuneBreakdown).toStrictEqual({
		'Green Thumb': 21,
		Reforge: 8,
	});

	expect(cloak.getFortune()).toBe(29);
});

test('Pesthunter Set Bonus Test', () => {
	const cloak = new FarmingEquipment(pesthunterCloak, {
		uniqueVisitors: 84,
	});
	const gloves = new FarmingEquipment(pesthunterGloves, {
		uniqueVisitors: 84,
	});

	const set = new ArmorSet([], [cloak, gloves]);

	expect(set.fortune).toBe(108);
	expect(set.equipmentSetBonuses).toHaveLength(1);
	expect(set.getFortuneBreakdown()).toStrictEqual({
		[gloves.item.name ?? '']: 29,
		[cloak.item.name ?? '']: 29,
		Eradicator: 50,
	});
});
