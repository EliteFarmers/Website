import type { RatesItemPriceData } from '$lib/api/elite';
import { HARVEST_FEAST_MATERIALS, getCropFromName } from 'farming-weight';

export interface HarvestFeastMaterialPrice {
	itemId: string;
	name: string;
	coins?: number;
}

export function getHarvestFeastMaterialId(crop: string): string | undefined {
	const normalizedCrop = getCropFromName(crop);
	return normalizedCrop ? HARVEST_FEAST_MATERIALS[normalizedCrop] : undefined;
}

export function getHarvestFeastMaterialIds(crops: string[]): string[] {
	return [...new Set(crops.map(getHarvestFeastMaterialId).filter((id): id is string => id !== undefined))];
}

export function getHarvestFeastMaterialPrice(
	crop: string,
	prices: RatesItemPriceData | undefined
): HarvestFeastMaterialPrice | undefined {
	const itemId = getHarvestFeastMaterialId(crop);
	if (!itemId) return undefined;

	const item = prices?.[itemId];
	const averageSell = item?.bazaar?.averageSell;

	return {
		itemId,
		name: item?.item?.name ?? item?.bazaar?.name ?? formatIdentifier(itemId),
		coins: averageSell !== undefined && averageSell > 0 ? averageSell : undefined,
	};
}

function formatIdentifier(value: string): string {
	return value
		.replace(/_/g, ' ')
		.toLowerCase()
		.replace(/\b\w/g, (letter) => letter.toUpperCase());
}
