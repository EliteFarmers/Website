import { expect, test } from 'vitest';
import { FarmingArmor } from '../fortune/farmingarmor.js';

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
	enchantments: { rejuvenate: 5, respiration: 3, aqua_affinity: 1, pesterminator: 6 },
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
	enchantments: { rejuvenate: 5, respiration: 3, aqua_affinity: 1, pesterminator: 3 },
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
	expect(item.getUpgrades()).toStrictEqual([]);
});

test('Almost Maxed Helmet Upgrades Test', () => {
	const item = new FarmingArmor(almostMaxHelmet);
	expect(item.fortune).toBe(72);
	expect(item.fortuneBreakdown['Peridot Gems']).toBe(11);

	const upgrades = item.getUpgrades();
	expect(upgrades).toHaveLength(4);

	expect(upgrades[0]['action']).toBe('recombobulate');
	expect(upgrades[0]['increase']).toBe(8);

	expect(upgrades[1]['action']).toBe('apply');
	expect(upgrades[1]['increase']).toBe(2);
	expect(upgrades[1]['title']).toBe('Perfect Peridot Gemstone');

	expect(upgrades[2]['action']).toBe('apply');
	expect(upgrades[2]['increase']).toBe(2);
	expect(upgrades[2]['title']).toBe('Pesterminator 4');

	expect(upgrades[3]['action']).toBe('apply');
	expect(upgrades[3]['increase']).toBe(1);
	expect(upgrades[3]['title']).toBe('Flawless Peridot Gemstone');
});
