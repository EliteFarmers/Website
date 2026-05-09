import { CROP_INFO } from '../constants/crops.js';
import { Stat } from '../constants/stats.js';
import { getQueryStats, type FortuneUpgrade, type StatQueryOptions } from '../constants/upgrades.js';

const CROP_FORTUNE_STATS = new Set(Object.values(CROP_INFO).map((c) => c.fortuneType));

export function getUpgradeDelta(upgrade: FortuneUpgrade, stat: Stat): number {
	if (stat === Stat.FarmingFortune) {
		return upgrade.stats?.[Stat.FarmingFortune] ?? upgrade.increase ?? 0;
	}

	// Crop fortune totals include global Farming Fortune.
	// When a caller filters by a crop fortune stat, treat FarmingFortune upgrades
	// as affecting that crop's total as well.
	if (CROP_FORTUNE_STATS.has(stat)) {
		const cropDelta = upgrade.stats?.[stat] ?? 0;
		const farmingDelta = upgrade.stats?.[Stat.FarmingFortune] ?? upgrade.increase ?? 0;
		return cropDelta + farmingDelta;
	}
	return upgrade.stats?.[stat] ?? 0;
}

function upgradeHasRelatedEffect(upgrade: FortuneUpgrade, stats: readonly Stat[]): boolean {
	return (
		upgrade.effects?.some((effect) => effect.relatedStats?.some((related) => stats.includes(related))) ?? false
	);
}

function getUpgradeScore(upgrade: FortuneUpgrade, stats: readonly Stat[]): number {
	return stats.reduce((sum, stat) => sum + getUpgradeDelta(upgrade, stat), 0);
}

export function filterAndSortUpgrades(upgrades: FortuneUpgrade[], options?: StatQueryOptions): FortuneUpgrade[] {
	const stats = getQueryStats(options);
	const primaryStat = stats[0] ?? Stat.FarmingFortune;
	const explicitMultiStat = options?.stats !== undefined && options.stats.length > 0;

	if (!explicitMultiStat && primaryStat === Stat.FarmingFortune) {
		upgrades.sort((a, b) => (b.increase ?? 0) - (a.increase ?? 0));
		return upgrades;
	}

	const filtered = upgrades.filter((u) => {
		if (stats.some((stat) => getUpgradeDelta(u, stat) !== 0)) return true;
		if (upgradeHasRelatedEffect(u, stats)) return true;
		// For crop-fortune views, keep 0-delta FarmingFortune upgrades so the UI can
		// still show upgrade trees (e.g. Dedication) when milestones/context are missing.
		if (
			stats.some((stat) => CROP_FORTUNE_STATS.has(stat)) &&
			u.stats &&
			Object.hasOwn(u.stats, Stat.FarmingFortune)
		) {
			return true;
		}
		return false;
	});
	filtered.sort((a, b) => {
		const primaryDelta = getUpgradeDelta(b, primaryStat) - getUpgradeDelta(a, primaryStat);
		if (primaryDelta !== 0) return primaryDelta;
		return getUpgradeScore(b, stats) - getUpgradeScore(a, stats);
	});
	return filtered;
}
