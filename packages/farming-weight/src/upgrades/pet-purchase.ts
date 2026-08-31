import { Crop } from '../constants/crops.js';
import { FarmingPets } from '../constants/pets.js';
import { compareRarity } from '../constants/reforge-types.js';
import { Rarity } from '../constants/reforges.js';
import { mergeCost, UpgradeAction, UpgradeCategory, type FortuneUpgrade } from '../constants/upgrades.js';
import { FarmingPet, getFarmingPetId } from '../fortune/farmingpet.js';
import { FARMING_PET_ITEMS, FARMING_PETS } from '../items/pets.js';
import type { FarmingPetType } from '../items/types/pets.js';
import type { FarmingPlayer, UpgradeRateImpact } from '../player/player.js';
import { getRateImpactCoinValue } from '../util/rate-impact-value.js';

const RATE_EPSILON = 1e-7;
export const PET_PRICE_ITEM_ID = 'PET';

export interface PetPurchasePriceBook {
	petPrices: Readonly<Partial<Record<FarmingPets, number>>>;
	heldItemPrices: Readonly<Record<string, number>>;
	itemSellPrices: Readonly<Record<string, number>>;
}

export interface PetPurchaseTarget {
	type: FarmingPets;
	name: string;
	rarity: Rarity;
	level: number;
	petId: string;
	pet: FarmingPetType;
	price: number;
	wiki: string;
}

export interface FortunePetPurchaseRecommendation {
	upgrade: FortuneUpgrade;
	impact: UpgradeRateImpact;
	coinsPerHour: number;
}

export interface FortunePetPurchaseRecommendationInput {
	player: FarmingPlayer;
	crop: Crop;
	blocksPerHour: number;
	prices: PetPurchasePriceBook;
}

interface EvaluatedFortunePurchase extends FortunePetPurchaseRecommendation {
	heldItemId?: string;
	selected: boolean;
	totalCost: number;
}

export function getPetTargetLevel(type: FarmingPets): number {
	return type === FarmingPets.RoseDragon ? 200 : 100;
}

export function getPetTargetRarity(type: FarmingPets): Rarity {
	const info = FARMING_PETS[type];
	if (info.maxRarity) return info.maxRarity;
	const rarityStats = Object.keys(info.perRarityLevelStats ?? {}) as Rarity[];
	if (rarityStats.length > 0) return rarityStats.sort(compareRarity).at(-1)!;
	return Rarity.Legendary;
}

export function getPetPurchaseTarget(
	prices: PetPurchasePriceBook,
	type: FarmingPets,
	usedPetIds: Iterable<string> = []
): PetPurchaseTarget | undefined {
	const info = FARMING_PETS[type];
	const level = getPetTargetLevel(type);
	const rarity = getPetTargetRarity(type);
	const price = prices.petPrices[type];
	if (price === undefined) return;

	const existingIds = new Set(usedPetIds);
	const baseId = `local:pet-purchase:${type.toLowerCase()}`;
	let petId = baseId;
	let suffix = 2;
	while (existingIds.has(petId)) petId = `${baseId}:${suffix++}`;
	const serializedRarity = rarity.toUpperCase();
	const seed = new FarmingPet({ uuid: petId, type, tier: serializedRarity });
	const pet: FarmingPetType = { uuid: petId, type, tier: serializedRarity, exp: seed.getXpForLevel(level) };

	return { type, name: info.name, rarity, level, petId, pet, price, wiki: info.wiki };
}

export function createPetPurchaseUpgrade(
	target: PetPurchaseTarget,
	options: { selected?: boolean; phases?: string[]; heldItemId?: string } = {}
): FortuneUpgrade {
	const selected = options.selected ?? false;
	const phases = options.phases ?? [];
	const petMember: FortuneUpgrade = {
		title: `Level ${target.level} ${target.rarity} ${target.name}`,
		increase: 0,
		action: UpgradeAction.Purchase,
		category: UpgradeCategory.Pet,
		purchase: PET_PRICE_ITEM_ID,
		wiki: target.wiki,
		cost: { coins: target.price },
		conflictKey: `pet-purchase:${target.type}:pet`,
		meta: {
			type: 'buy_pet',
			id: target.type,
			itemUuid: target.petId,
			key: target.rarity.toUpperCase(),
			value: target.level,
			selected,
			phases,
		},
	};
	const members = [petMember];

	if (options.heldItemId) {
		const item = FARMING_PET_ITEMS[options.heldItemId];
		members.push({
			title: item?.name ?? options.heldItemId,
			increase: 0,
			action: UpgradeAction.Apply,
			category: UpgradeCategory.Pet,
			purchase: options.heldItemId,
			wiki: item?.wiki,
			cost: { items: { [options.heldItemId]: 1 } },
			conflictKey: `pet-purchase:${target.type}:item:${options.heldItemId}`,
			meta: { type: 'pet_item', id: options.heldItemId, itemUuid: target.petId },
		});
	}

	const id = `pet-purchase:${target.type}${options.heldItemId ? `:${options.heldItemId}` : ''}`;
	return {
		title: `Buy Level ${target.level} ${target.rarity} ${target.name}`,
		increase: 0,
		action: UpgradeAction.Purchase,
		category: UpgradeCategory.Pet,
		purchase: PET_PRICE_ITEM_ID,
		wiki: target.wiki,
		cost: mergeCost(...members.map((member) => member.cost ?? {})),
		conflictKey: id,
		group: {
			id,
			label: 'Max-Level Pet Setup',
			strategy: 'available-pieces',
			kind: 'pet-purchase',
			atomic: true,
			warning: options.heldItemId
				? `Includes a new pet with ${FARMING_PET_ITEMS[options.heldItemId]?.name ?? options.heldItemId}; owned pets stay unchanged.`
				: 'Includes the max-level pet used for this recommendation.',
			memberCount: members.length,
		},
		groupedUpgrades: members,
		meta: { type: 'upgrade_group', id, phases },
	};
}

