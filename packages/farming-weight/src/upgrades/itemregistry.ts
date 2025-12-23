import type { UpgradeableInfo } from '../fortune/upgradeable.js';
import type { UpgradeableBase } from '../fortune/upgradeablebase.js';
import type { PlayerOptions } from '../player/playeroptions.js';

interface RegistrableItem {
	info: UpgradeableInfo;
	fakeItem: (info: UpgradeableInfo, options?: PlayerOptions) => UpgradeableBase | undefined;
}

export const ITEM_REGISTRY = new Map<string, RegistrableItem>();

export function registerItem(item: RegistrableItem) {
	ITEM_REGISTRY.set(item.info.skyblockId, item);
}

export function getFakeItem<T extends UpgradeableBase = UpgradeableBase>(
	skyblockId: string,
	options?: PlayerOptions
): T | undefined {
	const item = ITEM_REGISTRY.get(skyblockId);
	if (!item) return undefined;
	return item.fakeItem(item.info, options) as T | undefined;
}
