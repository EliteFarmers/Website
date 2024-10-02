import { expect, test } from 'vitest';
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
				enchantments: { pesterminator: 5 },
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
	});

	expect(progress).toStrictEqual([
		{
			name: 'Helmet',
			fortune: 85,
			maxFortune: 85,
			ratio: 1,
		}, 
		{
			name: 'Chestplate',
			fortune: 0,
			maxFortune: 90,
			ratio: 0,
		}, 
		{
			name: 'Leggings',
			fortune: 0,
			maxFortune: 90,
			ratio: 0,
		}, 
		{
			name: 'Boots',
			fortune: 0,
			maxFortune: 85,
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
		}
	]);
});
