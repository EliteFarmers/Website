import type { Crop } from '../constants/crops.js';
import { FARMING_ENCHANTS } from '../constants/enchants.js';
import { type Rarity, type Reforge, ReforgeTarget, type ReforgeTier } from '../constants/reforges.js';
import { Skill } from '../constants/skills.js';
import { MATCHING_SPECIAL_CROP, type SpecialCrop } from '../constants/specialcrops.js';
import { Stat, type StatBreakdown } from '../constants/stats.js';
import {
	type FortuneSourceProgress,
	type FortuneUpgrade,
	getQueryStats,
	includesFortuneSourceType,
	type StatQueryOptions,
} from '../constants/upgrades.js';
import { calculateAverageSpecialCrops } from '../crops/special.js';
import { buildEffectEnvironmentFromOptions } from '../effects/environment.js';
import { resolveOverbloomBreakdown, resolveStatBreakdown } from '../effects/resolver.js';
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
import {
	ARMOR_LOADOUT_FORTUNE_SOURCES,
	ARMOR_SET_FORTUNE_SOURCES,
	EQUIPMENT_LOADOUT_FORTUNE_SOURCES,
} from '../upgrades/sources/armorsetsources.js';
import { GEAR_FORTUNE_SOURCES } from '../upgrades/sources/gearsources.js';
import { getLastItemUpgradeableTo, getSelfFortuneUpgrade, getUpgradeableRarityUpgrade } from '../upgrades/upgrades.js';
import { filterAndSortUpgrades } from '../upgrades/upgradeutils.js';
import { getFortuneFromEnchant, getStatFromEnchant } from '../util/enchants.js';
import { getGemStat, getPeridotFortune } from '../util/gems.js';
import { FarmingEquipment } from './farmingequipment.js';
import type { EliteItemDto } from './item.js';
import type { UpgradeableInfo } from './upgradeable.js';
import { UpgradeableBase } from './upgradeablebase.js';

const MANTID_RECENT_KILL_BONUS = 0.25;
const MANTID_RECENT_KILL_CAP = 20;

function getMantidPestKillBonus(options?: PlayerOptions): number {
	const kills = Math.max(0, Math.min(options?.mantidPestKills ?? 0, MANTID_RECENT_KILL_CAP));
	return kills * MANTID_RECENT_KILL_BONUS;
}

export interface ActiveArmorSetBonus {
	count: number;
	from: GearSlot[];
	bonus: ArmorSetBonus;
	special?: SpecialCrop[];
}

type GearPiece = FarmingArmor | FarmingEquipment;

export const ARMOR_LOADOUT_SLOTS = [GearSlot.Helmet, GearSlot.Chestplate, GearSlot.Leggings, GearSlot.Boots] as const;
const ARMOR_LOADOUT_SLOT_NAMES = new Set(['HELMET', 'CHESTPLATE', 'LEGGINGS', 'BOOTS']);

type ArmorPieceSelection = Partial<Record<GearSlot, FarmingArmor>>;

export interface SelectArmorLoadoutOptions {
	slots?: readonly GearSlot[];
	scorePiece?: (piece: FarmingArmor) => number;
	excluded?: ReadonlySet<string>;
	initial?: Partial<Record<GearSlot, FarmingArmor | null>>;
	minInventorySetPieces?: number;
	fillMissing?: boolean;
}

function getSetBonusFrom(pieces: (GearPiece | null)[]) {
	const families = new Map<string, number>();
	const result = [];

	for (const piece of pieces) {
		if (!piece?.info.family) continue;

		families.set(piece.info.family, (families.get(piece.info.family) ?? 0) + 1);
	}

	for (const [family, count] of families.entries()) {
		if (count < 2) continue;

		const bonus = ARMOR_SET_BONUS[family];
		if (!bonus) continue;

		result.push({
			count: count,
			from: pieces.filter((a) => a?.info.family === family).map((a) => a?.slot) as GearSlot[],
			bonus: bonus,
			special: bonus.special,
		});
	}

	return result;
}

function isArmorSlot(slot: GearSlot): boolean {
	return GEAR_SLOTS[slot]?.target === ReforgeTarget.Armor;
}

function isEquipmentSlot(slot: GearSlot): boolean {
	return GEAR_SLOTS[slot]?.target === ReforgeTarget.Equipment;
}

