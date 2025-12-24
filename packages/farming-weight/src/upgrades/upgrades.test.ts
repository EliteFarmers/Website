import { expect, test } from 'vitest';
import { Stat } from '../constants/stats.js';
import { FarmingArmor } from '../fortune/farmingarmor.js';
import { FarmingEquipment } from '../fortune/farmingequipment.js';

const maxHelmet = {
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
		'§d§l§ka§r §d§l§d§lMYTHIC HELMET §d§l§ka',
	],
	enchantments: {
		rejuvenate: 5,
		respiration: 3,
		aqua_affinity: 1,
		pesterminator: 6,
	},
	attributes: {
		skin: 'FERMENTO_ULTIMATE',
		modifier: 'mossy',
		timestamp: '1676403240000',
		favorite_crop: '89',
		rarity_upgrades: '1',
	},
	gems: { PERIDOT_0: 'PERFECT', PERIDOT_1: 'PERFECT' },
};

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
	enchantments: {
		rejuvenate: 5,
		respiration: 3,
		aqua_affinity: 1,
		pesterminator: 3,
	},
	attributes: {
		skin: 'FERMENTO_ULTIMATE',
		modifier: 'mossy',
		timestamp: '1676403240000',
		favorite_crop: '89',
	},
	gems: { PERIDOT_0: 'FLAWLESS', PERIDOT_1: 'FINE' },
};

test('Maxed Helmet Upgrades Test', () => {
	const item = new FarmingArmor(maxHelmet);
	expect(item.fortune).toBe(92);
	expect(item.fortuneBreakdown['Peridot Gems']).toBe(20);
	const upgrades = item.getUpgrades();
	expect(upgrades).toHaveLength(1);
	expect(upgrades[0].title).toBe('Helianthus Helmet');
	expect(upgrades[0].action).toBe('upgrade');
	expect(upgrades[0].category).toBe('item');
});

test('Almost Maxed Helmet Upgrades Test', () => {
	const item = new FarmingArmor(almostMaxHelmet);
	expect(item.fortune).toBe(72);
	expect(item.fortuneBreakdown['Peridot Gems']).toBe(11);

	const upgrades = item.getUpgrades();
	expect(upgrades).toHaveLength(5);

	const recomb = upgrades.find((u) => u.action === 'recombobulate');
	expect(recomb).toBeDefined();
	expect(recomb?.increase).toBe(8);

	const perfectPeridot = upgrades.find((u) => u.title === 'Perfect Peridot Gemstone');
	expect(perfectPeridot).toBeDefined();
	expect(perfectPeridot?.action).toBe('apply');
	expect(perfectPeridot?.increase).toBe(2);

	const pest4 = upgrades.find((u) => u.title === 'Pesterminator 4');
	expect(pest4).toBeDefined();
	expect(pest4?.action).toBe('apply');
	expect(pest4?.increase).toBe(2);
	expect(pest4?.cost?.items?.['ENCHANTMENT_PESTERMINATOR_1']).toBe(4);

	const flawlessPeridot = upgrades.find((u) => u.title === 'Flawless Peridot Gemstone');
	expect(flawlessPeridot).toBeDefined();
	expect(flawlessPeridot?.action).toBe('apply');
	expect(flawlessPeridot?.increase).toBe(1);

	const helianthus = upgrades.find((u) => u.title === 'Helianthus Helmet');
	expect(helianthus).toBeDefined();
	expect(helianthus?.action).toBe('upgrade');
});

const lotusNecklace = {
	id: 397,
	count: 1,
	skyblockId: 'LOTUS_NECKLACE',
	uuid: '2c0af2b1-234d-4a7d-8560-10a2b0eb8da4',
	name: '§5Rooted Lotus Necklace',
	lore: ['§5§l§ka§r §5§l§5§lEPIC NECKLACE §5§l§ka'],
	enchantments: { green_thumb: 4 },
	attributes: {
		modifier: 'rooted',
		timestamp: '1676441040000',
		rarity_upgrades: '1',
	},
};

