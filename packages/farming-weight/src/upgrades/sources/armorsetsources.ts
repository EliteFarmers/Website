import { ReforgeTarget } from '../../constants/reforges.js';
import { Stat } from '../../constants/stats.js';
import {
	type FortuneSourceProgress,
	type FortuneUpgrade,
	UpgradeAction,
	UpgradeCategory,
} from '../../constants/upgrades.js';
import type {
	ActiveArmorSetBonus,
	ArmorLoadout,
	ArmorSet,
	EquipmentLoadout,
	FarmingArmor,
} from '../../fortune/farmingarmor.js';
import { FarmingEquipment } from '../../fortune/farmingequipment.js';
import type { UpgradeableInfo } from '../../fortune/upgradeable.js';
import { ARMOR_SET_BONUS, FARMING_ARMOR_INFO, GEAR_SLOTS, GearSlot, type GearSlotInfo } from '../../items/armor.js';
import { FARMING_EQUIPMENT_INFO } from '../../items/equipment.js';
import type { DynamicFortuneSource } from './dynamicfortunesources.js';

interface GearLoadoutSourceModel {
	getPiece(slot: GearSlot): FarmingArmor | FarmingEquipment | undefined;
	getStartingPiece(slot: GearSlot): FarmingArmor | FarmingEquipment | undefined;
}

interface ArmorBonusSourceModel extends GearLoadoutSourceModel {
	setBonuses: ActiveArmorSetBonus[];
}

interface EquipmentBonusSourceModel extends GearLoadoutSourceModel {
	equipmentSetBonuses: ActiveArmorSetBonus[];
}

const PEST_EQUIPMENT_TARGETS: Partial<Record<GearSlot, string>> = {
	[GearSlot.Necklace]: 'PESTHUNTERS_NECKLACE',
	[GearSlot.Cloak]: 'PEST_VEST',
	[GearSlot.Belt]: 'PESTHUNTERS_BELT',
	[GearSlot.Gloves]: 'PESTHUNTERS_GLOVES',
};

const PEST_GEAR_STATS = new Set([Stat.BonusPestChance, Stat.PestCooldownReduction, Stat.PestKillFortune]);

function progressStatValue(progress: FortuneSourceProgress, stat: Stat, key: 'current' | 'max'): number {
	return progress.stats?.[stat]?.[key] ?? 0;
}

function includesPestGearStat(stats?: Stat[]): boolean {
	return stats?.some((stat) => PEST_GEAR_STATS.has(stat)) ?? false;
}

function statDelta(
	before: Partial<Record<Stat, number>>,
	after: Partial<Record<Stat, number>>
): Partial<Record<Stat, number>> {
	const result: Partial<Record<Stat, number>> = {};
	for (const stat of Object.values(Stat)) {
		const diff = (after[stat] ?? 0) - (before[stat] ?? 0);
		if (diff !== 0) result[stat] = diff;
	}
	return result;
}

function getPestEquipmentTarget(slot: GearSlot): FarmingEquipment | undefined {
	const targetId = PEST_EQUIPMENT_TARGETS[slot];
	const targetInfo = targetId ? FARMING_EQUIPMENT_INFO[targetId] : undefined;
	if (!targetInfo) return undefined;

	return FarmingEquipment.fakeItem(targetInfo);
}

function getPestEquipmentPurchase(
	set: GearLoadoutSourceModel,
	slot: GearSlot,
	stats?: Stat[]
): FortuneUpgrade | undefined {
	if (!includesPestGearStat(stats)) return undefined;

	const current = set.getPiece(slot);
	const target = getPestEquipmentTarget(slot);
	const targetSkyblockId = target?.item.skyblockId ?? undefined;
	if (!target || !targetSkyblockId || targetSkyblockId === current?.item.skyblockId) return undefined;

	const deltaStats = statDelta(current?.getStats() ?? {}, target.getStats());
	if (!stats?.some((stat) => (deltaStats[stat] ?? 0) > 0)) return undefined;

	return {
		title: target.info.name,
		action: UpgradeAction.Purchase,
		purchase: targetSkyblockId,
		increase: deltaStats[stats?.[0] ?? Stat.BonusPestChance] ?? deltaStats[Stat.FarmingFortune] ?? 0,
		stats: deltaStats,
		wiki: target.info.wiki,
		category: UpgradeCategory.Item,
		conflictKey: `item_purchase:${slot}:pest`,
		onto: {
			slot,
			name: current?.item.name,
			skyblockId: current?.item.skyblockId,
			newSkyblockId: targetSkyblockId,
		},
		cost: {
			items: {
				[targetSkyblockId]: 1,
			},
		},
		recommendation: target.info.recommendation,
		meta: {
			type: 'buy_item',
			id: targetSkyblockId,
			itemUuid: current?.item.uuid ?? undefined,
		},
		skillReq: target.info.skillReq,
	};
}

