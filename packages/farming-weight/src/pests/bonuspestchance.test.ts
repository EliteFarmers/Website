import { expect, test } from 'vitest';
import { Stat } from '../constants/stats.js';
import { FarmingArmor } from '../fortune/farmingarmor.js';
import { FARMING_ARMOR_INFO } from '../items/armor.js';
import { FarmingPlayer } from '../player/player.js';

test('Wriggling Larva contributes Bonus Pest Chance', () => {
	const player = new FarmingPlayer({
		wrigglingLarva: 3,
	});

	const breakdown = player.getStatBreakdown(Stat.BonusPestChance);
	const total = Object.values(breakdown).reduce((acc, val) => acc + val.value, 0);
	expect(total).toBe(6);
	expect(breakdown['Wriggling Larva'].value).toBe(6);

	const progress = player.getProgress([Stat.BonusPestChance]);
	const larva = progress.find((p) => p.name === 'Wriggling Larva');
	expect(larva?.stats?.[Stat.BonusPestChance]).toStrictEqual({
		current: 6,
		max: 10,
		ratio: 0.6,
	});

	const upgrades = player.getUpgrades({ stat: Stat.BonusPestChance });
	const next = upgrades.find((u) => u.title === 'Wriggling Larva');
	expect(next?.stats?.[Stat.BonusPestChance]).toBe(2);
});

test('Biohazard armor pieces provide Bonus Pest Chance', () => {
	const helmetInfo = FARMING_ARMOR_INFO.BIOHAZARD_HELMET;
	const helmet = FarmingArmor.fakeItem(helmetInfo);
	expect(helmet?.getStat(Stat.BonusPestChance)).toBe(16.5);

	const player = new FarmingPlayer({
		armor: [
			FarmingArmor.fakeItem(FARMING_ARMOR_INFO.BIOHAZARD_HELMET)!,
			FarmingArmor.fakeItem(FARMING_ARMOR_INFO.BIOHAZARD_CHESTPLATE)!,
			FarmingArmor.fakeItem(FARMING_ARMOR_INFO.BIOHAZARD_LEGGINGS)!,
			FarmingArmor.fakeItem(FARMING_ARMOR_INFO.BIOHAZARD_BOOTS)!,
		],
	});

	const bpc = player.getStatBreakdown(Stat.BonusPestChance);
	const total = Object.values(bpc).reduce((acc, val) => acc + val.value, 0);
	expect(total).toBe(66);
});
