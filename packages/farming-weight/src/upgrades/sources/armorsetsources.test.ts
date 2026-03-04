import { expect, test } from 'vitest';
import { Stat } from '../../constants/stats.js';
import { FarmingArmor } from '../../fortune/farmingarmor.js';
import type { EliteItemDto } from '../../fortune/item.js';
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
			current: 92,
			max: 97,
			ratio: 92 / 97,
		},
		{
			name: 'Chestplate',
			current: 0,
			max: 102,
			ratio: 0,
		},
		{
			name: 'Leggings',
			current: 0,
			max: 102,
			ratio: 0,
		},
		{
			name: 'Boots',
			current: 0,
			max: 97,
			ratio: 0,
		},
		{
			name: 'Armor Set Bonus',
			current: 0,
			max: 75,
			ratio: 0,
		},
		{
			name: 'Necklace',
			current: 0,
			max: 81.75,
			ratio: 0,
		},
		{
			name: 'Cloak',
			current: 0,
			max: 81.75,
			ratio: 0,
		},
		{
			name: 'Belt',
			current: 0,
			max: 81.75,
			ratio: 0,
		},
		{
			name: 'Gloves',
			current: 0,
			max: 81.75,
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
	attributes: {
		modifier: 'squeaky',
		timestamp: '1717854193084',
		rarity_upgrades: '1',
	},
};

const pesthunterGloves = {
	id: 397,
	count: 1,
	skyblockId: 'PESTHUNTERS_GLOVES',
	uuid: 'b8e008d4-cf6c-41a9-afe0-b0ea750b786e',
	name: "§dSqueaky Pesthunter's Gloves",
	lore: ['§d§l§ka§r §d§l§d§lEPIC GLOVES §d§l§ka'],
	enchantments: { green_thumb: 5 },
	attributes: {
		modifier: 'squeaky',
		timestamp: '1717854193084',
		rarity_upgrades: '1',
	},
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
			current: 92,
			max: 97,
			ratio: 92 / 97,
		},
		{
			name: 'Chestplate',
			current: 0,
			max: 102,
			ratio: 0,
		},
		{
			name: 'Leggings',
			current: 0,
			max: 102,
			ratio: 0,
		},
		{
			name: 'Boots',
			current: 0,
			max: 97,
			ratio: 0,
		},
		{
			name: 'Armor Set Bonus',
			current: 0,
			max: 75,
			ratio: 0,
		},
		{
			name: 'Necklace',
			current: 0,
			max: 81.75,
			ratio: 0,
		},
		{
			name: 'Cloak',
			current: 29,
			max: 81.75,
			ratio: 29 / 81.75,
		},
		{
			name: 'Belt',
			current: 0,
			max: 81.75,
			ratio: 0,
		},
		{
			name: 'Gloves',
			current: 29,
			max: 81.75,
			ratio: 29 / 81.75,
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
	expect(bootProgress!.max).toBe(157);
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

	expect(upgrades).toHaveLength(7);
});

test('Armor purchase upgrades have stats populated', () => {
	// Create a player with no armor to trigger purchase upgrades
	const player = new FarmingPlayer({});

	const progress = player.armorSet.getProgress();

	// Find a slot with upgrades (should recommend purchasing starting armor)
	const helmetProgress = progress.find((p) => p.name === 'Helmet');
	expect(helmetProgress).toBeDefined();
	expect(helmetProgress?.upgrades).toBeDefined();

	if (helmetProgress?.upgrades && helmetProgress.upgrades.length > 0) {
		const purchaseUpgrade = helmetProgress.upgrades[0];
		expect(purchaseUpgrade).toBeDefined();
		expect(purchaseUpgrade.stats).toBeDefined();

		// Purchase upgrades should have stats from the fake item's getStats()
		// This verifies the stats field is populated, not hardcoded to just FarmingFortune
		expect(typeof purchaseUpgrade.stats).toBe('object');

		// If there's an increase, FarmingFortune should be present
		if (purchaseUpgrade.increase > 0) {
			expect(purchaseUpgrade.stats?.['farming_fortune']).toBeDefined();
		}
	}
});