function getStartingArmorPiece(slot: GearSlot): FarmingArmor | undefined {
	const info = GEAR_SLOTS[slot];
	if (!info || info.target !== ReforgeTarget.Armor) return undefined;
	return FarmingArmor.fakeItem(FARMING_ARMOR_INFO[info.startingItem] as FarmingArmorInfo);
}

function getStartingEquipmentPiece(slot: GearSlot): FarmingEquipment | undefined {
	const info = GEAR_SLOTS[slot];
	if (!info || info.target !== ReforgeTarget.Equipment) return undefined;
	return FarmingEquipment.fakeItem(FARMING_EQUIPMENT_INFO[info.startingItem] as FarmingArmorInfo);
}

function parseInventorySlot(slot: string | null | undefined): { inventory: string; parts: string[] } | undefined {
	if (!slot) return undefined;

	const separator = slot.indexOf(':');
	if (separator < 0) return undefined;

	const inventory = slot.slice(0, separator).toLowerCase();
	const parts = slot.slice(separator + 1).split(':');

	return {
		inventory,
		parts,
	};
}

export function getArmorInventorySetKey(item: EliteItemDto): string | undefined {
	const parsed = parseInventorySlot(item.slot);
	if (!parsed) return undefined;

	const [firstPart, secondPart] = parsed.parts;

	if (parsed.inventory === 'armor' && parsed.parts.length === 1 && /^\d+$/.test(firstPart ?? '')) {
		const index = Number(firstPart);
		if (index < 0 || index > 3) return undefined;
		return 'armor:equipped';
	}

	if (
		parsed.inventory === 'wardrobe' &&
		parsed.parts.length === 2 &&
		/^\d+$/.test(firstPart ?? '') &&
		ARMOR_LOADOUT_SLOT_NAMES.has((secondPart ?? '').toUpperCase())
	) {
		return `wardrobe:${firstPart}`;
	}

	return undefined;
}

function scoreInventorySet(
	key: string,
	pieces: ArmorPieceSelection,
	slots: readonly GearSlot[],
	scorePiece: (piece: FarmingArmor) => number
) {
	const present = slots.filter((slot) => pieces[slot]);
	const pieceScore = present.reduce((sum, slot) => sum + scorePiece(pieces[slot]!), 0);
	const equippedBonus = key === 'armor:equipped' ? 100 : 0;
	return present.length * 10_000 + equippedBonus + pieceScore;
}

export function selectArmorLoadoutPieces(
	armor: FarmingArmor[],
	options: SelectArmorLoadoutOptions = {}
): ArmorPieceSelection {
	const slots = options.slots ?? ARMOR_LOADOUT_SLOTS;
	const allowedSlots = new Set<GearSlot>(slots);
	const scorePiece = options.scorePiece ?? ((piece: FarmingArmor) => piece.potential);
	const excluded = options.excluded ?? new Set<string>();
	const minInventorySetPieces = options.minInventorySetPieces ?? 2;
	const fillMissing = options.fillMissing ?? true;
	const result: ArmorPieceSelection = {};
	const blockedSlots = new Set<GearSlot>();
	const used = new Set<string>();

	for (const slot of slots) {
		if (!Object.hasOwn(options.initial ?? {}, slot)) continue;

		blockedSlots.add(slot);
		const piece = options.initial?.[slot];
		if (!piece) continue;

		result[slot] = piece;
		if (piece.item.uuid) used.add(piece.item.uuid);
	}

	const inventorySets = new Map<string, ArmorPieceSelection>();
	for (const piece of armor) {
		const pieceSlot = piece.slot;
		if (!pieceSlot || !allowedSlots.has(pieceSlot)) continue;
		if (piece.item.uuid && excluded.has(piece.item.uuid)) continue;

		const key = getArmorInventorySetKey(piece.item);
		if (!key) continue;

		const pieces = inventorySets.get(key) ?? {};
		const current = pieces[pieceSlot];
		if (!current || scorePiece(piece) > scorePiece(current)) {
			pieces[pieceSlot] = piece;
		}
		inventorySets.set(key, pieces);
	}

	let bestInventorySet: ArmorPieceSelection | undefined;
	let bestInventorySetScore = Number.NEGATIVE_INFINITY;
	for (const [key, pieces] of inventorySets.entries()) {
		const presentCount = slots.filter((slot) => pieces[slot]).length;
		if (presentCount < minInventorySetPieces) continue;

		const score = scoreInventorySet(key, pieces, slots, scorePiece);
		if (score > bestInventorySetScore) {
			bestInventorySet = pieces;
			bestInventorySetScore = score;
		}
	}

	if (bestInventorySet) {
		for (const slot of slots) {
			if (blockedSlots.has(slot) || result[slot]) continue;
			const piece = bestInventorySet[slot];
			if (!piece) continue;

			result[slot] = piece;
			if (piece.item.uuid) used.add(piece.item.uuid);
		}
	}

	if (!fillMissing) return result;

	for (const slot of slots) {
		if (blockedSlots.has(slot) || result[slot]) continue;

		const best = armor
			.filter((piece) => {
				if (piece.slot !== slot) return false;
				if (piece.item.uuid && (excluded.has(piece.item.uuid) || used.has(piece.item.uuid))) return false;
				return true;
			})
			.reduce<FarmingArmor | undefined>((current, candidate) => {
				if (!current) return candidate;
				return scorePiece(candidate) > scorePiece(current) ? candidate : current;
			}, undefined);

		if (best) {
			result[slot] = best;
			if (best.item.uuid) used.add(best.item.uuid);
		}
	}

	return result;
}

