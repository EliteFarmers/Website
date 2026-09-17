import { expect, test } from 'vitest';
import { Crop } from '../constants/crops.js';
import { FarmingPets } from '../constants/pets.js';
import { FarmingPlayer } from '../player/player.js';
import {
	createPetPurchaseUpgrade,
	findFortunePetPurchaseRecommendations,
	getPetPurchaseTarget,
	type PetPurchasePriceBook,
} from './pet-purchase.js';

const prices: PetPurchasePriceBook = {
	petPrices: { [FarmingPets.Pig]: 100, [FarmingPets.Elephant]: 100 },
	heldItemPrices: { FLYING_PIG: 1 },
	itemSellPrices: { POTATO_ITEM: 3 },
};

test('Flying Pig purchase bundles only accept Pig pets', () => {
	const pig = getPetPurchaseTarget(prices, FarmingPets.Pig)!;
	const elephant = getPetPurchaseTarget(prices, FarmingPets.Elephant)!;

	expect(createPetPurchaseUpgrade(pig, { heldItemId: 'FLYING_PIG' }).groupedUpgrades).toEqual(
		expect.arrayContaining([expect.objectContaining({ purchase: 'FLYING_PIG' })])
	);
	expect(() => createPetPurchaseUpgrade(elephant, { heldItemId: 'FLYING_PIG' })).toThrow(
		'Pet item FLYING_PIG cannot be applied to ELEPHANT'
	);
});

test('potato pet purchase recommendations only bundle Flying Pig with Pig', () => {
	const player = new FarmingPlayer({
		pets: [{ uuid: 'owned-rabbit', type: FarmingPets.Rabbit, tier: 'LEGENDARY', exp: 30_000_000_000 }],
	});
	const recommendations = findFortunePetPurchaseRecommendations({
		player,
		crop: Crop.Potato,
		blocksPerHour: 72_000,
		prices,
	});
	const pig = recommendations.find((entry) => entry.upgrade.meta?.id?.startsWith('pet-purchase:PIG'));
	const elephant = recommendations.find((entry) => entry.upgrade.meta?.id?.startsWith('pet-purchase:ELEPHANT'));

	expect(pig).toBeDefined();
	expect(elephant).toBeDefined();
	expect(pig?.upgrade.groupedUpgrades?.some((upgrade) => upgrade.purchase === 'FLYING_PIG')).toBe(true);
	expect(elephant?.upgrade.groupedUpgrades?.some((upgrade) => upgrade.purchase === 'FLYING_PIG')).toBe(false);
});
