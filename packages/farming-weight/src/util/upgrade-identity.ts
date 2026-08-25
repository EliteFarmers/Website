import type { FortuneUpgrade } from '../constants/upgrades.js';

export function getFortuneUpgradeIdentity(upgrade: FortuneUpgrade): string {
	return (
		upgrade.conflictKey ??
		[
			upgrade.title,
			upgrade.action,
			upgrade.meta?.type ?? '',
			upgrade.meta?.id ?? '',
			upgrade.meta?.key ?? '',
			upgrade.meta?.itemUuid ?? '',
			upgrade.onto?.slot ?? '',
		].join(':')
	);
}