export class ArmorLoadout {
	public declare helmet?: FarmingArmor;
	public declare chestplate?: FarmingArmor;
	public declare leggings?: FarmingArmor;
	public declare boots?: FarmingArmor;

	public get armor(): (FarmingArmor | null)[] {
		return [this.helmet ?? null, this.chestplate ?? null, this.leggings ?? null, this.boots ?? null];
	}

	public declare pieces: FarmingArmor[];
	public declare armorFortune: number;
	get fortune() {
		return this.armorFortune;
	}
	public declare setBonuses: ActiveArmorSetBonus[];

	public declare options?: PlayerOptions;

	constructor(armor: FarmingArmor[], options?: PlayerOptions) {
		this.setBonuses = [];
		this.options = options;

		if (options) {
			for (const piece of armor) {
				piece.setOptions(options);
			}
		}

		this.setArmor(armor);
	}

	setArmor(armor: FarmingArmor[]) {
		armor.sort((a, b) => b.potential - a.potential);
		this.pieces = armor;

		const selected = selectArmorLoadoutPieces(armor);

		this.helmet = selected[GearSlot.Helmet];
		this.chestplate = selected[GearSlot.Chestplate];
		this.leggings = selected[GearSlot.Leggings];
		this.boots = selected[GearSlot.Boots];

		this.recalculateFamilies();
	}

