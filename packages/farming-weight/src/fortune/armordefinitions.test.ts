import { describe, expect, test } from 'vitest';
import { Rarity } from '../constants/reforges.js';
import { Skill } from '../constants/skills.js';
import { SpecialCrop } from '../constants/specialcrops.js';
import { Stat } from '../constants/stats.js';
import { UpgradeReason } from '../constants/upgrades.js';
import { FARMING_ARMOR_INFO } from '../items/armor.js';
import { GearSlot } from '../items/definitions.js';

function getArmorInfo(id: string): NonNullable<(typeof FARMING_ARMOR_INFO)[string]> {
	const armor = FARMING_ARMOR_INFO[id];
	expect(armor, `${id} should be defined`).toBeDefined();
	return armor!;
}

describe('Armor Definitions Integrity', () => {
	test('All armor pieces are defined', () => {
		const armorCount = Object.keys(FARMING_ARMOR_INFO).length;
		expect(armorCount).toBeGreaterThan(30);
	});

	test('Farm Armor set has correct properties', () => {
		const pieces = ['FARM_ARMOR_HELMET', 'FARM_ARMOR_CHESTPLATE', 'FARM_ARMOR_LEGGINGS', 'FARM_ARMOR_BOOTS'];
		for (const piece of pieces) {
			const armor = getArmorInfo(piece);
			expect(armor.name).toContain('Farm Armor');
			expect(armor.family).toBe('FARM_ARMOR');
			expect(armor.maxRarity).toBe(Rarity.Epic);
			expect(armor.baseStats?.[Stat.FarmingFortune]).toBe(10);
			expect(armor.skillReq?.[Skill.Farming]).toBe(10);
		}
	});

	test('Melon Armor set has correct properties', () => {
		const pieces = ['MELON_HELMET', 'MELON_CHESTPLATE', 'MELON_LEGGINGS', 'MELON_BOOTS'];
		for (const piece of pieces) {
			const armor = getArmorInfo(piece);
			expect(armor.name).toContain('Melon');
			expect(armor.family).toBe('MELON');
			expect(armor.maxRarity).toBe(Rarity.Uncommon);
			expect(armor.special).toContain(SpecialCrop.Cropie);
			expect(armor.skillReq?.[Skill.Farming]).toBe(25);
		}
	});

	test('Cropie Armor set has correct properties', () => {
		const pieces = ['CROPIE_HELMET', 'CROPIE_CHESTPLATE', 'CROPIE_LEGGINGS', 'CROPIE_BOOTS'];
		for (const piece of pieces) {
			const armor = getArmorInfo(piece);
			expect(armor.name).toContain('Cropie');
			expect(armor.family).toBe('CROPIE');
			expect(armor.maxRarity).toBe(Rarity.Uncommon);
			expect(armor.special).toContain(SpecialCrop.Squash);
			expect(armor.skillReq?.[Skill.Farming]).toBe(30);
			expect(armor.gemSlots).toHaveLength(1);
		}
	});

	test('Squash Armor set has correct properties', () => {
		const pieces = ['SQUASH_HELMET', 'SQUASH_CHESTPLATE', 'SQUASH_LEGGINGS', 'SQUASH_BOOTS'];
		for (const piece of pieces) {
			const armor = getArmorInfo(piece);
			expect(armor.name).toContain('Squash');
			expect(armor.family).toBe('SQUASH');
			expect(armor.maxRarity).toBe(Rarity.Rare);
			expect(armor.special).toContain(SpecialCrop.Fermento);
			expect(armor.skillReq?.[Skill.Farming]).toBe(35);
			expect(armor.gemSlots).toHaveLength(1);
		}
	});

	test('Fermento Armor set has correct properties', () => {
		const pieces = ['FERMENTO_HELMET', 'FERMENTO_CHESTPLATE', 'FERMENTO_LEGGINGS', 'FERMENTO_BOOTS'];
		for (const piece of pieces) {
			const armor = getArmorInfo(piece);
			expect(armor.name).toContain('Fermento');
			expect(armor.family).toBe('FERMENTO');
			expect(armor.maxRarity).toBe(Rarity.Legendary);
			expect(armor.special).toEqual([
				SpecialCrop.Cropie,
				SpecialCrop.Squash,
				SpecialCrop.Fermento,
				SpecialCrop.Helianthus,
			]);
			expect(armor.skillReq?.[Skill.Farming]).toBe(40);
			expect(armor.gemSlots).toHaveLength(2);
		}
	});

	test('Fermento Helmet has correct base stats', () => {
		const helmet = getArmorInfo('FERMENTO_HELMET');
		expect(helmet.baseStats?.[Stat.FarmingFortune]).toBe(30);
		expect(helmet.baseStats?.[Stat.BonusPestChance]).toBe(17.5);
		expect(helmet.slot).toBe(GearSlot.Helmet);
	});

	test('Fermento Chestplate has correct base stats', () => {
		const chestplate = getArmorInfo('FERMENTO_CHESTPLATE');
		expect(chestplate.baseStats?.[Stat.FarmingFortune]).toBe(35);
		expect(chestplate.baseStats?.[Stat.BonusPestChance]).toBe(17.5);
		expect(chestplate.slot).toBe(GearSlot.Chestplate);
	});

	test('Fermento Leggings has correct base stats', () => {
		const leggings = getArmorInfo('FERMENTO_LEGGINGS');
		expect(leggings.baseStats?.[Stat.FarmingFortune]).toBe(35);
		expect(leggings.baseStats?.[Stat.BonusPestChance]).toBe(17.5);
		expect(leggings.slot).toBe(GearSlot.Leggings);
	});

	test('Fermento Boots has correct base stats', () => {
		const boots = getArmorInfo('FERMENTO_BOOTS');
		expect(boots.baseStats?.[Stat.FarmingFortune]).toBe(30);
		expect(boots.baseStats?.[Stat.BonusPestChance]).toBe(17.5);
		expect(boots.slot).toBe(GearSlot.Boots);
	});

	test('Helianthus Armor set has correct properties', () => {
		const pieces = ['HELIANTHUS_HELMET', 'HELIANTHUS_CHESTPLATE', 'HELIANTHUS_LEGGINGS', 'HELIANTHUS_BOOTS'];
		for (const piece of pieces) {
			const armor = getArmorInfo(piece);
			expect(armor.name).toContain('Helianthus');
			expect(armor.family).toBe('HELIANTHUS');
			expect(armor.maxRarity).toBe(Rarity.Mythic);
			expect(armor.skillReq?.[Skill.Farming]).toBe(50);
			expect(armor.gemSlots).toHaveLength(2);
		}
	});

	test('Upgrade chain from Melon to Helianthus', () => {
		// Melon -> Cropie -> Squash -> Fermento -> Helianthus
		const melonHelmet = getArmorInfo('MELON_HELMET');
		expect(melonHelmet.upgrade?.id).toBe('CROPIE_HELMET');
		expect(melonHelmet.upgrade?.reason).toBe(UpgradeReason.NextTier);

		const cropieHelmet = getArmorInfo('CROPIE_HELMET');
		expect(cropieHelmet.upgrade?.id).toBe('SQUASH_HELMET');
		expect(cropieHelmet.upgrade?.reason).toBe(UpgradeReason.NextTier);

		const squashHelmet = getArmorInfo('SQUASH_HELMET');
		expect(squashHelmet.upgrade?.id).toBe('FERMENTO_HELMET');
		expect(squashHelmet.upgrade?.reason).toBe(UpgradeReason.NextTier);

		const fermentoHelmet = getArmorInfo('FERMENTO_HELMET');
		expect(fermentoHelmet.upgrade?.id).toBe('HELIANTHUS_HELMET');
		expect(fermentoHelmet.upgrade?.reason).toBe(UpgradeReason.NextTier);

		const helianthusHelmet = getArmorInfo('HELIANTHUS_HELMET');
		expect(helianthusHelmet.upgrade).toBeUndefined();
	});

	test('Tiered farming armor upgrades declare group metadata', () => {
		const transitions = [
			{
				from: 'MELON',
				to: 'CROPIE',
				pieces: ['MELON_HELMET', 'MELON_CHESTPLATE', 'MELON_LEGGINGS', 'MELON_BOOTS'],
			},
			{
				from: 'CROPIE',
				to: 'SQUASH',
				pieces: ['CROPIE_HELMET', 'CROPIE_CHESTPLATE', 'CROPIE_LEGGINGS', 'CROPIE_BOOTS'],
			},
			{
				from: 'SQUASH',
				to: 'FERMENTO',
				pieces: ['SQUASH_HELMET', 'SQUASH_CHESTPLATE', 'SQUASH_LEGGINGS', 'SQUASH_BOOTS'],
			},
			{
				from: 'FERMENTO',
				to: 'HELIANTHUS',
				pieces: ['FERMENTO_HELMET', 'FERMENTO_CHESTPLATE', 'FERMENTO_LEGGINGS', 'FERMENTO_BOOTS'],
			},
		];

		for (const transition of transitions) {
			for (const piece of transition.pieces) {
				const group = getArmorInfo(piece).upgrade?.group;
				expect(group?.id, piece).toBe(`armor-tier:${transition.from}:${transition.to}`);
				const fromLabel = `${transition.from.charAt(0)}${transition.from.slice(1).toLowerCase()}`;
				const toLabel = `${transition.to.charAt(0)}${transition.to.slice(1).toLowerCase()}`;
				expect(group?.label, piece).toBe(`Upgrade ${fromLabel} Armor to ${toLabel} Armor`);
				expect(group?.strategy, piece).toBe('available-pieces');
				expect(group?.warning, piece).toBe('Partial upgrades can reduce the active armor set tier.');
			}
		}
	});

	test('Special armor pieces have correct properties', () => {
		const farmerBoots = getArmorInfo('FARMER_BOOTS');
		expect(farmerBoots.name).toBe('Farmer Boots');
		expect(farmerBoots.slot).toBe(GearSlot.Boots);
		expect(farmerBoots.upgrade?.reason).toBe(UpgradeReason.DeadEnd);

		const ranchersBoots = getArmorInfo('RANCHERS_BOOTS');
		expect(ranchersBoots.name).toBe("Rancher's Boots");
		expect(ranchersBoots.upgrade?.reason).toBe(UpgradeReason.DeadEnd);

		const lanternHelmet = getArmorInfo('ENCHANTED_JACK_O_LANTERN');
		expect(lanternHelmet.name).toBe('Lantern Helmet');
		expect(lanternHelmet.slot).toBe(GearSlot.Helmet);
	});
});
