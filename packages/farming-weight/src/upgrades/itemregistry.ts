import { FarmingAccessory } from '../fortune/farmingaccessory.js';
import { FarmingArmor } from '../fortune/farmingarmor.js';
import { FarmingEquipment } from '../fortune/farmingequipment.js';
import { FarmingTool } from '../fortune/farmingtool.js';
import type { UpgradeableInfo } from '../fortune/upgradeable.js';
import type { UpgradeableBase } from '../fortune/upgradeablebase.js';
import type { PlayerOptions } from '../player/playeroptions.js';
import { ITEM_INFO_REGISTRY } from './itemcatalog.js';

interface RegistrableItem {
	info: UpgradeableInfo;
	fakeItem: (info: UpgradeableInfo, options?: PlayerOptions) => UpgradeableBase | undefined;
}

function getFakeItemFactory(info: UpgradeableInfo): RegistrableItem['fakeItem'] {
	if (FarmingAccessory.isValid({ skyblockId: info.skyblockId })) {
		return (i, options) => FarmingAccessory.fakeItem(i, options);
	}
	if (FarmingArmor.isValid({ skyblockId: info.skyblockId })) {
		return (i, options) => FarmingArmor.fakeItem(i, options);
	}
	if (FarmingEquipment.isValid({ skyblockId: info.skyblockId })) {
		return (i, options) => FarmingEquipment.fakeItem(i, options);
	}
	return (i, options) => FarmingTool.fakeItem(i, options);
}

export const ITEM_REGISTRY: ReadonlyMap<string, RegistrableItem> = new Map(
	[...ITEM_INFO_REGISTRY.values()].map((info) => [
		info.skyblockId,
		{
			info,
			fakeItem: getFakeItemFactory(info),
		},
	])
);

export function getFakeItem<T extends UpgradeableBase = UpgradeableBase>(
	skyblockId: string,
	options?: PlayerOptions
): T | undefined {
	const item = ITEM_REGISTRY.get(skyblockId);
	if (!item) return undefined;
	return item.fakeItem(item.info, options) as T | undefined;
}
