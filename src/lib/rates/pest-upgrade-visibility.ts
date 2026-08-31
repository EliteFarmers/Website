import type { FortuneUpgrade, PestFarmingUpgradeRateImpact } from 'farming-weight';

const RATE_EPSILON = 0.01;

export function shouldDisplayPestUpgrade(
	upgrade: FortuneUpgrade,
	impact: PestFarmingUpgradeRateImpact | undefined
): boolean {
	if (!impact) return upgrade.meta?.type !== 'pet_item';

	const coinsPerHour = impact.valuationDelta.coinsPerHour;
	if (!Number.isFinite(coinsPerHour)) return false;
	if (upgrade.meta?.type === 'pet_item') {
		return impact.valuationDelta.complete && coinsPerHour > RATE_EPSILON;
	}
	return coinsPerHour >= -RATE_EPSILON;
}