function getPestEquipmentMaxStat(set: GearLoadoutSourceModel, slot: GearSlot, stat: Stat): number {
	if (!PEST_GEAR_STATS.has(stat)) return 0;

	const target = getPestEquipmentTarget(slot);
	if (!target) return 0;

	return target
		.getProgress([stat], true)
		.reduce((acc, progress) => acc + progressStatValue(progress, stat, 'max'), 0);
}

function armorSlotSources<T extends GearLoadoutSourceModel>(): DynamicFortuneSource<T>[] {
	return Object.entries(GEAR_SLOTS)
		.filter(([, info]) => info.target === ReforgeTarget.Armor)
		.map<DynamicFortuneSource<T>>(gearslot);
}

function equipmentSlotSources<T extends GearLoadoutSourceModel>(): DynamicFortuneSource<T>[] {
	return Object.entries(GEAR_SLOTS)
		.filter(([, info]) => info.target === ReforgeTarget.Equipment)
		.map<DynamicFortuneSource<T>>(gearslot);
}

function armorSetBonus<T extends ArmorBonusSourceModel>(): DynamicFortuneSource<T> {
	return {
		name: 'Armor Set Bonus',
		sourceType: 'armor',
		exists: () => true,
		wiki: () => 'https://w.elitesb.gg/Fermento_Armor#Four_Pieces_',
		max: () => ARMOR_SET_BONUS.FERMENTO?.stats[4]?.[Stat.FarmingFortune] ?? 0,
		current: (set) =>
			set.setBonuses.reduce((acc, bonus) => {
				return acc + (bonus.bonus.stats[bonus.count]?.[Stat.FarmingFortune] ?? 0);
			}, 0),
		currentStat: (set, stat) =>
			set.setBonuses.reduce((acc, bonus) => {
				return acc + (bonus.bonus.stats[bonus.count]?.[stat] ?? 0);
			}, 0),
	};
}

function equipmentSetBonus<T extends EquipmentBonusSourceModel>(): DynamicFortuneSource<T> {
	return {
		name: 'Equipment Set Bonus',
		sourceType: 'equipment',
		exists: (set) => set.equipmentSetBonuses.length > 0,
		wiki: () => 'https://w.elitesb.gg/Pesthunter%27s_Gloves',
		max: () => 0,
		current: () => 0,
		maxStat: (_set, stat) => {
			return Math.max(
				...Object.values(ARMOR_SET_BONUS.PESTHUNTERS?.stats ?? {}).map((stats) => stats?.[stat] ?? 0),
				0
			);
		},
		currentStat: (set, stat) =>
			set.equipmentSetBonuses.reduce((acc, bonus) => {
				return acc + (bonus.bonus.stats[bonus.count]?.[stat] ?? 0);
			}, 0),
	};
}

export const ARMOR_LOADOUT_FORTUNE_SOURCES: DynamicFortuneSource<ArmorLoadout>[] = [
	...armorSlotSources<ArmorLoadout>(),
	armorSetBonus<ArmorLoadout>(),
];

export const EQUIPMENT_LOADOUT_FORTUNE_SOURCES: DynamicFortuneSource<EquipmentLoadout>[] = [
	...equipmentSlotSources<EquipmentLoadout>(),
	equipmentSetBonus<EquipmentLoadout>(),
];

export const ARMOR_SET_FORTUNE_SOURCES: DynamicFortuneSource<ArmorSet>[] = [
	...armorSlotSources<ArmorSet>(),
	armorSetBonus<ArmorSet>(),
	...equipmentSlotSources<ArmorSet>(),
	equipmentSetBonus<ArmorSet>(),
];

