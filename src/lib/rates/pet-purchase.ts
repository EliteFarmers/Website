import type { RatesItemPriceData } from '$lib/api/elite';
import { getUpgradeCost } from '$lib/items';
import {
	FARMING_PET_ITEMS,
	FarmingPets,
	findFortunePetPurchaseRecommendations as findPackageFortunePetPurchaseRecommendations,
	getPetPurchaseTarget as getPackagePetPurchaseTarget,
	getPetTargetLevel,
	getPetTargetRarity,
	PET_PRICE_ITEM_ID,
	type Crop,
	type FarmingPlayer,
	type FortunePetPurchaseRecommendation,
	type PetPurchasePriceBook,
	type PetPurchaseTarget,
	type Rarity,
} from 'farming-weight';
import { getBestItemSellPrice } from './item-sell-price';

export { createPetPurchaseUpgrade } from 'farming-weight';
export type { FortunePetPurchaseRecommendation, PetPurchasePriceBook, PetPurchaseTarget } from 'farming-weight';

export interface FortunePetPurchaseRecommendationInput {
	player: FarmingPlayer;
	crop: Crop;
	blocksPerHour: number;
	items: RatesItemPriceData;
}

export function getMaxLevelPetPrice(
	items: RatesItemPriceData,
	type: FarmingPets,
	rarity: Rarity,
	level: number
): number | undefined {
	const prices = (items[PET_PRICE_ITEM_ID]?.auctions ?? [])
		.filter(
			(auction) =>
				auction.variedBy.pet === type &&
				auction.variedBy.rarity?.toUpperCase() === rarity.toUpperCase() &&
				(auction.variedBy.petLevel?.min ?? Number.POSITIVE_INFINITY) <= level &&
				(auction.variedBy.petLevel?.max ?? Number.NEGATIVE_INFINITY) >= level
		)
		.map((auction) => (auction.lowest > 0 ? auction.lowest : auction.last))
		.filter((price) => price > 0);
	return prices.length > 0 ? Math.min(...prices) : undefined;
}

export function createPetPurchasePriceBook(items: RatesItemPriceData): PetPurchasePriceBook {
	const petPrices: Partial<Record<FarmingPets, number>> = {};
	for (const type of Object.values(FarmingPets)) {
		const price = getMaxLevelPetPrice(items, type, getPetTargetRarity(type), getPetTargetLevel(type));
		if (price !== undefined) petPrices[type] = price;
	}

	const heldItemPrices = Object.fromEntries(
		Object.keys(FARMING_PET_ITEMS).map((itemId) => [itemId, getUpgradeCost({ items: { [itemId]: 1 } }, items)])
	);
	const itemSellPrices = Object.fromEntries(
		Object.entries(items).flatMap(([itemId, item]) => {
			const price = getBestItemSellPrice(item)?.coins;
			return price === undefined ? [] : [[itemId, price]];
		})
	);
	return { petPrices, heldItemPrices, itemSellPrices };
}

export function getPetPurchaseTarget(
	items: RatesItemPriceData,
	type: FarmingPets,
	usedPetIds: Iterable<string> = []
): PetPurchaseTarget | undefined {
	return getPackagePetPurchaseTarget(createPetPurchasePriceBook(items), type, usedPetIds);
}

export function findFortunePetPurchaseRecommendations(
	input: FortunePetPurchaseRecommendationInput
): FortunePetPurchaseRecommendation[] {
	return findPackageFortunePetPurchaseRecommendations({
		player: input.player,
		crop: input.crop,
		blocksPerHour: input.blocksPerHour,
		prices: createPetPurchasePriceBook(input.items),
	});
}
