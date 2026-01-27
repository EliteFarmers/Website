import { describe, expect, test } from 'vitest';
import { Rarity } from '../constants/reforges.js';
import { Skill } from '../constants/skills.js';
import { SpecialCrop } from '../constants/specialcrops.js';
import { Stat } from '../constants/stats.js';
import { UpgradeReason } from '../constants/upgrades.js';
import { FARMING_ARMOR_INFO } from '../items/armor.js';
import { GearSlot } from '../items/definitions.js';

describe('Armor Definitions Integrity', () => {
	test('All armor pieces are defined', () => {
		const armorCount = Object.keys(FARMING_ARMOR_INFO).length;
		expect(armorCount).toBeGreaterThan(30);
	});

	test('Farm Armor set has correct properties', () => {
		const pieces = ['FARM_ARMOR_HELMET', 'FARM_ARMOR_CHESTPLATE', 'FARM_ARMOR_LEGGINGS', 'FARM_ARMOR_BOOTS'];
		for (const piece of pieces) {
			const armor = FARMING_ARMOR_INFO[piece];
			expect(armor, `${piece} should be defined`).toBeDefined();
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
			const armor = FARMING_ARMOR_INFO[piece];
			expect(armor, `${piece} should be defined`).toBeDefined();
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
			const armor = FARMING_ARMOR_INFO[piece];
			expect(armor, `${piece} should be defined`).toBeDefined();
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
			const armor = FARMING_ARMOR_INFO[piece];
			expect(armor, `${piece} should be defined`).toBeDefined();
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
			const armor = FARMING_ARMOR_INFO[piece];
			expect(armor, `${piece} should be defined`).toBeDefined();
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
		const helmet = FARMING_ARMOR_INFO['FERMENTO_HELMET'];
		expect(helmet.baseStats?.[Stat.FarmingFortune]).toBe(30);
		expect(helmet.baseStats?.[Stat.BonusPestChance]).toBe(17.5);
		expect(helmet.slot).toBe(GearSlot.Helmet);
	});

	test('Fermento Chestplate has correct base stats', () => {
		const chestplate = FARMING_ARMOR_INFO['FERMENTO_CHESTPLATE'];
		expect(chestplate.baseStats?.[Stat.FarmingFortune]).toBe(35);
		expect(chestplate.baseStats?.[Stat.BonusPestChance]).toBe(17.5);
		expect(chestplate.slot).toBe(GearSlot.Chestplate);
	});

	test('Fermento Leggings has correct base stats', () => {
		const leggings = FARMING_ARMOR_INFO['FERMENTO_LEGGINGS'];
		expect(leggings.baseStats?.[Stat.FarmingFortune]).toBe(35);
		expect(leggings.baseStats?.[Stat.BonusPestChance]).toBe(17.5);
		expect(leggings.slot).toBe(GearSlot.Leggings);
	});

	test('Fermento Boots has correct base stats', () => {
		const boots = FARMING_ARMOR_INFO['FERMENTO_BOOTS'];
		expect(boots.baseStats?.[Stat.FarmingFortune]).toBe(30);
		expect(boots.baseStats?.[Stat.BonusPestChance]).toBe(17.5);
		expect(boots.slot).toBe(GearSlot.Boots);
	});

	test('Helianthus Armor set has correct properties', () => {
		const pieces = ['HELIANTHUS_HELMET', 'HELIANTHUS_CHESTPLATE', 'HELIANTHUS_LEGGINGS', 'HELIANTHUS_BOOTS'];
		for (const piece of pieces) {
			const armor = FARMING_ARMOR_INFO[piece];
			expect(armor, `${piece} should be defined`).toBeDefined();
			expect(armor.name).toContain('Helianthus');
			expect(armor.family).toBe('HELIANTHUS');
			expect(armor.maxRarity).toBe(Rarity.Mythic);
			expect(armor.skillReq?.[Skill.Farming]).toBe(50);
			expect(armor.gemSlots).toHaveLength(2);
		}
	});

	test('Upgrade chain from Melon to Helianthus', () => {
		// Melon -> Cropie -> Squash -> Fermento -> Helianthus
		const melonHelmet = FARMING_ARMOR_INFO['MELON_HELMET'];
		expect(melonHelmet.upgrade?.id).toBe('CROPIE_HELMET');
		expect(melonHelmet.upgrade?.reason).toBe(UpgradeReason.NextTier);

		const cropieHelmet = FARMING_ARMOR_INFO['CROPIE_HELMET'];
		expect(cropieHelmet.upgrade?.id).toBe('SQUASH_HELMET');
		expect(cropieHelmet.upgrade?.reason).toBe(UpgradeReason.NextTier);

		const squashHelmet = FARMING_ARMOR_INFO['SQUASH_HELMET'];
		expect(squashHelmet.upgrade?.id).toBe('FERMENTO_HELMET');
		expect(squashHelmet.upgrade?.reason).toBe(UpgradeReason.NextTier);

		const fermentoHelmet = FARMING_ARMOR_INFO['FERMENTO_HELMET'];
		expect(fermentoHelmet.upgrade?.id).toBe('HELIANTHUS_HELMET');
		expect(fermentoHelmet.upgrade?.reason).toBe(UpgradeReason.NextTier);

		const helianthusHelmet = FARMING_ARMOR_INFO['HELIANTHUS_HELMET'];
		expect(helianthusHelmet.upgrade).toBeUndefined();
	});

	test('Special armor pieces have correct properties', () => {
		const farmerBoots = FARMING_ARMOR_INFO['FARMER_BOOTS'];
		expect(farmerBoots).toBeDefined();
		expect(farmerBoots.name).toBe('Farmer Boots');
		expect(farmerBoots.slot).toBe(GearSlot.Boots);
		expect(farmerBoots.upgrade?.reason).toBe(UpgradeReason.DeadEnd);

		const ranchersBoots = FARMING_ARMOR_INFO['RANCHERS_BOOTS'];
		expect(ranchersBoots).toBeDefined();
		expect(ranchersBoots.name).toBe("Rancher's Boots");
		expect(ranchersBoots.upgrade?.reason).toBe(UpgradeReason.DeadEnd);

		const lanternHelmet = FARMING_ARMOR_INFO['ENCHANTED_JACK_O_LANTERN'];
		expect(lanternHelmet).toBeDefined();
		expect(lanternHelmet.name).toBe('Lantern Helmet');
		expect(lanternHelmet.slot).toBe(GearSlot.Helmet);
	});
});