test('Enchantment Upgrades Test', () => {
	const item = new FarmingEquipment(lotusNecklace);

	const upgrades = item.getUpgrades();
	expect(upgrades).toHaveLength(2);

	const green = upgrades.find((u) => u.title.startsWith('Green Thumb'));
	expect(green).toBeDefined();
	expect(green!.cost?.items?.['ENCHANTMENT_GREEN_THUMB_1']).toBe(8);

	const green3 = new FarmingEquipment({
		...lotusNecklace,
		enchantments: { green_thumb: 3 },
	});
	expect(
		green3.getUpgrades().find((u) => u.title.startsWith('Green Thumb'))?.cost?.items?.['ENCHANTMENT_GREEN_THUMB_1']
	).toBe(4);

	const green2 = new FarmingEquipment({
		...lotusNecklace,
		enchantments: { green_thumb: 2 },
	});
	expect(
		green2.getUpgrades().find((u) => u.title.startsWith('Green Thumb'))?.cost?.items?.['ENCHANTMENT_GREEN_THUMB_1']
	).toBe(2);

	const green1 = new FarmingEquipment({
		...lotusNecklace,
		enchantments: { green_thumb: 1 },
	});
	expect(
		green1.getUpgrades().find((u) => u.title.startsWith('Green Thumb'))?.cost?.items?.['ENCHANTMENT_GREEN_THUMB_1']
	).toBe(1);

	const green0 = new FarmingEquipment({
		...lotusNecklace,
		enchantments: { green_thumb: 0 },
	});
	expect(
		green0.getUpgrades().find((u) => u.title.startsWith('Green Thumb'))?.cost?.items?.['ENCHANTMENT_GREEN_THUMB_1']
	).toBe(1);

	const green5 = new FarmingEquipment({
		...lotusNecklace,
		enchantments: { green_thumb: 5 },
	});
	expect(green5.getUpgrades().some((u) => u.title.startsWith('Green Thumb'))).toBe(false);
});

test('Conflicting Reforges Test', () => {
	const item = new FarmingEquipment({
		...lotusNecklace,
		enchantments: { green_thumb: 5 },
		attributes: { modifier: 'blooming' },
	});

	// It has Blooming reforge (Common/Uncommon/Rare/Epic)
	// Upgrades should include Rooted (Epic) and Squeaky (Epic)
	// And they should have a conflictKey
	const upgrades = item.getUpgrades();
	const reforges = upgrades.filter((u) => u.category === 'reforge');

	expect(reforges.length).toBeGreaterThan(0);
	for (const reforge of reforges) {
		expect(reforge.conflictKey).toBe('reforge');
	}

	const rooted = reforges.find((u) => u.title === 'Reforge to Rooted');
	expect(rooted).toBeDefined();

	const squeaky = reforges.find((u) => u.title === 'Reforge to Squeaky');
	expect(squeaky).toBeDefined();
});

test('Upgrade objects have stats field populated', () => {
	const item = new FarmingArmor(almostMaxHelmet);

	const upgrades = item.getUpgrades();
	expect(upgrades.length).toBeGreaterThan(0);

	// All upgrades should have a stats field
	for (const upgrade of upgrades) {
		expect(upgrade.stats).toBeDefined();

		// If there's an increase in fortune, stats should include FarmingFortune
		if (upgrade.increase > 0) {
			expect(upgrade.stats?.['farming_fortune']).toBeDefined();
		}
	}
});

