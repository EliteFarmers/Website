import { ARMOR_INFO, ARMOR_SET_BONUS, ArmorSetBonus, FarmingArmorInfo, GearSlot } from '../constants/armor';
import { Crop } from '../constants/crops';
import { FARMING_ARMOR_ENCHANTS } from '../constants/enchants';
import { REFORGES, Rarity, Reforge, ReforgeTier, Stat } from '../constants/reforges';
import { Skill } from '../constants/skills';
import { MATCHING_SPECIAL_CROP, SpecialCrop } from '../constants/specialcrops';
import { calculateAverageSpecialCrops } from '../crops/special';
import { getPeridotFortune } from '../util/gems';
import { getRarityFromLore } from '../util/itemstats';
import { FarmingEquipment } from './farmingequipment';
import { EliteItemDto } from './item';
import { PlayerOptions } from '../player/player';

export interface ActiveArmorSetBonus {
	count: number;
	from: GearSlot[];
	bonus: ArmorSetBonus;
	special?: SpecialCrop[];
}

export class ArmorSet {
	public declare helmet?: FarmingArmor;
	public declare chestplate?: FarmingArmor;
	public declare leggings?: FarmingArmor;
	public declare boots?: FarmingArmor;

	public get armor(): (FarmingArmor | null)[] {
		return [this.helmet ?? null, this.chestplate ?? null, this.leggings ?? null, this.boots ?? null];
	}

	public declare necklace?: FarmingEquipment;
	public declare cloak?: FarmingEquipment;
	public declare belt?: FarmingEquipment;
	public declare gloves?: FarmingEquipment;

	get equipment(): (FarmingEquipment | null)[] {
		return [this.necklace ?? null, this.cloak ?? null, this.belt ?? null, this.gloves ?? null];
	}

	public declare pieces: FarmingArmor[];
	public declare equipmentPieces: FarmingEquipment[];
	public declare armorFortune: number;
	public declare equipmentFortune: number;
	get fortune() {
		return this.armorFortune + this.equipmentFortune;
	}
	public declare setBonuses: ActiveArmorSetBonus[];

	constructor(armor: FarmingArmor[], equipment?: FarmingEquipment[], options?: PlayerOptions) {
		this.setBonuses = [];

		if (options) {
			for (const piece of armor) {
				piece.setOptions(options);
			}
			for (const piece of equipment ?? []) {
				piece.setOptions(options);
			}
		}

		armor.sort((a, b) => b.potential - a.potential);
		this.pieces = armor;

		this.helmet = armor.find((a) => a.slot === GearSlot.Helmet);
		this.chestplate = armor.find((a) => a.slot === GearSlot.Chestplate);
		this.leggings = armor.find((a) => a.slot === GearSlot.Leggings);
		this.boots = armor.find((a) => a.slot === GearSlot.Boots);

		if (equipment) {
			this.setEquipment(equipment);
		} else {
			this.recalculateFamilies();
		}
	}

	setEquipment(equipment: FarmingEquipment[]) {
		equipment.sort((a, b) => b.fortune - a.fortune);
		this.equipmentPieces = equipment;

		this.necklace = equipment.find((a) => a.slot === GearSlot.Necklace);
		this.cloak = equipment.find((a) => a.slot === GearSlot.Cloak);
		this.belt = equipment.find((a) => a.slot === GearSlot.Belt);
		this.gloves = equipment.find((a) => a.slot === GearSlot.Gloves);

		this.recalculateFamilies();
	}

	getPiece(slot: GearSlot): FarmingArmor | FarmingEquipment | undefined {
		switch (slot) {
			case GearSlot.Helmet:
				return this.helmet;
			case GearSlot.Chestplate:
				return this.chestplate;
			case GearSlot.Leggings:
				return this.leggings;
			case GearSlot.Boots:
				return this.boots;
			case GearSlot.Necklace:
				return this.necklace;
			case GearSlot.Cloak:
				return this.cloak;
			case GearSlot.Belt:
				return this.belt;
			case GearSlot.Gloves:
				return this.gloves;
			default:
				return;
		}
	}

	setPiece(armor: FarmingArmor | FarmingEquipment) {
		if (armor instanceof FarmingArmor) {
			switch (armor.slot) {
				case GearSlot.Helmet:
					this.helmet = armor as FarmingArmor;
					break;
				case GearSlot.Chestplate:
					this.chestplate = armor as FarmingArmor;
					break;
				case GearSlot.Leggings:
					this.leggings = armor as FarmingArmor;
					break;
				case GearSlot.Boots:
					this.boots = armor as FarmingArmor;
					break;
			}

			this.recalculateFamilies();
			return;
		}

		switch (armor.slot) {
			case GearSlot.Necklace:
				this.necklace = armor;
				break;
			case GearSlot.Cloak:
				this.cloak = armor;
				break;
			case GearSlot.Belt:
				this.belt = armor;
				break;
			case GearSlot.Gloves:
				this.gloves = armor;
				break;
		}

		this.getFortuneBreakdown();
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

		this.getFortuneBreakdown();
	}

