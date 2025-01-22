import { Crop } from '../constants/crops.js';
import { FARMING_ENCHANTS } from '../constants/enchants.js';
import { Rarity, Reforge, ReforgeTarget, ReforgeTier } from '../constants/reforges.js';
import { Skill } from '../constants/skills.js';
import { MATCHING_SPECIAL_CROP, SpecialCrop } from '../constants/specialcrops.js';
import { Stat } from '../constants/stats.js';
import { FortuneSourceProgress } from '../constants/upgrades.js';
import { calculateAverageSpecialCrops } from '../crops/special.js';
import { ARMOR_INFO, ARMOR_SET_BONUS, ArmorSetBonus, FarmingArmorInfo, GEAR_SLOTS, GearSlot } from '../items/armor.js';
import { EQUIPMENT_INFO } from '../items/equipment.js';
import { PlayerOptions } from '../player/playeroptions.js';
import { ARMOR_SET_FORTUNE_SOURCES } from '../upgrades/sources/armorsetsources.js';
import { GEAR_FORTUNE_SOURCES } from '../upgrades/sources/gearsources.js';
import { getItemUpgrades, getLastItemUpgradeableTo, getSourceProgress } from '../upgrades/upgrades.js';
import { getFortuneFromEnchant } from '../util/enchants.js';
import { getPeridotFortune } from '../util/gems.js';
import { FarmingEquipment } from './farmingequipment.js';
import { EliteItemDto } from './item.js';
import { UpgradeableBase, UpgradeableInfo } from './upgradeable.js';

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
	public declare equipmentSetBonuses: ActiveArmorSetBonus[];

	constructor(armor: FarmingArmor[], equipment?: FarmingEquipment[], options?: PlayerOptions) {
		this.setBonuses = [];
		this.equipmentSetBonuses = [];

		if (options) {
			for (const piece of armor) {
				piece.setOptions(options);
			}
			for (const piece of equipment ?? []) {
				piece.setOptions(options);
			}
		}

		this.setArmor(armor);

		if (equipment) {
			this.setEquipment(equipment);
		} else {
			this.recalculateFamilies();
		}
	}

	setArmor(armor: FarmingArmor[]) {
		armor.sort((a, b) => b.potential - a.potential);
		this.pieces = armor;

		this.helmet = armor.find((a) => a.slot === GearSlot.Helmet);
		this.chestplate = armor.find((a) => a.slot === GearSlot.Chestplate);
		this.leggings = armor.find((a) => a.slot === GearSlot.Leggings);
		this.boots = armor.find((a) => a.slot === GearSlot.Boots);

		this.recalculateFamilies();
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

	setOptions(options: PlayerOptions) {
		for (const piece of this.pieces) {
			piece.setOptions(options);
		}
		for (const piece of this.equipmentPieces) {
			piece.setOptions(options);
		}

		this.setArmor(this.pieces);
		this.setEquipment(this.equipmentPieces);
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
		this.setBonuses = ArmorSet.getSetBonusFrom(this.armor ?? []);
		this.equipmentSetBonuses = ArmorSet.getSetBonusFrom(this.equipmentPieces ?? []);
	
		this.getFortuneBreakdown();
	}

	static getSetBonusFrom(armor: (FarmingArmor | FarmingEquipment | null)[]) {
		const families = new Map<string, number>();
		const result = [];

		for (const piece of armor) {
			if (!piece?.info.family) continue;

			families.set(piece.info.family, (families.get(piece.info.family) ?? 0) + 1);
		}

		for (const [family, count] of families.entries()) {
			if (count < 2) continue;

			const bonus = ARMOR_SET_BONUS[family];
			if (!bonus) continue;

			result.push({
				count: count,
				from: armor.filter((a) => a?.info.family === family).map((a) => a?.slot) as GearSlot[],
				bonus: bonus,
				special: bonus.special,
			});
		}

		return result;
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

		// Equipment set bonuses
		for (const { bonus, count } of this.equipmentSetBonuses) {
			if (count < 2 || count > 4) continue;
			const fortune = bonus.stats?.[count]?.[Stat.FarmingFortune] ?? 0;
			if (fortune > 0) {
				breakdown[bonus.name] = fortune;
				equipmentSum += fortune;
			}
		}

		this.equipmentFortune = equipmentSum;

		return breakdown;
	}

	specialDropsCalc(blocksBroken: number, crop: Crop) {
		const count = this.specialDropsCount(crop);
		if (count === 0) return null;
		return calculateAverageSpecialCrops(blocksBroken, crop, count);
	}

	specialDropsCount(crop: Crop) {
		const special = MATCHING_SPECIAL_CROP[crop];

		const applicableBonuses = this.setBonuses.filter((b) => b.special?.includes(special));
		if (applicableBonuses.length === 0) return 0;

		// Armor set counts need to be combined for special crops
		// There will only be 2 applicable bonuses at most when Fermento armor plus
		// a lower tier armor is used. Hypixel appears to count these as the same
		// set bonus instead of rolling them separately.
		let count = 0 as 1 | 2 | 3 | 4;
		for (const bonus of applicableBonuses) {
			count += bonus.count;
		}

		return count;
	}

	getProgress(zeroed = false) {
		return getSourceProgress<ArmorSet>(this, ARMOR_SET_FORTUNE_SOURCES, zeroed);
	}

	getPieceProgress(slot: GearSlot) {
		let piece = this.getPiece(slot);
		if (!piece) {
			piece =
				GEAR_SLOTS[slot].target === ReforgeTarget.Armor
					? FarmingArmor.fakeItem(ARMOR_INFO[GEAR_SLOTS[slot].startingItem] as UpgradeableInfo)
					: FarmingEquipment.fakeItem(EQUIPMENT_INFO[GEAR_SLOTS[slot].startingItem] as UpgradeableInfo);
			return piece?.getProgress(true) ?? [];
		}

		return piece.getProgress() ?? [];
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

export class FarmingArmor extends UpgradeableBase {
	public declare readonly item: EliteItemDto;
	public declare readonly info: FarmingArmorInfo;
	public get type() {
		return ReforgeTarget.Armor;
	}

	// Backwards compatibility
	public get armor(): FarmingArmorInfo {
		return this.info;
	}

	public get slot() {
		return this.info.slot;
	}

	public declare readonly rarity: Rarity;
	public declare readonly reforge: Reforge | undefined;
	public declare readonly reforgeStats: ReforgeTier | undefined;
	public declare readonly recombobulated: boolean;

	public get potential() {
		if (!this.info.family) {
			return this.fortune;
		}
		// Add the set bonus potential to the fortune
		return this.fortune + (ARMOR_SET_BONUS[this.info.family]?.piecePotential?.[Stat.FarmingFortune] ?? 0);
	}
	public declare fortune: number;
	public declare fortuneBreakdown: Record<string, number>;

	public declare options?: PlayerOptions;

	constructor(item: EliteItemDto, options?: PlayerOptions) {
		super({ item, options, items: ARMOR_INFO });
		this.getFortune();
	}

	setOptions(options: PlayerOptions) {
		this.options = options;
		this.fortune = this.getFortune();
	}

	getFortune() {
		this.fortuneBreakdown = {};
		let sum = 0;

		// Base fortune
		const base = this.info.baseStats?.[Stat.FarmingFortune] ?? 0;
		if (base > 0) {
			this.fortuneBreakdown['Base Stats'] = base;
			sum += base;
		}

		// Per farming level stats like Rancher's Boots
		if (this.info.perLevelStats?.skill === Skill.Farming && this.options?.farmingLevel) {
			const perLevel = this.info.perLevelStats?.stats[Stat.FarmingFortune] ?? 0;
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

			const enchantment = FARMING_ENCHANTS[enchant];
			if (!enchantment || !level || enchantment.cropSpecific) continue;

			const fortune = getFortuneFromEnchant(level, enchantment, this.options);
			if (fortune > 0) {
				this.fortuneBreakdown[enchantment.name] = fortune;
				sum += fortune;
			}
		}

		this.fortune = sum;
		return sum;
	}

	getUpgrades() {
		return getItemUpgrades(this);
	}

	getItemUpgrade() {
		return this.info.upgrade;
	}

	getLastItemUpgrade() {
		return getLastItemUpgradeableTo(this, ARMOR_INFO);
	}

	getProgress(zeroed = false): FortuneSourceProgress[] {
		return getSourceProgress<FarmingArmor | FarmingEquipment>(this, GEAR_FORTUNE_SOURCES, zeroed);
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

	static fakeItem(info: UpgradeableInfo, options?: PlayerOptions): FarmingArmor | undefined {
		const fake: EliteItemDto = {
			name: 'Fake Item',
			skyblockId: info.skyblockId,
			lore: [],
			attributes: {},
			enchantments: {},
		};

		if (!FarmingArmor.isValid(fake)) return undefined;

		return new FarmingArmor(fake, options);
	}
}
