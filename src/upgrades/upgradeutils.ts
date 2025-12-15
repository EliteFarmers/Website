import { Stat } from '../constants/stats.js';
import type { FortuneUpgrade } from '../constants/upgrades.js';

export function getUpgradeDelta(upgrade: FortuneUpgrade, stat: Stat): number {
	if (stat === Stat.FarmingFortune) {
		return upgrade.stats?.[Stat.FarmingFortune] ?? upgrade.increase ?? 0;
	}
	return upgrade.stats?.[stat] ?? 0;
}

export function filterAndSortUpgrades(upgrades: FortuneUpgrade[], options?: { stat?: Stat }): FortuneUpgrade[] {
	const stat = options?.stat ?? Stat.FarmingFortune;
	if (stat === Stat.FarmingFortune) {
		upgrades.sort((a, b) => (b.increase ?? 0) - (a.increase ?? 0));
		return upgrades;
	}
	const filtered = upgrades.filter((u) => getUpgradeDelta(u, stat) !== 0);
	filtered.sort((a, b) => getUpgradeDelta(b, stat) - getUpgradeDelta(a, stat));
	return filtered;
}
