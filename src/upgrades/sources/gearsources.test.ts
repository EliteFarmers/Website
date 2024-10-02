import { expect, test } from 'vitest';
import { FarmingArmor } from '../../fortune/farmingarmor.js';
import { FarmingEquipment } from '../../fortune/farmingequipment.js';

const almostMaxHelmet = {
	id: 397,
	count: 1,
	skyblockId: 'FERMENTO_HELMET',
	uuid: '9a6966f0-dd42-4797-af83-e0461f00bd02',
	name: '§dMossy Fermento Helmet §4✦',
	lore: [
		'§7§8Harvester Helmet Skin',
		'',
		'§7Health: §a+130',
		'§7Defense: §a+40',
		'§7Speed: §a+12 §9(+7)',
		'§7Farming Fortune: §a+85 §9(+30) §d(+20)',
		'§7Health Regen: §a+10',
		'§7Bonus Pest Chance: §a+10%',
		' §6[§2☘§6] §6[§2☘§6]',
		'',
		'§9Aqua Affinity I',
		'§7Increases your underwater mining',
		'§7rate.',
		'§9Pesterminator V',
		'§7Grants §6+5☘ Farming Fortune §7and',
		'§7§2+10ൠ Bonus Pest Chance§7, which',
		'§7increases your chance to spawn',
		'§7bonus §6Pests §7on the §bGarden§7.',
		'§9Rejuvenate V',
		'§7Grants §c+10❣ Health Regen§7.',
		'§9Respiration III',
		'§7Extends your underwater breathing',
		'§7time by §a45s§7.',
		'',
		'§6Tiered Bonus: Feast (3/4)',
		'§7Combines the Tiered Bonuses of',
		'§7wearing §a3 pieces §7of the Melon Armor,',
		'§7Cropie Armor, and Squash Armor.',
		'§7§7Grants §650☘ Farming Fortune§7.',
		'',
		'§6Ability: Color Swapper  §e§lLEFT CLICK',
		"§7Swap this helmet's skin through §a90",
		'§a§7unlockable skins!',
		'',
		'§7Selected: §8Black Wheat',
		'',
		'§d§l§ka§r §d§l§d§lLEGENDARY HELMET §d§l§ka',
	],
	enchantments: { rejuvenate: 5, respiration: 3, aqua_affinity: 1, pesterminator: 3 },
	attributes: {
		skin: 'FERMENTO_ULTIMATE',
		modifier: 'mossy',
		timestamp: '1676403240000',
		favorite_crop: '89',
	},
	gems: { PERIDOT_0: 'FLAWLESS', PERIDOT_1: 'FINE' },
};

test('Almost maxed fermento fortune sources', () => {
	const item = new FarmingArmor(almostMaxHelmet);
	expect(item.fortune).toBe(69);
	expect(item.fortuneBreakdown['Peridot Gems']).toBe(11);

	const upgrades = item.getUpgrades();
	expect(upgrades).toHaveLength(4);

	const progress = item.getProgress();

	// These are outside of the scope of this test
	progress.forEach((piece) => {
		delete piece.wiki;
		delete piece.nextInfo;
		delete piece.info;
	});

	expect(progress).toStrictEqual([
		{
			name: 'Base Stats',
			fortune: 30,
			maxFortune: 30,
			ratio: 1,
		},
		{
			name: 'Reforge Stats',
			fortune: 25,
			maxFortune: 30,
			ratio: 25 / 30,
		},
		{
			name: 'Gemstone Slots',
			fortune: 11,
			maxFortune: 20,
			ratio: 11 / 20,
		},
		{
			name: 'Pesterminator',
			fortune: 3,
			maxFortune: 5,
			ratio: 3 / 5,
		},
	]);
});

const melonBoots = {
	id: 301,
	count: 1,
	skyblockId: 'MELON_BOOTS',
	uuid: 'fbd00e00-a616-4a30-b0f9-802f257e7c64',
	name: '§aMelon Boots',
	lore: [
		'§7Health: §a+100',
		'§7Defense: §a+25',
		'§7Speed: §a+2',
		'§7Farming Fortune: §a+15',
		'',
		'§8Tiered Bonus: Cropier Crops (0/4)',
		'§7§7Farming Wheat, Carrots, and Potatoes',
		'§7has a §a0.03% §7chance of dropping a',
		'§7Cropie. §7Grants §60☘ Farming Fortune§7.',
		'',
		"§6Ability: Farmer's Grace ",
		'§7Grants immunity to trampling crops.',
		'',
		'§7§8This item can be reforged!',
		'§a§lUNCOMMON BOOTS',
	],
	enchantments: null,
	attributes: { timestamp: '1676403240000' },
};

test('Melon boots fortune sources', () => {
	const item = new FarmingArmor(melonBoots);
	expect(item.fortune).toBe(15);
	expect(item.fortuneBreakdown['Base Stats']).toBe(15);

	const progress = item.getProgress();

	// These are outside of the scope of this test
	progress.forEach((piece) => {
		delete piece.wiki;
		delete piece.nextInfo;
		delete piece.info;
	});

	expect(progress).toStrictEqual([
		{
			name: 'Base Stats',
			fortune: 15,
			maxFortune: 30,
			ratio: 0.5,
		},
		{
			name: 'Reforge Stats',
			fortune: 0,
			maxFortune: 30,
			ratio: 0,
		},
		{
			name: 'Gemstone Slots',
			fortune: 0,
			maxFortune: 20,
			ratio: 0,
		},
		{
			name: 'Pesterminator',
			fortune: 0,
			maxFortune: 5,
			ratio: 0,
		},
	]);

	expect(progress.reduce((acc, curr) => acc + curr.fortune, 0)).toBe(item.fortune);
});

