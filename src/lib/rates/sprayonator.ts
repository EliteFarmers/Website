import type { FarmingInventoryDto } from '$lib/api';
import { getBestSprayonatorTier, SPRAYONATOR_TIER_INFO, SprayonatorTier } from 'farming-weight';

export type SprayonatorTierSetting = SprayonatorTier | 'auto';

export function resolveSprayonatorTier(
	setting: SprayonatorTierSetting | undefined,
	inventory: FarmingInventoryDto | null | undefined
): SprayonatorTier {
	if (setting && setting !== 'auto') return setting;
	return getBestSprayonatorTier(inventory?.sprayonators?.map((item) => item.skyblockId) ?? []);
}

export function getSprayonatorTierOptions(
	inventory: FarmingInventoryDto | null | undefined
): { value: SprayonatorTierSetting; label: string }[] {
	const best = SPRAYONATOR_TIER_INFO[resolveSprayonatorTier('auto', inventory)];
	return [
		{ value: 'auto', label: `Auto (${best.name})` },
		...Object.values(SprayonatorTier).map((tier) => ({ value: tier, label: SPRAYONATOR_TIER_INFO[tier].name })),
	];
}