	setOptions(options: PlayerOptions) {
		for (const piece of this.pieces) {
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

	getPiece(slot: GearSlot): FarmingArmor | undefined {
		switch (slot) {
			case GearSlot.Helmet:
				return this.helmet;
			case GearSlot.Chestplate:
				return this.chestplate;
			case GearSlot.Leggings:
				return this.leggings;
			case GearSlot.Boots:
				return this.boots;
			default:
				return;
		}
	}

	getStartingPiece(slot: GearSlot): FarmingArmor | undefined {
		return getStartingArmorPiece(slot);
	}

	setPiece(armor: FarmingArmor) {
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

		this.getFortuneBreakdown(true);
	}

	clearSlot(slot: GearSlot) {
		switch (slot) {
			case GearSlot.Helmet:
				this.helmet = undefined;
				break;
			case GearSlot.Chestplate:
				this.chestplate = undefined;
				break;
			case GearSlot.Leggings:
				this.leggings = undefined;
				break;
			case GearSlot.Boots:
				this.boots = undefined;
				break;
		}
		this.getFortuneBreakdown(true);
	}

	private recalculateFamilies() {
		this.setBonuses = getSetBonusFrom(this.armor ?? []);

		this.getFortuneBreakdown();
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

	getProgress(options?: Stat[] | StatQueryOptions, zeroed = false) {
		const query = Array.isArray(options) ? { stats: options } : options;
		return getSourceProgress<ArmorLoadout>(this, ARMOR_LOADOUT_FORTUNE_SOURCES, zeroed, query);
	}

	getUpgrades(options?: StatQueryOptions) {
		const hasExplicitStats = (options?.stats?.length ?? 0) > 0 || options?.stat !== undefined;
		const stats = hasExplicitStats ? getQueryStats(options) : undefined;
		const upgrades = getSourceProgress<ArmorLoadout>(this, ARMOR_LOADOUT_FORTUNE_SOURCES, false, {
			stats,
			sourceTypes: options?.sourceTypes,
		}).flatMap((source) => source.upgrades ?? []);
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

	get slots(): Partial<Record<GearSlot, FarmingArmor | undefined>> {
		return {
			[GearSlot.Helmet]: this.helmet,
			[GearSlot.Chestplate]: this.chestplate,
			[GearSlot.Leggings]: this.leggings,
			[GearSlot.Boots]: this.boots,
		};
	}

	get slotOptions(): Partial<Record<GearSlot, FarmingArmor[]>> {
		return {
			[GearSlot.Helmet]: this.pieces.filter((a) => a.slot === GearSlot.Helmet),
			[GearSlot.Chestplate]: this.pieces.filter((a) => a.slot === GearSlot.Chestplate),
			[GearSlot.Leggings]: this.pieces.filter((a) => a.slot === GearSlot.Leggings),
			[GearSlot.Boots]: this.pieces.filter((a) => a.slot === GearSlot.Boots),
		};
	}
}

export class EquipmentLoadout {
	public declare necklace?: FarmingEquipment;
	public declare cloak?: FarmingEquipment;
	public declare belt?: FarmingEquipment;
	public declare gloves?: FarmingEquipment;

	get equipment(): (FarmingEquipment | null)[] {
		return [this.necklace ?? null, this.cloak ?? null, this.belt ?? null, this.gloves ?? null];
	}

	public declare equipmentPieces: FarmingEquipment[];
	public declare equipmentFortune: number;
	get fortune() {
		return this.equipmentFortune;
	}
	public declare equipmentSetBonuses: ActiveArmorSetBonus[];

	public declare options?: PlayerOptions;

	constructor(equipment: FarmingEquipment[], options?: PlayerOptions) {
		this.equipmentSetBonuses = [];
		this.options = options;

		if (options) {
			for (const piece of equipment) {
				piece.setOptions(options);
			}
		}

		this.setEquipment(equipment);
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
		this.setEquipment(this.equipmentPieces);
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

	getPiece(slot: GearSlot): FarmingEquipment | undefined {
		switch (slot) {
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

	getStartingPiece(slot: GearSlot): FarmingEquipment | undefined {
		return getStartingEquipmentPiece(slot);
	}

	setPiece(equipment: FarmingEquipment) {
		switch (equipment.slot) {
			case GearSlot.Necklace:
				this.necklace = equipment;
				break;
			case GearSlot.Cloak:
				this.cloak = equipment;
				break;
			case GearSlot.Belt:
				this.belt = equipment;
				break;
			case GearSlot.Gloves:
				this.gloves = equipment;
				break;
		}

		this.getFortuneBreakdown(true);
	}

	clearSlot(slot: GearSlot) {
		switch (slot) {
			case GearSlot.Necklace:
				this.necklace = undefined;
				break;
			case GearSlot.Cloak:
				this.cloak = undefined;
				break;
			case GearSlot.Belt:
				this.belt = undefined;
				break;
			case GearSlot.Gloves:
				this.gloves = undefined;
				break;
		}
		this.getFortuneBreakdown(true);
	}

	private recalculateFamilies() {
		this.equipmentSetBonuses = getSetBonusFrom(this.equipment ?? []);

		this.getFortuneBreakdown();
	}

	getStat(stat: Stat, crop?: Crop): number {
		let sum = 0;

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
	 * Returns the declarative `Effect[]` for the whole equipment loadout: every
	 * equipment piece's effects plus equipment set bonuses keyed by piece count.
	 */
	getEffects(env: EffectEnvironment): Effect[] {
		const effects: Effect[] = [];

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

		const breakdown: Record<string, number> = {};
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

	getProgress(options?: Stat[] | StatQueryOptions, zeroed = false) {
		const query = Array.isArray(options) ? { stats: options } : options;
		return getSourceProgress<EquipmentLoadout>(this, EQUIPMENT_LOADOUT_FORTUNE_SOURCES, zeroed, query);
	}

	getUpgrades(options?: StatQueryOptions) {
		const hasExplicitStats = (options?.stats?.length ?? 0) > 0 || options?.stat !== undefined;
		const stats = hasExplicitStats ? getQueryStats(options) : undefined;
		const upgrades = getSourceProgress<EquipmentLoadout>(this, EQUIPMENT_LOADOUT_FORTUNE_SOURCES, false, {
			stats,
			sourceTypes: options?.sourceTypes,
		}).flatMap((source) => source.upgrades ?? []);
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

	get slots(): Partial<Record<GearSlot, FarmingEquipment | undefined>> {
		return {
			[GearSlot.Necklace]: this.necklace,
			[GearSlot.Cloak]: this.cloak,
			[GearSlot.Belt]: this.belt,
			[GearSlot.Gloves]: this.gloves,
		};
	}

	get slotOptions(): Partial<Record<GearSlot, FarmingEquipment[]>> {
		return {
			[GearSlot.Necklace]: this.equipmentPieces.filter((a) => a.slot === GearSlot.Necklace),
			[GearSlot.Cloak]: this.equipmentPieces.filter((a) => a.slot === GearSlot.Cloak),
			[GearSlot.Belt]: this.equipmentPieces.filter((a) => a.slot === GearSlot.Belt),
			[GearSlot.Gloves]: this.equipmentPieces.filter((a) => a.slot === GearSlot.Gloves),
		};
	}
}

export class ArmorSet {
	public readonly armorLoadout: ArmorLoadout;
	public readonly equipmentLoadout: EquipmentLoadout;
	public declare options?: PlayerOptions;

	constructor(armor: FarmingArmor[], equipment: FarmingEquipment[] = [], options?: PlayerOptions) {
		this.options = options;
		this.armorLoadout = new ArmorLoadout(armor, options);
		this.equipmentLoadout = new EquipmentLoadout(equipment, options);
	}

	public get helmet() {
		return this.armorLoadout.helmet;
	}
	public set helmet(piece: FarmingArmor | undefined) {
		piece ? this.armorLoadout.setPiece(piece) : this.armorLoadout.clearSlot(GearSlot.Helmet);
	}

	public get chestplate() {
		return this.armorLoadout.chestplate;
	}
	public set chestplate(piece: FarmingArmor | undefined) {
		piece ? this.armorLoadout.setPiece(piece) : this.armorLoadout.clearSlot(GearSlot.Chestplate);
	}

	public get leggings() {
		return this.armorLoadout.leggings;
	}
	public set leggings(piece: FarmingArmor | undefined) {
		piece ? this.armorLoadout.setPiece(piece) : this.armorLoadout.clearSlot(GearSlot.Leggings);
	}

	public get boots() {
		return this.armorLoadout.boots;
	}
	public set boots(piece: FarmingArmor | undefined) {
		piece ? this.armorLoadout.setPiece(piece) : this.armorLoadout.clearSlot(GearSlot.Boots);
	}

	public get armor(): (FarmingArmor | null)[] {
		return this.armorLoadout.armor;
	}

	public get necklace() {
		return this.equipmentLoadout.necklace;
	}
	public set necklace(piece: FarmingEquipment | undefined) {
		piece ? this.equipmentLoadout.setPiece(piece) : this.equipmentLoadout.clearSlot(GearSlot.Necklace);
	}

	public get cloak() {
		return this.equipmentLoadout.cloak;
	}
	public set cloak(piece: FarmingEquipment | undefined) {
		piece ? this.equipmentLoadout.setPiece(piece) : this.equipmentLoadout.clearSlot(GearSlot.Cloak);
	}

	public get belt() {
		return this.equipmentLoadout.belt;
	}
	public set belt(piece: FarmingEquipment | undefined) {
		piece ? this.equipmentLoadout.setPiece(piece) : this.equipmentLoadout.clearSlot(GearSlot.Belt);
	}

	public get gloves() {
		return this.equipmentLoadout.gloves;
	}
	public set gloves(piece: FarmingEquipment | undefined) {
		piece ? this.equipmentLoadout.setPiece(piece) : this.equipmentLoadout.clearSlot(GearSlot.Gloves);
	}

	get equipment(): (FarmingEquipment | null)[] {
		return this.equipmentLoadout.equipment;
	}

	public get pieces() {
		return this.armorLoadout.pieces;
	}
	public set pieces(armor: FarmingArmor[]) {
		this.armorLoadout.setArmor(armor);
	}

	public get equipmentPieces() {
		return this.equipmentLoadout.equipmentPieces;
	}
	public set equipmentPieces(equipment: FarmingEquipment[]) {
		this.equipmentLoadout.setEquipment(equipment);
	}

	public get armorFortune() {
		return this.armorLoadout.armorFortune;
	}

	public get equipmentFortune() {
		return this.equipmentLoadout.equipmentFortune;
	}

	get fortune() {
		return this.armorFortune + this.equipmentFortune;
	}

	public get setBonuses() {
		return this.armorLoadout.setBonuses;
	}

	public get equipmentSetBonuses() {
		return this.equipmentLoadout.equipmentSetBonuses;
	}

	static getSetBonusFrom(pieces: (GearPiece | null)[]) {
		return getSetBonusFrom(pieces);
	}

	setArmor(armor: FarmingArmor[]) {
		this.armorLoadout.setArmor(armor);
	}

	setEquipment(equipment: FarmingEquipment[]) {
		this.equipmentLoadout.setEquipment(equipment);
	}

	setOptions(options: PlayerOptions) {
		this.armorLoadout.setOptions(options);
		this.equipmentLoadout.setOptions(options);
		this.options = options;
	}

	resetChosenPieces() {
		this.armorLoadout.resetChosenPieces();
		this.equipmentLoadout.resetChosenPieces();
	}

	updateArmorSlot(piece: FarmingArmor) {
		this.armorLoadout.updateArmorSlot(piece);
	}

	updateEquipmentSlot(piece: FarmingEquipment) {
		this.equipmentLoadout.updateEquipmentSlot(piece);
	}

	getPiece(slot: GearSlot): GearPiece | undefined {
		if (isArmorSlot(slot)) return this.armorLoadout.getPiece(slot);
		if (isEquipmentSlot(slot)) return this.equipmentLoadout.getPiece(slot);
		return undefined;
	}

	getStartingPiece(slot: GearSlot): GearPiece | undefined {
		if (isArmorSlot(slot)) return this.armorLoadout.getStartingPiece(slot);
		if (isEquipmentSlot(slot)) return this.equipmentLoadout.getStartingPiece(slot);
		return undefined;
	}

	setPiece(piece: GearPiece) {
		if (piece instanceof FarmingArmor) {
			this.armorLoadout.setPiece(piece);
		} else {
			this.equipmentLoadout.setPiece(piece);
		}
	}

	clearSlot(slot: GearSlot) {
		if (isArmorSlot(slot)) {
			this.armorLoadout.clearSlot(slot);
		} else if (isEquipmentSlot(slot)) {
			this.equipmentLoadout.clearSlot(slot);
		}
	}

	getStat(stat: Stat, crop?: Crop): number {
		return this.armorLoadout.getStat(stat, crop) + this.equipmentLoadout.getStat(stat, crop);
	}

	/**
	 * Returns the declarative `Effect[]` for the entire armor set: every armor
	 * piece's effects, every equipment piece's effects, and the armor / equipment
	 * set bonuses keyed by current piece count.
	 */
	getEffects(env: EffectEnvironment): Effect[] {
		return [...this.armorLoadout.getEffects(env), ...this.equipmentLoadout.getEffects(env)];
	}

	getFortuneBreakdown(reloadFamilies = false) {
		return {
			...this.armorLoadout.getFortuneBreakdown(reloadFamilies),
			...this.equipmentLoadout.getFortuneBreakdown(reloadFamilies),
		};
	}

	specialDropsCalc(blocksBroken: number, crop: Crop) {
		return this.armorLoadout.specialDropsCalc(blocksBroken, crop);
	}

	specialDropsCount(crop: Crop): 0 | 1 | 2 | 3 | 4 {
		return this.armorLoadout.specialDropsCount(crop);
	}

	getProgress(options?: Stat[] | StatQueryOptions, zeroed = false) {
		const query = Array.isArray(options) ? { stats: options } : options;
		return getSourceProgress<ArmorSet>(this, ARMOR_SET_FORTUNE_SOURCES, zeroed, query);
	}

	getUpgrades(options?: StatQueryOptions) {
		const hasExplicitStats = (options?.stats?.length ?? 0) > 0 || options?.stat !== undefined;
		const stats = hasExplicitStats ? getQueryStats(options) : undefined;
		const upgrades = getSourceProgress<ArmorSet>(this, ARMOR_SET_FORTUNE_SOURCES, false, {
			stats,
			sourceTypes: options?.sourceTypes,
		}).flatMap((source) => source.upgrades ?? []);
		return filterAndSortUpgrades(upgrades, options);
	}

	getPieceProgress(slot: GearSlot) {
		if (isArmorSlot(slot)) return this.armorLoadout.getPieceProgress(slot);
		if (isEquipmentSlot(slot)) return this.equipmentLoadout.getPieceProgress(slot);
		return [];
	}

	get slots(): Record<GearSlot, GearPiece | undefined> {
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

	get slotOptions(): Record<GearSlot, GearPiece[]> {
		return {
			[GearSlot.Helmet]: this.armorLoadout.slotOptions[GearSlot.Helmet] ?? [],
			[GearSlot.Chestplate]: this.armorLoadout.slotOptions[GearSlot.Chestplate] ?? [],
			[GearSlot.Leggings]: this.armorLoadout.slotOptions[GearSlot.Leggings] ?? [],
			[GearSlot.Boots]: this.armorLoadout.slotOptions[GearSlot.Boots] ?? [],
			[GearSlot.Necklace]: this.equipmentLoadout.slotOptions[GearSlot.Necklace] ?? [],
			[GearSlot.Cloak]: this.equipmentLoadout.slotOptions[GearSlot.Cloak] ?? [],
			[GearSlot.Belt]: this.equipmentLoadout.slotOptions[GearSlot.Belt] ?? [],
			[GearSlot.Gloves]: this.equipmentLoadout.slotOptions[GearSlot.Gloves] ?? [],
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

		if (stat === Stat.BonusPestChance && this.item.attributes?.modifier === 'mantid') {
			sum += getMantidPestKillBonus(this.options);
		}

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

	getStatBreakdown(stat: Stat, crop?: Crop): StatBreakdown {
		const env = buildEffectEnvironmentFromOptions(this.options, crop);
		const effects = this.getEffects(env);
		const resolved =
			stat === Stat.Overbloom
				? resolveOverbloomBreakdown(effects, { env, crop }, Stat.Overbloom)
				: resolveStatBreakdown(effects, stat, { env, crop });

		return Object.fromEntries(
			Object.entries(resolved).map(([source, value]) => [
				source,
				{
					value,
					stat,
				},
			])
		);
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

		if (this.item.attributes?.modifier === 'mantid') {
			const bonus = getMantidPestKillBonus(this.options);
			if (bonus) {
				effects.push({
					source: `${sourceName} (Mantid Bonus)`,
					op: 'add-stat',
					stat: Stat.BonusPestChance,
					value: bonus,
				});
			}
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
		const sourceType = this.type === ReforgeTarget.Equipment ? 'equipment' : 'armor';
		if (!includesFortuneSourceType(options, sourceType)) return [];

		const { deadEnd, upgrade: self } = getSelfFortuneUpgrade(this) ?? {};
		if (deadEnd && self) return filterAndSortUpgrades([self], options);

		const stats = getQueryStats(options, [Stat.FarmingFortune, Stat.Overbloom]);

		const upgrades = getSourceProgress<FarmingArmor | FarmingEquipment>(this, GEAR_FORTUNE_SOURCES, false, {
			stats,
			sourceTypes: options?.sourceTypes,
			defaultSourceType: sourceType,
		}).flatMap((source) => source.upgrades ?? []);

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

	getProgress(options?: Stat[] | StatQueryOptions, zeroed = false): FortuneSourceProgress[] {
		const query = Array.isArray(options) ? { stats: options } : options;
		const sourceType = this.type === ReforgeTarget.Equipment ? 'equipment' : 'armor';
		return getSourceProgress<FarmingArmor | FarmingEquipment>(this, GEAR_FORTUNE_SOURCES, zeroed, {
			...query,
			defaultSourceType: sourceType,
		});
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
