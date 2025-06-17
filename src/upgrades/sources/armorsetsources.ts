import { ReforgeTarget } from '../../constants/reforges.js';
import { Stat } from '../../constants/stats.js';
import { UpgradeAction, UpgradeCategory } from '../../constants/upgrades.js';
import { ArmorSet, FarmingArmor } from '../../fortune/farmingarmor.js';
import { FarmingEquipment } from '../../fortune/farmingequipment.js';
import { UpgradeableInfo } from '../../fortune/upgradeable.js';
import { ARMOR_SET_BONUS, FARMING_ARMOR_INFO, GEAR_SLOTS, GearSlot, GearSlotInfo } from '../../items/armor.js';
import { FARMING_EQUIPMENT_INFO } from '../../items/equipment.js';
import { DynamicFortuneSource } from './toolsources.js';

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
	},
	...Object.entries(GEAR_SLOTS)
		.filter(([, info]) => info.target === ReforgeTarget.Equipment)
		.map<DynamicFortuneSource<ArmorSet>>(gearslot),
	{
		name: 'Equipment Set Bonus',
		exists: (set) => set.equipmentSetBonuses.length > 0,
		wiki: () => 'https://wiki.hypixel.net/Pesthunter%27s_Gloves',
		max: () => ARMOR_SET_BONUS.PESTHUNTERS?.stats[4]?.[Stat.FarmingFortune] ?? 0,
		current: (set) =>
			set.equipmentSetBonuses.reduce((acc, bonus) => {
				return acc + (bonus.bonus.stats[bonus.count]?.[Stat.FarmingFortune] ?? 0);
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
			const item =
				info.target === ReforgeTarget.Armor
					? FarmingArmor.fakeItem(FARMING_ARMOR_INFO[info.startingItem] as UpgradeableInfo)
					: FarmingEquipment.fakeItem(FARMING_EQUIPMENT_INFO[info.startingItem] as UpgradeableInfo);

			const progress = item?.getProgress();
			const maxed = progress?.reduce((acc, p) => acc + p.maxFortune, 0) ?? 0;

			const currentItem = set.getPiece(slot as GearSlot);
			if (currentItem) {
				const currentProgress = currentItem.getProgress();
				const currentMaxed = currentProgress?.reduce((acc, p) => acc + p.maxFortune, 0) ?? 0;
				if (currentMaxed > maxed) return currentMaxed;
			}

			return maxed;
		},
		current: (set) => {
			const item = set.getPiece(slot as GearSlot);
			const progress = item?.getProgress();
			return progress?.reduce((acc, p) => acc + p.fortune, 0) ?? 0;
		},
		progress: (set) => {
			const item = set.getPiece(slot as GearSlot);
			if (item) return item.getProgress();

			const fake =
				info.target === ReforgeTarget.Armor
					? FarmingArmor.fakeItem(FARMING_ARMOR_INFO[info.startingItem] as UpgradeableInfo)
					: FarmingEquipment.fakeItem(FARMING_EQUIPMENT_INFO[info.startingItem] as UpgradeableInfo);

			return fake?.getProgress(true) ?? [];
		},
		info: (set) => {
			const piece = set.getPiece(slot as GearSlot);
			const fake = !piece
				? info.target === ReforgeTarget.Armor
					? FarmingArmor.fakeItem(FARMING_ARMOR_INFO[info.startingItem] as UpgradeableInfo)
					: FarmingEquipment.fakeItem(FARMING_EQUIPMENT_INFO[info.startingItem] as UpgradeableInfo)
				: undefined;

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

			const fakeItem =
				info.target === ReforgeTarget.Armor
					? FarmingArmor.fakeItem(itemToPurchase)
					: FarmingEquipment.fakeItem(itemToPurchase);

			return [
				{
					title: itemToPurchase.name,
					action: UpgradeAction.Purchase,
					purchase: fakeItem?.item.skyblockId ?? undefined,
					increase: fakeItem?.getFortune() ?? 0,
					wiki: itemToPurchase.wiki,
					category: UpgradeCategory.Item,
					onto: {
						slot: slot as GearSlot,
					},
					cost: fakeItem?.item.skyblockId
						? {
								items: {
									[fakeItem.item.skyblockId]: 1,
								},
							}
						: undefined,
				},
			];
		},
	};
}