test('Lotus to Blossom Necklace upgrade shows correct fortune delta', () => {
	const maxedLotusNecklace = {
		id: 397,
		count: 1,
		damage: 3,
		skyblockId: 'LOTUS_NECKLACE',
		uuid: 'b74ec0ba-0d2f-4d97-82a9-65428a9b8d5a',
		name: '§5Rooted Lotus Necklace',
		lore: ['§5§l§ka§r §5§lEPIC NECKLACE §5§l§ka'],
		enchantments: { green_thumb: 5 },
		attributes: {
			modifier: 'rooted',
			timestamp: '1676577900000',
			rarity_upgrades: '1',
		},
	};

	const item = new FarmingEquipment(maxedLotusNecklace);

	// Lotus has 5 base fortune, Blossom has 7 base fortune
	// Lotus is Epic (recombobulated from Rare), so Rooted gives 15 fortune
	// Blossom will be Legendary (recombobulated from Epic), so Rooted gives 18 fortune
	// Base increase: 7 - 5 = 2, Reforge increase: 18 - 15 = 3, Total: 5
	const upgrades = item.getUpgrades();
	const blossomUpgrade = upgrades.find((u) => u.title === 'Blossom Necklace');

	expect(blossomUpgrade).toBeDefined();
	expect(blossomUpgrade?.increase).toBe(5); // Base (2) + Reforge (3)
	expect(blossomUpgrade?.stats?.['farming_fortune']).toBe(5); // Stats should also show total delta

	const progress = item.getProgress([Stat.FarmingFortune]);
	const base = progress.find((p) => p.name === 'Base Stats');
	expect(base).toBeDefined();
	expect(base?.current).toBe(5);
	expect(base?.max).toBe(7);
});

test('Lotus to Blossom Necklace upgrade includes piece bonus delta', () => {
	const lotusNecklaceWithBonus = {
		id: 397,
		count: 1,
		damage: 3,
		skyblockId: 'LOTUS_NECKLACE',
		uuid: 'b74ec0ba-0d2f-4d97-82a9-65428a9b8d5a',
		name: '§5Rooted Lotus Necklace',
		lore: [
			'§7Farming Fortune: §a+40.5 §9(+15)',
			'',
			'§6Piece Bonus: Salesperson',
			'',
			'§7Piece Bonus: §6+15☘',
			'',
			'§5§l§ka§r §5§lEPIC NECKLACE §5§l§ka',
		],
		enchantments: { green_thumb: 5 },
		attributes: {
			modifier: 'rooted',
			timestamp: '1676577900000',
			rarity_upgrades: '1',
		},
	};

	const item = new FarmingEquipment(lotusNecklaceWithBonus);
	const upgrades = item.getUpgrades();
	const blossomUpgrade = upgrades.find((u) => u.title === 'Blossom Necklace');

	// Base increase: 7 - 5 = 2
	// Reforge increase (Rooted): 18 - 15 = 3
	// Piece bonus increase (Lotus -> Blossom): 15 -> 22.5 = +7.5
	// Total: 12.5
	expect(blossomUpgrade).toBeDefined();
	expect(blossomUpgrade?.increase).toBeCloseTo(12.5);
	expect(blossomUpgrade?.stats?.['farming_fortune']).toBeCloseTo(12.5);
});

test('Epic Fermento Helmet with 2 Perfect Peridots upgrading to Helianthus should include gem rarity increase', () => {
	const epicFermentoHelmet = {
		id: 397,
		count: 1,
		skyblockId: 'FERMENTO_HELMET',
		uuid: '9a6966f0-dd42-4797-af83-e0461f00bd02',
		name: '§5Mossy Fermento Helmet',
		lore: ['§5§l§ka§r §5§l§d§lEPIC HELMET §5§l§ka'],
		enchantments: {},
		attributes: {
			modifier: 'mossy',
			timestamp: '1676403240000',
		},
		gems: { PERIDOT_0: 'PERFECT', PERIDOT_1: 'PERFECT' },
	};

	const item = new FarmingArmor(epicFermentoHelmet);
	// Epic with 2 Perfect Peridots = 6 + 6 = 12
	expect(item.fortuneBreakdown['Peridot Gems']).toBe(12);

	const upgrades = item.getUpgrades();
	const helianthusUpgrade = upgrades.find((u) => u.title === 'Helianthus Helmet');

	expect(helianthusUpgrade).toBeDefined();
	// Base fortune increase: 35 - 30 = 5
	// Gem rarity increase (Legendary Perfect = 8 each): 16 - 12 = 4
	// Reforge stat increase (Mossy on Legendary = 25, on Epic = 20): 25 - 20 = 5
	// Total: 14
	expect(helianthusUpgrade?.increase).toBe(14);
});