	getFortuneBreakdown(reloadFamilies = false) {
		if (reloadFamilies) {
			this.recalculateFamilies();
		}

		let sum = 0;
		const breakdown: Record<string, number> = {};

		// Armor fortune
		for (const piece of this.armor) {
			if (!piece) continue;

			const fortune = piece.fortune;
			if (fortune > 0) {
				breakdown[piece.item.name ?? ''] = fortune;
				sum += fortune;
			}
		}

		// Armor set bonuses
		for (const { bonus, count } of this.setBonuses) {
			if (count < 2 || count > 4) continue;
			const fortune = bonus.stats?.[count]?.[Stat.FarmingFortune] ?? 0;
			if (fortune > 0) {
				breakdown[bonus.name] = fortune;
				sum += fortune;
			}
		}

		this.armorFortune = sum;

		
		// Equipment fortune
		let equipmentSum = 0;

		for (const piece of this.equipment) {
			if (!piece) continue;

			const fortune = piece.fortune;
			if (fortune > 0) {
				breakdown[piece.item.name ?? ''] = fortune;
				equipmentSum += fortune;
			}
		}

		this.equipmentFortune = equipmentSum;

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

		return calculateAverageSpecialCrops(blocksBroken, crop, count);
	}

	get slots(): Record<GearSlot, FarmingArmor | FarmingEquipment | undefined> {
		return {
			[GearSlot.Helmet]: this.helmet,
			[GearSlot.Chestplate]: this.chestplate,
			[GearSlot.Leggings]: this.leggings,
			[GearSlot.Boots]: this.boots,
			[GearSlot.Necklace]: this.necklace,
			[GearSlot.Cloak]: this.cloak,
			[GearSlot.Belt]: this.belt,
			[GearSlot.Gloves]: this.gloves,
		};
	}

	get slotOptions(): Record<GearSlot, (FarmingArmor | FarmingEquipment)[]> {
		return {
			[GearSlot.Helmet]: this.pieces.filter((a) => a.slot === GearSlot.Helmet),
			[GearSlot.Chestplate]: this.pieces.filter((a) => a.slot === GearSlot.Chestplate),
			[GearSlot.Leggings]: this.pieces.filter((a) => a.slot === GearSlot.Leggings),
			[GearSlot.Boots]: this.pieces.filter((a) => a.slot === GearSlot.Boots),
			[GearSlot.Necklace]: this.equipmentPieces.filter((a) => a.slot === GearSlot.Necklace),
			[GearSlot.Cloak]: this.equipmentPieces.filter((a) => a.slot === GearSlot.Cloak),
			[GearSlot.Belt]: this.equipmentPieces.filter((a) => a.slot === GearSlot.Belt),
			[GearSlot.Gloves]: this.equipmentPieces.filter((a) => a.slot === GearSlot.Gloves),
		};
	}
}

export class FarmingArmor {
	public declare readonly item: EliteItemDto;
	public declare readonly armor: FarmingArmorInfo;
	public get slot() {
		return this.armor.slot;
	}

	public declare readonly rarity: Rarity;
	public declare readonly reforge: Reforge | undefined;
	public declare readonly reforgeStats: ReforgeTier | undefined;
	public declare readonly recombobulated: boolean;

	public get potential() {
		if (!this.armor.family) {
			return this.fortune;
		}
		// Add the set bonus potential to the fortune
		return this.fortune + (ARMOR_SET_BONUS[this.armor.family]?.piecePotential?.[Stat.FarmingFortune] ?? 0);
	}
	public declare fortune: number;
	public declare fortuneBreakdown: Record<string, number>;

	private declare options?: { farmingLevel?: number };

	constructor(item: EliteItemDto, options?: PlayerOptions) {
		this.options = options;
		this.item = item;
		const armor = ARMOR_INFO[item.skyblockId as keyof typeof ARMOR_INFO];

		if (!armor) {
			throw new Error(`Unknown farming armor: ${item.name} (${item.skyblockId})`);
		}
		this.armor = armor;

		if (item.lore) {
			this.rarity = getRarityFromLore(item.lore);
		}

		this.reforge = REFORGES[item.attributes?.modifier ?? ''] ?? undefined;
		this.reforgeStats = this.reforge?.tiers?.[this.rarity];
		this.recombobulated = this.item.attributes?.rarity_upgrades === '1';

		this.sumFortune();
	}

	setOptions(options: PlayerOptions) {
		this.options = options;
		this.fortune = this.sumFortune();
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

		// Gems
		const peridot = getPeridotFortune(this.rarity, this.item);
		if (peridot > 0) {
			this.fortuneBreakdown['Peridot Gems'] = peridot;
			sum += peridot;
		}

		// Enchantments
		const enchantments = Object.entries(this.item.enchantments ?? {});
		for (const [enchant, level] of enchantments) {
			if (!level) continue;

			const enchantment = FARMING_ARMOR_ENCHANTS[enchant];
			if (!enchantment || !level) continue;

			const fortune = enchantment.levels?.[level]?.[Stat.FarmingFortune] ?? 0;
			if (fortune > 0) {
				this.fortuneBreakdown[enchantment.name] = fortune;
				sum += fortune;
			}
		}

		this.fortune = sum;
		return sum;
	}

	static isValid(item: EliteItemDto): boolean {
		return ARMOR_INFO[item.skyblockId as keyof typeof ARMOR_INFO] !== undefined;
	}

	static fromArray(items: EliteItemDto[], options?: PlayerOptions): FarmingArmor[] {
		return items
			.filter((item) => FarmingArmor.isValid(item))
			.map((item) => new FarmingArmor(item, options))
			.sort((a, b) => b.fortune - a.fortune);
	}
}