test('Same maxed armor fortune sources', () => {
	const helmet = new FarmingArmor(almostMaxHelmet);
	const boots = new FarmingArmor(melonBoots);

	const helmetProgress = helmet.getProgress();
	const bootsProgress = boots.getProgress();

	expect(helmetProgress.length).toBe(bootsProgress.length);

	for (let i = 0; i < helmetProgress.length; i++) {
		helmetProgress[i].fortune = 0;
		helmetProgress[i].ratio = 0;

		bootsProgress[i].fortune = 0;
		bootsProgress[i].ratio = 0;
	}

	expect(helmetProgress).toStrictEqual(bootsProgress);
});

const lotusNecklace = {
	id: 397,
	count: 1,
	skyblockId: 'LOTUS_NECKLACE',
	uuid: 'b74ec0ba-0d2f-4d97-82a9-65428a9b8d5a',
	name: '§5Rooted Lotus Necklace',
	lore: [
		'§7Health: §a+21 §9(+11)',
		'§7Farming Fortune: §a+40.5 §9(+15)',
		'',
		'§9Green Thumb V',
		'§7Grants §60.25☘ Farming Fortune §7per',
		'§7unique visitor served.',
		'',
		'§6Piece Bonus: Salesperson',
		'§7Complete §aGarden Visitor Offers §7to',
		'§7gain §6☘ Farming Fortune§7.',
		'',
		'§7Piece Bonus: §6+12☘',
		'§7Next Upgrade: §6+13☘ §8(§a2,890§7/§c3,000§8)',
		'',
		'§5§l§ka§r §5§l§5§lEPIC NECKLACE §5§l§ka',
	],
	enchantments: { green_thumb: 5 },
	attributes: { modifier: 'rooted', timestamp: '1676577900000', rarity_upgrades: '1' },
};

test('Lotus necklace fortune sources', () => {
	const necklace = new FarmingEquipment(lotusNecklace, {
		uniqueVisitors: 82,
	});

	expect(necklace.fortune).toBe(52.5);

	const progress = necklace.getProgress();

	// These are outside of the scope of this test
	progress.forEach((piece) => {
		delete piece.wiki;
		delete piece.nextInfo;
		delete piece.info;
	});

	expect(progress.reduce((acc, curr) => acc + curr.fortune, 0)).toBe(necklace.fortune);

	expect(progress).toStrictEqual([
		{
			name: 'Base Stats',
			fortune: 5,
			maxFortune: 5,
			ratio: 1,
		},
		{
			name: 'Reforge Stats',
			fortune: 15,
			maxFortune: 15,
			ratio: 1,
		},
		{
			name: 'Salesperson Ability',
			fortune: 12,
			maxFortune: 15,
			ratio: 0.8,
		},
		{
			name: 'Green Thumb',
			fortune: 82 * 0.25,
			maxFortune: 84 * 0.25,
			ratio: 82 / 84,
		},
	]);
});

const maxLotusBracelet = {
	id: 397,
	count: 1,
	skyblockId: 'LOTUS_BRACELET',
	uuid: '4e13528f-d1d2-455e-90b2-d1552932be74',
	name: '§5Rooted Lotus Bracelet',
	lore: [
		'§7Health: §a+21 §9(+11)',
		'§7Farming Fortune: §a+41 §9(+15)',
		'',
		'§9Green Thumb V',
		'§7Grants §60.25☘ Farming Fortune §7per',
		'§7unique visitor served.',
		'',
		'§6Piece Bonus: Salesperson',
		'§7Complete §aGarden Visitor Offers §7to',
		'§7gain §6☘ Farming Fortune§7.',
		'',
		'§7Piece Bonus: §6+15☘',
		'§a§lMAXED OUT! NICE!',
		'',
		'§7Garden Visitors Served: §c17,803',
		'',
		'§8§l* §8Co-op Soulbound §8§l*',
		'§5§l§ka§r §5§lEPIC BRACELET §5§l§ka',
	],
	enchantments: { green_thumb: 5 },
	attributes: { modifier: 'rooted', timestamp: '1688158680000', donated_museum: 'True', rarity_upgrades: '1' },
};

test('Maxed lotus bracelet fortune sources', () => {
	const bracelet = new FarmingEquipment(maxLotusBracelet, {
		uniqueVisitors: 84,
	});

	expect(bracelet.fortune).toBe(56);

	const progress = bracelet.getProgress();

	// These are outside of the scope of this test
	progress.forEach((piece) => {
		delete piece.wiki;
		delete piece.nextInfo;
		delete piece.info;
	});

	expect(progress.reduce((acc, curr) => acc + curr.fortune, 0)).toBe(bracelet.fortune);

	expect(progress).toStrictEqual([
		{
			name: 'Base Stats',
			fortune: 5,
			maxFortune: 5,
			ratio: 1,
		},
		{
			name: 'Reforge Stats',
			fortune: 15,
			maxFortune: 15,
			ratio: 1,
		},
		{
			name: 'Salesperson Ability',
			fortune: 15,
			maxFortune: 15,
			ratio: 1,
		},
		{
			name: 'Green Thumb',
			fortune: 84 * 0.25,
			maxFortune: 84 * 0.25,
			ratio: 1,
		},
	]);
});