test('Recombobulated Legendary Fermento Helmet upgrading to Helianthus (Mythic) should include gem rarity increase', () => {
	const recombLegendaryFermentoHelmet = {
		id: 397,
		count: 1,
		skyblockId: 'FERMENTO_HELMET',
		uuid: '9a6966f0-dd42-4797-af83-e0461f00bd02',
		name: '§cRecombobulated Mossy Fermento Helmet',
		lore: ['§c§l§ka§r §c§l§c§lLEGENDARY HELMET §c§l§ka'],
		enchantments: {},
		attributes: {
			modifier: 'mossy',
			timestamp: '1676403240000',
			rarity_upgrades: '1',
		},
		gems: { PERIDOT_0: 'PERFECT', PERIDOT_1: 'PERFECT' },
	};

	const item = new FarmingArmor(recombLegendaryFermentoHelmet);
	// Legendary with 2 Perfect Peridots = 8 + 8 = 16
	expect(item.fortuneBreakdown['Peridot Gems']).toBe(16);

	const upgrades = item.getUpgrades();
	const helianthusUpgrade = upgrades.find((u) => u.title === 'Helianthus Helmet');

	expect(helianthusUpgrade).toBeDefined();
	// Base fortune increase: 35 - 30 = 5
	// Gem rarity increase (Mythic Perfect = 10 each): 20 - 16 = 4
	// Reforge stat increase (Mossy on Mythic = 30, on Legendary = 25): 30 - 25 = 5
	// Total: 14
	expect(helianthusUpgrade?.increase).toBe(14);
});

test('Epic Fermento Helmet with Bustling reforge upgrading to Helianthus should include reforge stat increase', () => {
	const epicBustlingFermentoHelmet = {
		id: 397,
		count: 1,
		skyblockId: 'FERMENTO_HELMET',
		uuid: '9a6966f0-dd42-4797-af83-e0461f00bd02',
		name: '§5Bustling Fermento Helmet',
		lore: ['§5§l§ka§r §5§l§d§lEPIC HELMET §5§l§ka'],
		enchantments: {},
		attributes: {
			modifier: 'bustling',
			timestamp: '1676403240000',
		},
	};

	const item = new FarmingArmor(epicBustlingFermentoHelmet);
	// Epic Fermento has 30 base, Bustling on Epic gives +6
	expect(item.fortune).toBe(36);

	const upgrades = item.getUpgrades();
	const helianthusUpgrade = upgrades.find((u) => u.title === 'Helianthus Helmet');

	expect(helianthusUpgrade).toBeDefined();
	// Base fortune increase: 35 - 30 = 5
	// Reforge stat increase (Bustling on Legendary = 8, on Epic = 6): 8 - 6 = 2
	// Total: 7
	expect(helianthusUpgrade?.increase).toBe(7);
});

test('Recombobulated Epic Fermento with Bustling reforge and gems upgrading to Mythic Helianthus', () => {
	const recombEpicFermentoHelmet = {
		id: 397,
		count: 1,
		skyblockId: 'FERMENTO_HELMET',
		uuid: '9a6966f0-dd42-4797-af83-e0461f00bd02',
		name: '§6Bustling Fermento Helmet',
		lore: ['§6§l§ka§r §6§l§6§lLEGENDARY HELMET §6§l§ka'],
		enchantments: {},
		attributes: {
			modifier: 'bustling',
			timestamp: '1676403240000',
			rarity_upgrades: '1',
		},
		gems: { PERIDOT_0: 'PERFECT', PERIDOT_1: 'PERFECT' },
	};

	const item = new FarmingArmor(recombEpicFermentoHelmet);
	// Legendary Fermento: 30 base + 8 reforge (Bustling on Legendary) + 16 gems (Legendary Perfect Peridot = 8 each)
	expect(item.fortune).toBe(54);

	const upgrades = item.getUpgrades();
	const helianthusUpgrade = upgrades.find((u) => u.title === 'Helianthus Helmet');

	expect(helianthusUpgrade).toBeDefined();
	// Base fortune increase: 35 - 30 = 5
	// Gem rarity increase (Mythic Perfect = 10 each): 20 - 16 = 4
	// Reforge stat increase (Bustling on Mythic = 10, on Legendary = 8): 10 - 8 = 2
	// Total: 11
	expect(helianthusUpgrade?.increase).toBe(11);
});
