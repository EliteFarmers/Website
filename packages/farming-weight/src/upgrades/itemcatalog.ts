import type { UpgradeableInfo } from '../fortune/upgradeable.js';
import { FARMING_ACCESSORIES_INFO } from '../items/accessories.js';
import { FARMING_ARMOR_INFO } from '../items/armor.js';
import { FARMING_EQUIPMENT_INFO } from '../items/equipment.js';
import { FARMING_TOOLS } from '../items/tools.js';

function itemInfoEntries(items: Record<string, UpgradeableInfo | undefined>): [string, UpgradeableInfo][] {
	return Object.values(items)
		.filter((item): item is UpgradeableInfo => item !== undefined)
		.map((item) => [item.skyblockId, item]);
}

export const ITEM_INFO_REGISTRY: ReadonlyMap<string, UpgradeableInfo> = new Map([
	...itemInfoEntries(FARMING_ACCESSORIES_INFO),
	...itemInfoEntries(FARMING_ARMOR_INFO),
	...itemInfoEntries(FARMING_EQUIPMENT_INFO),
	...itemInfoEntries(FARMING_TOOLS),
]);

export function getItemInfo(skyblockId?: string): UpgradeableInfo | undefined {
	if (!skyblockId) return undefined;
	return ITEM_INFO_REGISTRY.get(skyblockId);
}
