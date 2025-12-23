import { CROP_INFO } from '../constants/crops.js';
import { Stat } from '../constants/stats.js';
import type { FortuneUpgrade } from '../constants/upgrades.js';

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

export function filterAndSortUpgrades(upgrades: FortuneUpgrade[], options?: { stat?: Stat }): FortuneUpgrade[] {
	const stat = options?.stat ?? Stat.FarmingFortune;
	if (stat === Stat.FarmingFortune) {
		upgrades.sort((a, b) => (b.increase ?? 0) - (a.increase ?? 0));
		return upgrades;
	}
	const filtered = upgrades.filter((u) => {
		const delta = getUpgradeDelta(u, stat);
		if (delta !== 0) return true;
		// For crop-fortune views, keep 0-delta FarmingFortune upgrades so the UI can
		// still show upgrade trees (e.g. Dedication) when milestones/context are missing.
		if (CROP_FORTUNE_STATS.has(stat) && u.stats && Object.hasOwn(u.stats, Stat.FarmingFortune)) {
			return true;
		}
		return false;
	});
	filtered.sort((a, b) => getUpgradeDelta(b, stat) - getUpgradeDelta(a, stat));
	return filtered;
}
