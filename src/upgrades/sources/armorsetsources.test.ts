import { expect, test } from 'vitest';
import { FarmingArmor } from '../../fortune/farmingarmor.js';
import { FARMING_ARMOR_INFO } from '../../items/armor.js';
import { FarmingPlayer } from '../../player/player.js';

test('Armor set bonus', () => {
	const player = new FarmingPlayer({
		armor: [
			{
				id: 397,
				count: 1,
				skyblockId: 'FERMENTO_HELMET',
				uuid: '369f1caf-8d95-43a1-95b5-b437fbcfe118',
				name: '§dMossy Fermento Helmet §4✦',
				lore: [
					'§7§8Harvester Helmet Skin',
					'',
					'§7Health: §a+130',
					'§7Defense: §a+40',
					'§7Speed: §a+12 §9(+7)',
					'§7Farming Fortune: §a+85 §9(+30) §d(+20)',
					'§7Bonus Pest Chance: §a+10%',
					' §6[§2☘§6] §6[§2☘§6]',
					'',
					'§9Pesterminator V',
					'§7Grants §6+5☘ Farming Fortune §7and',
					'§7§2+10ൠ Bonus Pest Chance§7, which',
					'§7increases your chance to spawn',
					'§7bonus §6Pests §7on §aThe Garden§7.',
					'',
					'§8Tiered Bonus: Feast (0/4)',
					'§7Combines the Tiered Bonuses of',
					'§7wearing §a0 pieces §7of the Melon Armor,',
					'§7Cropie Armor, and Squash Armor.',
					'§7§7Grants §60☘ Farming Fortune§7.',
					'',
					'§6Ability: Color Swapper  §e§lLEFT CLICK',
					"§7Swap this helmet's skin through §a90",
					'§a§7unlockable skins!',
					'',
					'§7Selected: §5Purple Wheat',
					'',
					'§d§l§ka§r §d§lMYTHIC HELMET §d§l§ka',
				],
				enchantments: { pesterminator: 6 },
				attributes: {
					skin: 'FERMENTO_ULTIMATE',
					modifier: 'mossy',
					timestamp: '1705977799398',
					favorite_crop: '86',
					rarity_upgrades: '1',
				},
				gems: { PERIDOT_0: 'PERFECT', PERIDOT_1: 'PERFECT' },
			},
		],
	});

	const progress = player.armorSet.getProgress();

	// These are outside of the scope of this test
	progress.forEach((piece) => {
		delete piece.progress;
		delete piece.item;
		delete piece.maxInfo;
		delete piece.wiki;
		delete piece.nextInfo;
		delete piece.info;
		delete piece.upgrades;
	});

	expect(progress).toStrictEqual([
		{
			name: 'Helmet',
			fortune: 92,
			maxFortune: 92,
			ratio: 1,
		},
		{
			name: 'Chestplate',
			fortune: 0,
			maxFortune: 97,
			ratio: 0,
		},
		{
			name: 'Leggings',
			fortune: 0,
			maxFortune: 97,
			ratio: 0,
		},
		{
			name: 'Boots',
			fortune: 0,
			maxFortune: 92,
			ratio: 0,
		},
		{
			name: 'Armor Set Bonus',
			fortune: 0,
			maxFortune: 75,
			ratio: 0,
		},
		{
			name: 'Necklace',
			fortune: 0,
			maxFortune: 56,
			ratio: 0,
		},
		{
			name: 'Cloak',
			fortune: 0,
			maxFortune: 56,
			ratio: 0,
		},
		{
			name: 'Belt',
			fortune: 0,
			maxFortune: 56,
			ratio: 0,
		},
		{
			name: 'Gloves',
			fortune: 0,
			maxFortune: 56,
			ratio: 0,
		},
	]);
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

test('Equipment set bonus', () => {
	const player = new FarmingPlayer({
		armor: [
			{
				id: 397,
				count: 1,
				skyblockId: 'FERMENTO_HELMET',
				uuid: '369f1caf-8d95-43a1-95b5-b437fbcfe118',
				name: '§dMossy Fermento Helmet §4✦',
				lore: ['§7§8Harvester Helmet Skin', '§d§l§ka§r §d§lMYTHIC HELMET §d§l§ka'],
				enchantments: { pesterminator: 6 },
				attributes: {
					skin: 'FERMENTO_ULTIMATE',
					modifier: 'mossy',
					timestamp: '1705977799398',
					favorite_crop: '86',
					rarity_upgrades: '1',
				},
				gems: { PERIDOT_0: 'PERFECT', PERIDOT_1: 'PERFECT' },
			},
		],
		equipment: [pesthunterCloak, pesthunterGloves],
		uniqueVisitors: 84,
	});

	const progress = player.armorSet.getProgress();

	// These are outside of the scope of this test
	progress.forEach((piece) => {
		delete piece.progress;
		delete piece.item;
		delete piece.maxInfo;
		delete piece.wiki;
		delete piece.nextInfo;
		delete piece.info;
		delete piece.upgrades;
	});

	expect(progress).toStrictEqual([
		{
			name: 'Helmet',
			fortune: 92,
			maxFortune: 92,
			ratio: 1,
		},
		{
			name: 'Chestplate',
			fortune: 0,
			maxFortune: 97,
			ratio: 0,
		},
		{
			name: 'Leggings',
			fortune: 0,
			maxFortune: 97,
			ratio: 0,
		},
		{
			name: 'Boots',
			fortune: 0,
			maxFortune: 92,
			ratio: 0,
		},
		{
			name: 'Armor Set Bonus',
			fortune: 0,
			maxFortune: 75,
			ratio: 0,
		},
		{
			name: 'Necklace',
			fortune: 0,
			maxFortune: 56,
			ratio: 0,
		},
		{
			name: 'Cloak',
			fortune: 29,
			maxFortune: 56,
			ratio: 29 / 56,
		},
		{
			name: 'Belt',
			fortune: 0,
			maxFortune: 56,
			ratio: 0,
		},
		{
			name: 'Gloves',
			fortune: 29,
			maxFortune: 56,
			ratio: 29 / 56,
		},
		{
			name: 'Equipment Set Bonus',
			fortune: 50,
			maxFortune: 100,
			ratio: 0.5,
		},
	]);
});

test('Rancher boots preferred upgrade test', () => {
	const boots = FarmingArmor.fakeItem(FARMING_ARMOR_INFO.RANCHERS_BOOTS);
	if (!boots) throw new Error('No boots');

	const player = new FarmingPlayer({
		armor: [boots],
	});

	const progress = player.armorSet.getProgress();

	const bootProgress = progress.find((p) => p.name === 'Boots');
	expect(bootProgress).toBeDefined();
	expect(bootProgress!.item?.skyblockId).toBe('RANCHERS_BOOTS');
	expect(bootProgress!.maxFortune).toBe(113);
});

const bustlingLeggings = {
	id: 300,
	count: 1,
	skyblockId: 'FERMENTO_LEGGINGS',
	uuid: '1a21a85c-1ed8-4c0a-bc92-caf32a52eb15',
	name: '§6Bustling Fermento Leggings',
	lore: [
		'§7Health: §a+195',
		'§7Defense: §a+40',
		'§7Speed: §a+6',
		'§7Bonus Pest Chance: §a+5%',
		'§7Farming Fortune: §a+53 §9(+8)',
		' §8[§8☘§8] §8[§8☘§8]',
		'',
		'§9Pesterminator V',
		'§7Grants §6+10☘ Farming Fortune §7and',
		'§7§2+5ൠ Bonus Pest Chance§7, which',
		'§7increases your chance to spawn',
		'§7bonus §2Pests §7on §aThe Garden§7.',
		'',
		'§6Tiered Bonus: Feast (3/4)',
		'§7Combines the Tiered Bonuses of',
		'§7wearing §a3 pieces §7of the Melon Armor,',
		'§7Cropie Armor, and Squash Armor.',
		'§7§7Grants §650☘ Farming Fortune§7.',
		'',
		'§6§lLEGENDARY LEGGINGS',
	],
	enchantments: {
		pesterminator: 5,
	},
	attributes: {
		modifier: 'bustling',
		timestamp: '1735603042665',
	},
};

test('Bustling Fermento Leggings Upgrades', () => {
	const item = new FarmingArmor(bustlingLeggings);
	const upgrades = item.getUpgrades();

	expect(upgrades).toHaveLength(5);
});