function gearslot<T extends GearLoadoutSourceModel>([slot, info]: [string, GearSlotInfo]): DynamicFortuneSource<T> {
	return {
		name: slot,
		sourceType: info.target === ReforgeTarget.Armor ? 'armor' : 'equipment',
		exists: () => true,
		wiki: (set) => {
			const current = set.getPiece(slot as GearSlot);
			return (
				current?.info.wiki ??
				(info.target === ReforgeTarget.Armor
					? FARMING_ARMOR_INFO[info.startingItem]?.wiki
					: FARMING_EQUIPMENT_INFO[info.startingItem]?.wiki)
			);
		},
		max: (set) => {
			const item = set.getStartingPiece(slot as GearSlot);

			const progress = item?.getProgress();
			const maxed = progress?.reduce((acc, p) => acc + p.max, 0) ?? 0;

			const currentItem = set.getPiece(slot as GearSlot);
			if (currentItem) {
				const currentProgress = currentItem.getProgress();
				const currentMaxed = currentProgress?.reduce((acc, p) => acc + p.max, 0) ?? 0;
				if (currentMaxed > maxed) return currentMaxed;
			}

			return maxed;
		},
		maxStat: (set, stat) => {
			const fake = set.getStartingPiece(slot as GearSlot);
			const fakeProgress = fake?.getProgress([stat], true) ?? [];
			const fakeMax = fakeProgress.reduce((acc, p) => acc + progressStatValue(p, stat, 'max'), 0);
			const pestMax = getPestEquipmentMaxStat(set, slot as GearSlot, stat);

			const currentItem = set.getPiece(slot as GearSlot);
			if (currentItem) {
				const currentProgress = currentItem.getProgress([stat], false);
				const currentMax = currentProgress.reduce((acc, p) => acc + progressStatValue(p, stat, 'max'), 0);
				return Math.max(fakeMax, pestMax, currentMax);
			}

			return Math.max(fakeMax, pestMax);
		},
		current: (set) => {
			const item = set.getPiece(slot as GearSlot);
			const progress = item?.getProgress();
			return progress?.reduce((acc, p) => acc + p.current, 0) ?? 0;
		},
		currentStat: (set, stat) => {
			const item = set.getPiece(slot as GearSlot);
			const progress = item?.getProgress([stat], false) ?? [];
			return progress.reduce((acc, p) => acc + progressStatValue(p, stat, 'current'), 0);
		},
		progress: (set, stats) => {
			const item = set.getPiece(slot as GearSlot);
			if (item) return item.getProgress(stats, false);

			const fake = set.getStartingPiece(slot as GearSlot);

			return fake?.getProgress(stats, true) ?? [];
		},
		info: (set) => {
			const piece = set.getPiece(slot as GearSlot);
			const fake = !piece ? set.getStartingPiece(slot as GearSlot) : undefined;

			return {
				item: piece?.item,
				info: piece?.info,
				nextInfo: fake ? fake.info : piece?.getNextItemUpgrade()?.info,
				maxInfo: (fake ? fake : piece)?.getLastItemUpgrade()?.info,
			};
		},
		upgrades: (set, stats) => {
			const piece = set.getPiece(slot as GearSlot);
			const pestEquipmentPurchase = getPestEquipmentPurchase(set, slot as GearSlot, stats);
			if (piece) {
				const upgrades = piece.getUpgrades(
					stats?.length ? (stats.length === 1 ? { stat: stats[0] } : { stats }) : undefined
				);
				if (pestEquipmentPurchase) upgrades.push(pestEquipmentPurchase);
				return upgrades;
			}
			if (pestEquipmentPurchase && info.target === ReforgeTarget.Equipment) {
				return [pestEquipmentPurchase];
			}

			const itemToPurchase =
				info.target === ReforgeTarget.Armor
					? (FARMING_ARMOR_INFO[info.startingItem] as UpgradeableInfo)
					: (FARMING_EQUIPMENT_INFO[info.startingItem] as UpgradeableInfo);

			const fakeItem = set.getStartingPiece(slot as GearSlot);

			const upgrade: FortuneUpgrade = {
				title: itemToPurchase.name,
				action: UpgradeAction.Purchase,
				purchase: fakeItem?.item.skyblockId ?? undefined,
				increase: fakeItem?.getFortune() ?? 0,
				stats: fakeItem?.getStats() ?? {},
				wiki: itemToPurchase.wiki,
				category: UpgradeCategory.Item,
				conflictKey: `item_purchase:${slot}`,
				onto: {
					slot: slot as GearSlot,
					newSkyblockId: itemToPurchase.skyblockId,
				},
				cost: fakeItem?.item.skyblockId
					? {
							items: {
								[fakeItem.item.skyblockId]: 1,
							},
						}
					: undefined,
				meta: {
					type: 'buy_item',
					id: itemToPurchase.skyblockId,
				},
				recommendation: itemToPurchase.recommendation,
			};

			if (itemToPurchase.skillReq) {
				upgrade.skillReq = itemToPurchase.skillReq;
			}
			return [upgrade];
		},
	};
}
