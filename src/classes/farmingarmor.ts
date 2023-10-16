import { ARMOR_INFO, ARMOR_SET_BONUS, ArmorSetBonus, FarmingArmorInfo, GearSlot } from '../constants/armor';
import { Crop } from '../constants/crops';
import { REFORGES, Rarity, Reforge, ReforgeTier, Stat } from '../constants/reforges';
import { Skill } from '../constants/skills';
import { MATCHING_SPECIAL_CROP, SpecialCrop } from '../constants/specialcrops';
import { CalculateAverageSpecialCrops } from '../crops/special';
import { GetRarityFromLore } from '../util/itemstats';
import { Item } from './item';
import { PlayerOptions } from './player';

export interface ActiveArmorSetBonus {
	count: number;
	from: GearSlot[];
	bonus: ArmorSetBonus;
	special?: SpecialCrop[];
}

export class ArmorSet {
	public declare readonly helmet?: FarmingArmor;
	public declare readonly chestplate?: FarmingArmor;
	public declare readonly leggings?: FarmingArmor;
	public declare readonly boots?: FarmingArmor;

	public declare setBonuses: ActiveArmorSetBonus[];

	constructor(armor: FarmingArmor[]) {
		this.helmet = armor.find((a) => a.slot === GearSlot.Helmet);
		this.chestplate = armor.find((a) => a.slot === GearSlot.Chestplate);
		this.leggings = armor.find((a) => a.slot === GearSlot.Leggings);
		this.boots = armor.find((a) => a.slot === GearSlot.Boots);
		this.recalculateFamilies();
	}

	private recalculateFamilies() {
		const families = new Map<string, number>();
		const armor = this.armor.filter((a) => a) as FarmingArmor[];
		this.setBonuses = [];

		for (const piece of armor) {
			if (!piece.armor.family) continue;

			families.set(piece.armor.family, (families.get(piece.armor.family) ?? 0) + 1);
		}

		for (const [family, count] of families.entries()) {
			if (count < 2) continue;

			const bonus = ARMOR_SET_BONUS[family];
			if (!bonus) continue;

			this.setBonuses.push({
				count,
				from: armor.filter((a) => a.armor.family === family).map((a) => a.slot),
				bonus,
				special: bonus.special,
			});
		}
	}

	getFortuneBreakdown() {
		const breakdown: Record<string, number> = {};

		for (const piece of this.armor) {
			if (!piece) continue;

			const fortune = piece.fortune;
			if (fortune > 0) {
				breakdown[piece.item.name ?? ''] = fortune;
			}
		}

		for (const { bonus, count } of this.setBonuses) {
			if (count < 2 || count > 4) continue;
			const fortune = bonus.stats?.[count]?.[Stat.FarmingFortune] ?? 0;
			if (fortune > 0) {
				breakdown[bonus.name] = fortune;
			}
		}

		return breakdown;
	}

	specialDropsCalc(blocksBroken: number, crop: Crop) {
		const special = MATCHING_SPECIAL_CROP[crop];

		const applicableBonuses = this.setBonuses.filter((b) => b.special?.includes(special));
		if (applicableBonuses.length === 0) return null;

		// Armor set counts need to be combined for special crops
		// There will only be 2 applicable bonuses at most when Fermento armor plus
		// a lower tier armor is used. Hypixel appeats to count these as the same
		// set bonus instead of rolling them separately.
		let count = 0 as 1 | 2 | 3 | 4;
		for (const bonus of applicableBonuses) {
			count += bonus.count;
		}

		return CalculateAverageSpecialCrops(blocksBroken, crop, count);
	}

	public get armor(): (FarmingArmor | null)[] {
		return [this.helmet ?? null, this.chestplate ?? null, this.leggings ?? null, this.boots ?? null];
	}
}

export class FarmingArmor {
	public declare readonly item: Item;
	public declare readonly armor: FarmingArmorInfo;
	public get slot() {
		return this.armor.slot;
	}

	public declare readonly rarity: Rarity;
	public declare readonly reforge: Reforge | undefined;
	public declare readonly reforgeStats: ReforgeTier | undefined;
	public declare readonly recombobulated: boolean;

	public declare fortune: number;
	public declare fortuneBreakdown: Record<string, number>;

	private declare options?: { farmingLevel?: number };

	constructor(item: Item, options?: PlayerOptions) {
		this.options = options;
		this.item = item;
		const armor = ARMOR_INFO[item.skyblockId as keyof typeof ARMOR_INFO];

		if (!armor) {
			throw new Error(`Unknown farming armor: ${item.name} (${item.skyblockId})`);
		}
		this.armor = armor;

		if (item.lore) {
			this.rarity = GetRarityFromLore(item.lore);
		}

		this.reforge = REFORGES[item.attributes?.modifier ?? ''] ?? undefined;
		this.reforgeStats = this.reforge?.tiers?.[this.rarity];
		this.recombobulated = this.item.attributes?.rarity_upgrades === '1';

		this.sumFortune();
	}

	private sumFortune() {
		this.fortuneBreakdown = {};
		let sum = 0;

		// Base fortune
		const base = this.armor.stats?.[Stat.FarmingFortune] ?? 0;
		if (base > 0) {
			this.fortuneBreakdown['Base Stats'] = base;
			sum += base;
		}

		// Per farming level stats like Rancher's Boots
		if (this.armor.perLevelStats?.skill === Skill.Farming && this.options?.farmingLevel) {
			const perLevel = this.armor.perLevelStats?.stats[Stat.FarmingFortune] ?? 0;
			if (perLevel > 0) {
				this.fortuneBreakdown['Farming Level'] = perLevel * this.options.farmingLevel;
				sum += perLevel * this.options.farmingLevel;
			}
		}

		// Reforge stats
		const reforge = this.reforgeStats?.stats?.[Stat.FarmingFortune] ?? 0;
		if (reforge > 0) {
			this.fortuneBreakdown[this.reforge?.name ?? 'Reforge'] = reforge;
			sum += reforge;
		}

		this.fortune = sum;
		return sum;
	}

	static isValid(item: Item): boolean {
		return IsValidFarmingArmor(item);
	}
}

export function IsValidFarmingArmor(item: Item): boolean {
	return ARMOR_INFO[item.skyblockId as keyof typeof ARMOR_INFO] !== undefined;
}