test('Helianthus helmet upgrades', () => {
	const player = new FarmingPlayer({
		armor: [
			{
				id: 397,
				count: 1,
				damage: 3,
				skyblockId: 'HELIANTHUS_HELMET',
				uuid: '3c71fa65-225e-48dc-80d5-cfa604b758a6',
				name: '§dMossy Helianthus Helmet §4✦',
				lore: [
					'§7§8Harvester Helmet Skin',
					'',
					'§7Health: §c+140',
					'§7Defense: §a+50',
					'§7Bonus Pest Chance: §2+26%',
					'§7Farming Fortune: §6+97 §9(+30) §d(+20)',
					'§7Speed: §f+13 §9(+7)',
					' §6[§2☘§6] §6[§2☘§6]',
					'',
					'§9§d§lWisdom V',
					'§7Gain §b5 §7Intelligence for every §b5',
					'§b§7levels of exp you have on you.',
					'§7Capped at §b100 §7Intelligence.',
					'§9Aqua Affinity I',
					'§7Increases your underwater mining',
					'§7rate.',
					'§9Pesterminator VI',
					'§7Grants §6+12☘ Farming Fortune §7and',
					'§7§2+6ൠ Bonus Pest Chance§7, which',
					'§7increases your chance to spawn',
					'§7bonus §2ൠ Pests §7on §aThe Garden§7.',
					'',
					'§6Tiered Bonus: Feast (4/4)',
					'§7Combines the Tiered Bonuses of',
					'§7wearing §a4 pieces §7of the Melon Armor,',
					'§7Cropie Armor, Squash Armor, and',
					'§7Fermento Armor. §7Grants §675☘ Farming',
					'§6Fortune§7.',
					'',
					'§6Ability: Color Swapper  §e§lLEFT CLICK',
					"§7Swap this helmet's skin through 117",
					'§7unlockable skins!',
					'',
					'§7Selected: §5Purple Melon',
					'',
					'§8§l* §8Co-op Soulbound §8§l*',
					'§d§l§ka§r §d§lMYTHIC HELMET §d§l§ka',
				],
				enchantments: {
					aqua_affinity: 1,
					pesterminator: 6,
					ultimate_wisdom: 5,
				},
				attributes: {
					skin: 'FERMENTO_ULTIMATE',
					modifier: 'mossy',
					timestamp: '1676601600000',
					skin_texture:
						'ewogICJ0aW1lc3RhbXAiIDogMTcwOTgxMjIyNzIwMiwKICAicHJvZmlsZUlkIiA6ICJjYjYxY2U5ODc4ZWI0NDljODA5MzliNWYxNTkwMzE1MiIsCiAgInByb2ZpbGVOYW1lIiA6ICJWb2lkZWRUcmFzaDUxODUiLAogICJzaWduYXR1cmVSZXF1aXJlZCIgOiB0cnVlLAogICJ0ZXh0dXJlcyIgOiB7CiAgICAiU0tJTiIgOiB7CiAgICAgICJ1cmwiIDogImh0dHA6Ly90ZXh0dXJlcy5taW5lY3JhZnQubmV0L3RleHR1cmUvNTgzNjE1NDAyY2JlNzZjMDkwMzhkNThmYzllNGUwN2NjYjUyYjI4NGM3ZjM0MGU1ZDgwOTM0ZmUyZjQ3MDliMCIKICAgIH0KICB9Cn0=',
					favorite_crop: '77',
					donated_museum: '1',
					rarity_upgrades: '1',
				},
				gems: {
					PERIDOT_0: 'PERFECT',
					PERIDOT_1: 'PERFECT',
				},
			} as EliteItemDto,
		],
	});

	const progress = player.armorSet.getProgress([Stat.FarmingFortune], false);
	const helmetProgress = progress.find((p) => p.name === 'Helmet');
	expect(helmetProgress).toBeDefined();
	expect(helmetProgress!.item?.skyblockId).toBe('HELIANTHUS_HELMET');

	expect(helmetProgress!.current).toBe(helmetProgress!.max);
});