export function findFortunePetPurchaseRecommendations(
	input: FortunePetPurchaseRecommendationInput
): FortunePetPurchaseRecommendation[] {
	if (!input.crop || input.blocksPerHour <= 0) return [];
	const before = input.player.getRates(input.crop, input.blocksPerHour);
	const ownedIds = input.player.pets.map((pet) => getFarmingPetId(pet)).filter((id): id is string => !!id);
	const recommendations: FortunePetPurchaseRecommendation[] = [];
	const starterProfile = input.player.pets.length === 0;
	const petTypes = starterProfile ? [FarmingPets.MooshroomCow] : Object.values(FarmingPets);

	for (const type of petTypes) {
		const level = getPetTargetLevel(type);
		const rarity = getPetTargetRarity(type);
		if (
			input.player.pets.some(
				(pet) => pet.type === type && pet.level >= level && compareRarity(pet.rarity, rarity) >= 0
			)
		) {
			continue;
		}

		const target = getPetPurchaseTarget(input.prices, type, ownedIds);
		if (!target) continue;
		const bareCandidates = [false, true].map((selected) =>
			evaluateFortunePurchase(input, before, target, selected)
		);
		const bestBare = bareCandidates
			.filter((candidate) => candidate.coinsPerHour > RATE_EPSILON)
			.sort(comparePurchases)[0];
		if (bestBare) {
			recommendations.push(bestBare);
			continue;
		}

		const heldItemCandidates: EvaluatedFortunePurchase[] = [];
		for (const heldItemId of Object.keys(FARMING_PET_ITEMS).sort()) {
			const itemCost = input.prices.heldItemPrices[heldItemId] ?? 0;
			if (itemCost <= 0) continue;
			for (const selected of [false, true]) {
				const candidate = evaluateFortunePurchase(input, before, target, selected, heldItemId);
				heldItemCandidates.push(candidate);
			}
		}
		const best = heldItemCandidates
			.filter((candidate) => candidate.coinsPerHour > RATE_EPSILON)
			.sort(comparePurchases)[0];
		if (best) recommendations.push(best);
	}

	return recommendations;
}

function evaluateFortunePurchase(
	input: FortunePetPurchaseRecommendationInput,
	before: ReturnType<FarmingPlayer['getRates']>,
	target: PetPurchaseTarget,
	selected: boolean,
	heldItemId?: string
): EvaluatedFortunePurchase {
	const upgrade = createPetPurchaseUpgrade(target, { selected, heldItemId });
	const impact = input.player.getUpgradeRateImpact(upgrade, {
		crop: input.crop,
		blocksBroken: input.blocksPerHour,
		before,
	});
	const coinsPerHour = getRateImpactCoinValue(
		impact,
		(itemId) => input.prices.itemSellPrices[itemId] ?? 0,
		input.crop
	);
	const totalCost = getPetPurchaseUpgradeCost(upgrade, input.prices);
	impact.valuationDelta = {
		complete: true,
		coinsPerCycle: coinsPerHour,
		coinsPerInterval: coinsPerHour,
		coinsPerHour,
		costPerCoinsPerHour: coinsPerHour > 0 ? totalCost / coinsPerHour : undefined,
		missingItemIds: [],
	};
	return {
		upgrade,
		impact,
		coinsPerHour,
		heldItemId,
		selected,
		totalCost,
	};
}

export function getPetPurchaseUpgradeCost(upgrade: FortuneUpgrade, prices: PetPurchasePriceBook): number {
	let total = (upgrade.cost?.coins ?? 0) + (upgrade.cost?.applyCost?.coins ?? 0);
	for (const [itemId, amount] of Object.entries(upgrade.cost?.items ?? {})) {
		total += (prices.heldItemPrices[itemId] ?? 0) * amount;
	}
	for (const [itemId, amount] of Object.entries(upgrade.cost?.applyCost?.items ?? {})) {
		total += (prices.heldItemPrices[itemId] ?? 0) * amount;
	}
	return total;
}

function comparePurchases(a: EvaluatedFortunePurchase, b: EvaluatedFortunePurchase): number {
	const aRatio = a.totalCost / a.coinsPerHour;
	const bRatio = b.totalCost / b.coinsPerHour;
	return (
		aRatio - bRatio ||
		b.coinsPerHour - a.coinsPerHour ||
		Number(a.selected) - Number(b.selected) ||
		(a.heldItemId ?? '').localeCompare(b.heldItemId ?? '')
	);
}
