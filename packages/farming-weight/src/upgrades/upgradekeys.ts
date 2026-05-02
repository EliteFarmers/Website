import type { Upgradeable } from '../fortune/upgradeable.js';

export function getItemScopedConflictKey(upgradeable: Upgradeable, key: string): string {
	const itemUuid = upgradeable.item.uuid;
	return itemUuid ? `${key}:${itemUuid}` : `${key}:${upgradeable.item.skyblockId}`;
}
