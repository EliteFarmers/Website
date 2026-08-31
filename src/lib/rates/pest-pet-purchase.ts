import type { RatesItemPriceData } from '$lib/api/elite';
import {
	findPestPetPurchaseRecommendations as findPackagePestPetPurchaseRecommendations,
	type PestPetPurchaseRecommendation,
	type PestPetPurchaseRecommendationInput as PackagePestPetPurchaseRecommendationInput,
} from 'farming-weight';
import { createPetPurchasePriceBook } from './pet-purchase';

export type { PestPetPurchaseRecommendation } from 'farming-weight';

export interface PestPetPurchaseRecommendationInput extends Omit<PackagePestPetPurchaseRecommendationInput, 'prices'> {
	items: RatesItemPriceData;
}

export function findPestPetPurchaseRecommendations(
	input: PestPetPurchaseRecommendationInput
): Promise<PestPetPurchaseRecommendation[]> {
	const { items, ...recommendationInput } = input;
	return findPackagePestPetPurchaseRecommendations({
		...recommendationInput,
		prices: createPetPurchasePriceBook(items),
	});
}
