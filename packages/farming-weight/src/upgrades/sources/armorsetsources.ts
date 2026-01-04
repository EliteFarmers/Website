import { ReforgeTarget } from '../../constants/reforges.js';
import { Stat } from '../../constants/stats.js';
import { type FortuneUpgrade, UpgradeAction, UpgradeCategory } from '../../constants/upgrades.js';
import type { ArmorSet, FarmingArmor } from '../../fortune/farmingarmor.js';
import type { FarmingEquipment } from '../../fortune/farmingequipment.js';
import type { UpgradeableInfo } from '../../fortune/upgradeable.js';
import {
	ARMOR_SET_BONUS,
	FARMING_ARMOR_INFO,
	GEAR_SLOTS,
	type GearSlot,
	type GearSlotInfo,
} from '../../items/armor.js';
import { FARMING_EQUIPMENT_INFO } from '../../items/equipment.js';
import { getFakeItem } from '../itemregistry.js';
import type { DynamicFortuneSource } from './dynamicfortunesources.js';

export const ARMOR_SET_FORTUNE_SOURCES: DynamicFortuneSource<ArmorSet>[] = [
	...Object.entries(GEAR_SLOTS)
		.filter(([, info]) => info.target === ReforgeTarget.Armor)
		.map<DynamicFortuneSource<ArmorSet>>(gearslot),
	{
		name: 'Armor Set Bonus',
		exists: () => true,
		wiki: () => 'https://wiki.hypixel.net/Fermento_Armor#Four_Pieces_',
		max: () => ARMOR_SET_BONUS.FERMENTO?.stats[4]?.[Stat.FarmingFortune] ?? 0,
		current: (set) =>
			set.setBonuses.reduce((acc, bonus) => {
				return acc + (bonus.bonus.stats[bonus.count]?.[Stat.FarmingFortune] ?? 0);
			}, 0),
		currentStat: (set, stat) =>
			set.setBonuses.reduce((acc, bonus) => {
				return acc + (bonus.bonus.stats[bonus.count]?.[stat] ?? 0);
			}, 0),
	},
	...Object.entries(GEAR_SLOTS)
		.filter(([, info]) => info.target === ReforgeTarget.Equipment)
		.map<DynamicFortuneSource<ArmorSet>>(gearslot),
	{
		name: 'Equipment Set Bonus',
		exists: (set) => set.equipmentSetBonuses.length > 0,
		wiki: () => 'https://wiki.hypixel.net/Pesthunter%27s_Gloves',
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
	},
];

function gearslot([slot, info]: [string, GearSlotInfo]): DynamicFortuneSource<ArmorSet> {
	return {
		name: slot,
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
			const item = getFakeItem(info.startingItem);

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
			const fake = getFakeItem(info.startingItem);
			const fakeProgress = fake?.getProgress([stat], true) ?? [];
			const fakeMax = fakeProgress.reduce(
				(acc, p) => acc + (p.stats?.[stat]?.max ?? (stat === Stat.FarmingFortune ? p.max : 0)),
				0
			);

			const currentItem = set.getPiece(slot as GearSlot);
			if (currentItem) {
				const currentProgress = currentItem.getProgress([stat], false);
				const currentMax = currentProgress.reduce(
					(acc, p) => acc + (p.stats?.[stat]?.max ?? (stat === Stat.FarmingFortune ? p.max : 0)),
					0
				);
				if (currentMax > fakeMax) return currentMax;
			}

			return fakeMax;
		},
		current: (set) => {
			const item = set.getPiece(slot as GearSlot);
			const progress = item?.getProgress();
			return progress?.reduce((acc, p) => acc + p.current, 0) ?? 0;
		},
		currentStat: (set, stat) => {
			const item = set.getPiece(slot as GearSlot);
			const progress = item?.getProgress([stat], false) ?? [];
			return progress.reduce(
				(acc, p) => acc + (p.stats?.[stat]?.current ?? (stat === Stat.FarmingFortune ? p.current : 0)),
				0
			);
		},
		progress: (set, stats) => {
			const item = set.getPiece(slot as GearSlot);
			if (item) return item.getProgress(stats, false);

			const fake =
				info.target === ReforgeTarget.Armor
					? getFakeItem<FarmingArmor>(info.startingItem)
					: getFakeItem<FarmingEquipment>(info.startingItem);

			return fake?.getProgress(stats, true) ?? [];
		},
		info: (set) => {
			const piece = set.getPiece(slot as GearSlot);
			const fake = !piece ? getFakeItem(info.startingItem) : undefined;

			return {
				item: piece?.item,
				info: piece?.info,
				nextInfo: fake ? fake.info : piece?.getNextItemUpgrade()?.info,
				maxInfo: (fake ? fake : piece)?.getLastItemUpgrade()?.info,
			};
		},
		upgrades: (set) => {
			const piece = set.getPiece(slot as GearSlot);
			if (piece) return piece.getUpgrades();

			const itemToPurchase =
				info.target === ReforgeTarget.Armor
					? (FARMING_ARMOR_INFO[info.startingItem] as UpgradeableInfo)
					: (FARMING_EQUIPMENT_INFO[info.startingItem] as UpgradeableInfo);

			const fakeItem = getFakeItem(itemToPurchase.skyblockId);

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
			};

			if (itemToPurchase.skillReq) {
				upgrade.skillReq = itemToPurchase.skillReq;
			}
			return [upgrade];
		},
	};
}
