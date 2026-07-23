import { expect, test } from 'vitest';
import { SprayonatorTier } from '../constants/specific.js';
import { Stat } from '../constants/stats.js';
import { FarmingAccessory } from '../fortune/farmingaccessory.js';
import { FarmingArmor } from '../fortune/farmingarmor.js';
import { FarmingPet } from '../fortune/farmingpet.js';
import { FARMING_ACCESSORIES_INFO } from '../items/accessories.js';
import { FARMING_ARMOR_INFO } from '../items/armor.js';
import { FarmingPlayer } from '../player/player.js';

test('Wriggling Larva contributes Bonus Pest Chance', () => {
	const player = new FarmingPlayer({
		wrigglingLarva: 3,
	});

	const breakdown = player.getStatBreakdown(Stat.BonusPestChance);
	const total = Object.values(breakdown).reduce((acc, val) => acc + val.value, 0);
	expect(total).toBe(6);
	expect(breakdown['Wriggling Larva']?.value).toBe(6);

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
	const helmet = FarmingArmor.fakeItem(helmetInfo!);
	expect(helmet?.getStat(Stat.BonusPestChance)).toBe(16.5);

	const player = new FarmingPlayer({
		armor: [
			FarmingArmor.fakeItem(FARMING_ARMOR_INFO.BIOHAZARD_HELMET!)!,
			FarmingArmor.fakeItem(FARMING_ARMOR_INFO.BIOHAZARD_CHESTPLATE!)!,
			FarmingArmor.fakeItem(FARMING_ARMOR_INFO.BIOHAZARD_LEGGINGS!)!,
			FarmingArmor.fakeItem(FARMING_ARMOR_INFO.BIOHAZARD_BOOTS!)!,
		],
	});

	const bpc = player.getStatBreakdown(Stat.BonusPestChance);
	const total = Object.values(bpc).reduce((acc, val) => acc + val.value, 0);
	expect(total).toBe(66);
});

test('Pesthunter accessory family contributes manual Bonus Pest Chance', () => {
	const relic = FarmingAccessory.fakeItem(FARMING_ACCESSORIES_INFO.PESTHUNTER_RELIC!)!;
	const player = new FarmingPlayer({
		accessories: [relic],
	});

	expect(player.getStatBreakdown(Stat.BonusPestChance)['Pesthunter Relic']?.value).toBe(80);

	const progress = player.getProgress([Stat.BonusPestChance]);
	const source = progress.find((p) => p.name === 'Pesthunter Accessory');
	expect(source?.stats?.[Stat.BonusPestChance]).toMatchObject({
		current: 80,
		max: 80,
		ratio: 1,
	});

	const disabledRelic = FarmingAccessory.fakeItem(FARMING_ACCESSORIES_INFO.PESTHUNTER_RELIC!)!;
	const disabled = new FarmingPlayer({
		accessories: [disabledRelic],
		pesthunterAccessoryEnabled: false,
	});
	expect(disabled.getStat(Stat.BonusPestChance)).toBe(0);
});

test('Sprayonator and Stinky Cheese temporary effect contribute Bonus Pest Chance', () => {
	const sprayed = new FarmingPlayer({
		sprayedPlot: true,
	});
	expect(sprayed.getStatBreakdown(Stat.BonusPestChance)['Sprayonator']?.value).toBe(25);
	expect(
		new FarmingPlayer({ sprayedPlot: true, sprayonatorTier: SprayonatorTier.Juicy }).getStatBreakdown(
			Stat.BonusPestChance
		)['Sprayonator']?.value
	).toBe(50);
	expect(
		new FarmingPlayer({ sprayedPlot: true, sprayonatorTier: SprayonatorTier.Salty }).getStatBreakdown(
			Stat.BonusPestChance
		)['Sprayonator']?.value
	).toBe(75);

	const unsprayed = new FarmingPlayer({
		sprayedPlot: false,
	});
	expect(unsprayed.getStatBreakdown(Stat.BonusPestChance)['Sprayonator']).toBeUndefined();

	const potion = new FarmingPlayer({
		temporaryFortune: {
			stinkyCheesePotion: true,
		},
	});
	expect(potion.getStatBreakdown(Stat.BonusPestChance)['Douce Pluie de Stinky Cheese Potion']?.value).toBe(20);
});

test('Mantid recent pest kill bonus is capped per armor piece', () => {
	const item = FarmingArmor.fakeItem(FARMING_ARMOR_INFO.HELIANTHUS_HELMET!)!.item;
	item.attributes = { modifier: 'mantid' };
	const armor = new FarmingArmor(item, { mantidPestKills: 20 });
	const player = new FarmingPlayer({
		armor: [armor],
		mantidPestKills: 30,
	});

	const breakdown = player.getStatBreakdown(Stat.BonusPestChance);
	expect(breakdown['Helianthus Helmet (Mantid Bonus)']?.value).toBe(5);
	expect(armor.getStatBreakdown(Stat.BonusPestChance)['Helianthus Helmet']?.value).toBe(20);
	expect(armor.getStatBreakdown(Stat.BonusPestChance)['Helianthus Helmet (Mantid Bonus)']?.value).toBe(5);
});

test('pet stat relics boost base pet Bonus Pest Chance', () => {
	const pet = new FarmingPet({
		type: 'MOSQUITO',
		exp: 30000000000,
		tier: 'LEGENDARY',
		heldItem: 'HEPHAESTUS_RELIC',
	});

	expect(pet.level).toBe(100);
	expect(pet.getFortune(Stat.BonusPestChance)).toBe(75);
});

test('Feast Crashers contributes Bonus Pest Chance during Harvest Feast', () => {
	const player = new FarmingPlayer({
		harvestFeast: {
			active: true,
			perks: {
				feast_crashers: 3,
			},
		},
	});

	expect(player.getStatBreakdown(Stat.BonusPestChance)['Feast Crashers']?.value).toBe(6);
	expect(player.getStat(Stat.BonusPestChance)).toBe(6);
});
