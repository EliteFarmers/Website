import type { Crop } from '../constants/crops.js';
import { FARMING_ENCHANTS } from '../constants/enchants.js';
import { type Rarity, type Reforge, ReforgeTarget, type ReforgeTier } from '../constants/reforges.js';
import { Skill } from '../constants/skills.js';
import { MATCHING_SPECIAL_CROP, type SpecialCrop } from '../constants/specialcrops.js';
import { Stat } from '../constants/stats.js';
import {
	type FortuneSourceProgress,
	type FortuneUpgrade,
	getQueryStats,
	type StatQueryOptions,
} from '../constants/upgrades.js';
import { calculateAverageSpecialCrops } from '../crops/special.js';
import type { Effect, EffectEnvironment } from '../effects/types.js';
import {
	ARMOR_SET_BONUS,
	type ArmorSetBonus,
	FARMING_ARMOR_INFO,
	type FarmingArmorInfo,
	GEAR_SLOTS,
	GearSlot,
} from '../items/armor.js';
import { FARMING_EQUIPMENT_INFO } from '../items/equipment.js';
import { statsToEffects } from '../items/sources/effects-util.js';
import { enchantEffects } from '../items/sources/enchants.js';
import { gemEffects } from '../items/sources/gems.js';
import { reforgeEffects } from '../items/sources/reforges.js';
import type { PlayerOptions } from '../player/playeroptions.js';
import { getSourceProgress } from '../upgrades/getsourceprogress.js';
import { ARMOR_SET_FORTUNE_SOURCES } from '../upgrades/sources/armorsetsources.js';
import { GEAR_FORTUNE_SOURCES } from '../upgrades/sources/gearsources.js';
import { getLastItemUpgradeableTo, getSelfFortuneUpgrade, getUpgradeableRarityUpgrade } from '../upgrades/upgrades.js';
import { filterAndSortUpgrades } from '../upgrades/upgradeutils.js';
import { getFortuneFromEnchant, getStatFromEnchant } from '../util/enchants.js';
import { getGemStat, getPeridotFortune } from '../util/gems.js';
import { FarmingEquipment } from './farmingequipment.js';
import type { EliteItemDto } from './item.js';
import type { UpgradeableInfo } from './upgradeable.js';
import { UpgradeableBase } from './upgradeablebase.js';

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

	public declare options?: PlayerOptions;

	constructor(armor: FarmingArmor[], equipment?: FarmingEquipment[], options?: PlayerOptions) {
		this.setBonuses = [];
		this.equipmentSetBonuses = [];
		this.options = options;

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

		if (!this.options) {
			this.resetChosenPieces();
		}

		this.getFortuneBreakdown(true);

		this.options = options;
	}

	resetChosenPieces() {
		this.setArmor(this.pieces);
		this.setEquipment(this.equipmentPieces);
	}

	updateArmorSlot(piece: FarmingArmor) {
		// Update the pieces array
		const idx = this.pieces.findIndex(
			(p) => p.item.uuid === piece.item.uuid || p.item.skyblockId === piece.item.skyblockId
		);
		if (idx >= 0) {
			this.pieces[idx] = piece;
		} else {
			this.pieces.push(piece);
		}

		// Update the specific slot
		switch (piece.slot) {
			case GearSlot.Helmet:
				this.helmet = piece;
				break;
			case GearSlot.Chestplate:
				this.chestplate = piece;
				break;
			case GearSlot.Leggings:
				this.leggings = piece;
				break;
			case GearSlot.Boots:
				this.boots = piece;
				break;
		}

		this.recalculateFamilies();
	}

	updateEquipmentSlot(piece: FarmingEquipment) {
		// Update the equipmentPieces array
		const idx = this.equipmentPieces.findIndex(
			(p) => p.item.uuid === piece.item.uuid || p.item.skyblockId === piece.item.skyblockId
		);
		if (idx >= 0) {
			this.equipmentPieces[idx] = piece;
		} else {
			this.equipmentPieces.push(piece);
		}

		// Update the specific slot
		switch (piece.slot) {
			case GearSlot.Necklace:
				this.necklace = piece;
				break;
			case GearSlot.Cloak:
				this.cloak = piece;
				break;
			case GearSlot.Belt:
				this.belt = piece;
				break;
			case GearSlot.Gloves:
				this.gloves = piece;
				break;
		}

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

	getStartingPiece(slot: GearSlot): FarmingArmor | FarmingEquipment | undefined {
		const info = GEAR_SLOTS[slot];
		return info.target === ReforgeTarget.Armor
			? FarmingArmor.fakeItem(FARMING_ARMOR_INFO[info.startingItem] as FarmingArmorInfo)
			: FarmingEquipment.fakeItem(FARMING_EQUIPMENT_INFO[info.startingItem] as FarmingArmorInfo);
	}

	setPiece(armor: FarmingArmor | FarmingEquipment) {
		if (armor instanceof FarmingArmor) {
			switch (armor.slot) {
				case GearSlot.Helmet:
					this.helmet = armor;
					break;
				case GearSlot.Chestplate:
					this.chestplate = armor;
					break;
				case GearSlot.Leggings:
					this.leggings = armor;
					break;
				case GearSlot.Boots:
					this.boots = armor;
					break;
			}
		} else if (armor instanceof FarmingEquipment) {
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
		}

		this.getFortuneBreakdown(true);
	}

	private recalculateFamilies() {
		this.setBonuses = ArmorSet.getSetBonusFrom(this.armor ?? []);
		this.equipmentSetBonuses = ArmorSet.getSetBonusFrom(this.equipment ?? []);

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

	getStat(stat: Stat, crop?: Crop): number {
		let sum = 0;
		// Armor fortune
		for (const piece of this.armor) {
			if (!piece) continue;
			sum += piece.getStat(stat, crop);
		}

		// Armor set bonuses
		for (const { bonus, count } of this.setBonuses) {
			if (count < 2 || count > 4) continue;
			sum += bonus.stats?.[count]?.[stat] ?? 0;
		}

		// Equipment fortune
		for (const piece of this.equipment) {
			if (!piece) continue;
			sum += piece.getStat(stat, crop);
		}

		// Equipment set bonuses
		for (const { bonus, count } of this.equipmentSetBonuses) {
			if (count < 2 || count > 4) continue;
			sum += bonus.stats?.[count]?.[stat] ?? 0;
		}

		return sum;
	}

	/**
	 * Returns the declarative `Effect[]` for the entire armor set: every armor
	 * piece's effects, every equipment piece's effects, and the armor / equipment
	 * set bonuses keyed by current piece count.
	 */
	getEffects(env: EffectEnvironment): Effect[] {
		const effects: Effect[] = [];

		for (const piece of this.armor) {
			if (!piece) continue;
			effects.push(...piece.getEffects(env));
		}

		for (const { bonus, count } of this.setBonuses) {
			if (count < 2 || count > 4) continue;
			const stats = bonus.stats?.[count];
			if (!stats) continue;
			effects.push(...statsToEffects(stats, `${bonus.name} (${count}-piece)`));
		}

		for (const piece of this.equipment) {
			if (!piece) continue;
			effects.push(...piece.getEffects(env));
		}

		for (const { bonus, count } of this.equipmentSetBonuses) {
			if (count < 2 || count > 4) continue;
			const stats = bonus.stats?.[count];
			if (!stats) continue;
			effects.push(...statsToEffects(stats, `${bonus.name} (${count}-piece)`));
		}

		return effects;
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

	specialDropsCount(crop: Crop): 0 | 1 | 2 | 3 | 4 {
		const special = MATCHING_SPECIAL_CROP[crop];

		const applicableBonuses = this.setBonuses.filter((b) => b.special?.includes(special));
		if (applicableBonuses.length === 0) return 0;

		// Mixed armor families should use the best active same-family tier.
		// For example, 2 Fermento + 2 Helianthus is not a 4-piece Feast bonus;
		// it is two separate 2-piece bonuses, so the special-crop rate uses 2.
		return Math.max(...applicableBonuses.map((bonus) => bonus.count)) as 1 | 2 | 3 | 4;
	}

	getProgress(stats?: Stat[], zeroed = false) {
		return getSourceProgress<ArmorSet>(this, ARMOR_SET_FORTUNE_SOURCES, zeroed, stats);
	}

	getUpgrades(options?: StatQueryOptions) {
		const hasExplicitStats = (options?.stats?.length ?? 0) > 0 || options?.stat !== undefined;
		const stats = hasExplicitStats ? getQueryStats(options) : undefined;
		const upgrades = getSourceProgress<ArmorSet>(this, ARMOR_SET_FORTUNE_SOURCES, false, stats).flatMap(
			(source) => source.upgrades ?? []
		);
		return filterAndSortUpgrades(upgrades, options);
	}

	getPieceProgress(slot: GearSlot) {
		let piece = this.getPiece(slot);
		if (!piece) {
			piece = this.getStartingPiece(slot);
			return piece?.getProgress(undefined, true) ?? [];
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
		super({ item, options, items: FARMING_ARMOR_INFO });
		this.getFortune();
	}

	setOptions(options: PlayerOptions) {
		this.options = options;
		this.fortune = this.getFortune();
	}

	getStat(stat: Stat, crop?: Crop): number {
		let sum = 0;

		// Base stats
		sum += this.info.baseStats?.[stat] ?? 0;

		// Per farming level stats like Rancher's Boots
		if (this.info.perLevelStats?.skill === Skill.Farming && this.options?.farmingLevel) {
			sum += (this.info.perLevelStats?.stats[stat] ?? 0) * this.options.farmingLevel;
		}

		// Reforge stats
		sum += this.reforgeStats?.stats?.[stat] ?? 0;

		// Gems
		sum += getGemStat(this.item, stat, this.rarity);

		// Enchantments
		const enchantments = Object.entries(this.item.enchantments ?? {});
		for (const [enchant, level] of enchantments) {
			if (!level) continue;

			const enchantment = FARMING_ENCHANTS[enchant];
			if (!enchantment || !level || enchantment.cropSpecific) continue;

			sum += getStatFromEnchant(level, enchantment, stat, this.options, crop);
		}

		return sum;
	}

	/**
	 * Returns the declarative `Effect[]` representation of every contribution
	 * this armor piece makes: base stats, per-farming-level stats, reforge,
	 * gems, and enchants. Set bonuses are handled at the `ArmorSet` level (see
	 * {@link ArmorSet.getEffects}).
	 */
	getEffects(env: EffectEnvironment): Effect[] {
		const sourceName = this.item.name ?? this.info.name;
		const effects: Effect[] = [];

		effects.push(...statsToEffects(this.info.baseStats, sourceName));

		if (this.info.perLevelStats?.skill === Skill.Farming && this.options?.farmingLevel) {
			const perLevel: Partial<Record<Stat, number>> = {};
			for (const [statKey, value] of Object.entries(this.info.perLevelStats.stats) as [Stat, number][]) {
				if (value) perLevel[statKey] = value * this.options.farmingLevel;
			}
			effects.push(...statsToEffects(perLevel, `${sourceName} (Farming Level)`));
		}

		if (this.reforge && this.item.attributes?.modifier) {
			effects.push(
				...reforgeEffects(this.item.attributes.modifier, this.rarity, `${sourceName} (${this.reforge.name})`)
			);
		}

		effects.push(...gemEffects(this.item, this.rarity, `${sourceName} (Gems)`));

		for (const [enchantId, level] of Object.entries(this.item.enchantments ?? {})) {
			if (!level) continue;
			effects.push(...enchantEffects(enchantId, level, env, this.options ?? {}));
		}

		return effects;
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

	getUpgrades(options?: StatQueryOptions): FortuneUpgrade[] {
		const { deadEnd, upgrade: self } = getSelfFortuneUpgrade(this) ?? {};
		if (deadEnd && self) return filterAndSortUpgrades([self], options);

		const stats = getQueryStats(options, [Stat.FarmingFortune, Stat.Overbloom]);

		const upgrades = getSourceProgress<FarmingArmor | FarmingEquipment>(
			this,
			GEAR_FORTUNE_SOURCES,
			false,
			stats
		).flatMap((source) => source.upgrades ?? []);

		if (self) {
			upgrades.push(self);
		}

		const rarityUpgrade = getUpgradeableRarityUpgrade(this);
		if (rarityUpgrade) {
			upgrades.push(rarityUpgrade);
		}

		return filterAndSortUpgrades(upgrades, options);
	}

	getItemUpgrade() {
		return this.info.upgrade;
	}

	getLastItemUpgrade() {
		return getLastItemUpgradeableTo(this, FARMING_ARMOR_INFO);
	}

	getProgress(stats?: Stat[], zeroed = false): FortuneSourceProgress[] {
		return getSourceProgress<FarmingArmor | FarmingEquipment>(this, GEAR_FORTUNE_SOURCES, zeroed, stats);
	}

	static isValid(item: EliteItemDto): boolean {
		return FARMING_ARMOR_INFO[item.skyblockId as keyof typeof FARMING_ARMOR_INFO] !== undefined;
	}

	static fromArray(items: EliteItemDto[], options?: PlayerOptions): FarmingArmor[] {
		return items
			.filter((item) => FarmingArmor.isValid(item))
			.map((item) => new FarmingArmor(item, options))
			.sort((a, b) => b.fortune - a.fortune);
	}

	static fakeItem(info: UpgradeableInfo, options?: PlayerOptions): FarmingArmor | undefined {
		const fake: EliteItemDto = {
			name: info.name,
			skyblockId: info.skyblockId,
			uuid: crypto.randomUUID(),
			lore: ['This is a fake item used for upgrade calculations!'],
			attributes: {},
			enchantments: {},
		};

		if (!FarmingArmor.isValid(fake)) return undefined;

		return new FarmingArmor(fake, options);
	}
}
