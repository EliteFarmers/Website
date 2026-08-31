import type { RatesItemPriceData } from '$lib/api/elite';
import {
	createPestFarmingPlayer,
	Crop,
	DEFAULT_PEST_CYCLE_SETTINGS,
	FarmingPets,
	FarmingPlayer,
	getFarmingPetId,
	PestFarmingRateCalculator,
	PestFarmingPhase,
	Rarity,
	Stat,
} from 'farming-weight';
import { describe, expect, test } from 'vitest';
import {
	createPetPurchaseUpgrade,
	findFortunePetPurchaseRecommendations,
	getMaxLevelPetPrice,
	getPetPurchaseTarget,
} from './pet-purchase';
import { findPestPetPurchaseRecommendations } from './pest-pet-purchase';

function auction(
	pet: FarmingPets,
	rarity: Rarity,
	min: number,
	max: number,
	lowest: number,
	last = lowest
): NonNullable<RatesItemPriceData[string]['auctions']>[number] {
	return {
		skyblockId: 'PET',
		variantKey: `${pet}:${rarity}:${min}-${max}`,
		variedBy: { pet, rarity: rarity.toUpperCase(), petLevel: { key: String(max), min, max } },
		lowest,
		lowestVolume: 1,
		lowest3Day: lowest,
		lowest3DayVolume: 1,
		lowest7Day: lowest,
		lowest7DayVolume: 1,
		last,
		rawLowest: lowest,
		calculatedAt: '',
	};
}

const ownedRabbit = {
	uuid: 'owned-rabbit',
	type: FarmingPets.Rabbit,
	tier: 'LEGENDARY',
	exp: 18_867_000,
};

describe('max-level pet purchases', () => {
	test('uses the exact Rose Dragon level 200 bucket and never the level 100 bucket', () => {
		const items: RatesItemPriceData = {
			PET: {
				auctions: [
					auction(FarmingPets.RoseDragon, Rarity.Legendary, 100, 199, 10),
					auction(FarmingPets.RoseDragon, Rarity.Legendary, 200, 200, 25),
				],
			},
		};

		expect(getMaxLevelPetPrice(items, FarmingPets.RoseDragon, Rarity.Legendary, 200)).toBe(25);
	});

	test('falls back to the last exact-variation price when no current lowest exists', () => {
		const items: RatesItemPriceData = {
			PET: { auctions: [auction(FarmingPets.MooshroomCow, Rarity.Legendary, 100, 100, 0, 42)] },
		};

		expect(getMaxLevelPetPrice(items, FarmingPets.MooshroomCow, Rarity.Legendary, 100)).toBe(42);
	});

	test('applies an atomic level 200 pet and held item to a normal player', () => {
		const items: RatesItemPriceData = {
			PET: { auctions: [auction(FarmingPets.RoseDragon, Rarity.Legendary, 200, 200, 25)] },
		};
		const target = getPetPurchaseTarget(items, FarmingPets.RoseDragon)!;
		const player = new FarmingPlayer({ pets: [] });

		player.applyUpgrade(createPetPurchaseUpgrade(target, { selected: true, heldItemId: 'GREEN_BANDANA' }));

		expect(player.selectedPet?.type).toBe(FarmingPets.RoseDragon);
		expect(player.selectedPet?.level).toBe(200);
		expect(player.selectedPet?.pet.heldItem).toBe('GREEN_BANDANA');
	});

	test('pet-item upgrades work for pets identified only by Hypixel localId', () => {
		const player = new FarmingPlayer({
			pets: [{ localId: 'hypixel-pet-1', type: FarmingPets.Mosquito, tier: 'LEGENDARY', exp: 18_867_000 }],
		});
		const upgrade = player.selectedPet
			?.getUpgrades({ stats: [Stat.FarmingFortune] }, player)
			.find((candidate) => candidate.meta?.type === 'pet_item');

		expect(upgrade).toBeDefined();
		player.applyUpgrade(upgrade!);

		expect(upgrade?.meta?.itemUuid).toBe('hypixel-pet-1');
		expect(player.selectedPet?.pet.heldItem).toBe('YELLOW_BANDANA');
	});

	test('assigns a purchased pet only to the requested pest phases', () => {
		const items: RatesItemPriceData = {
			PET: { auctions: [auction(FarmingPets.MooshroomCow, Rarity.Legendary, 100, 100, 25)] },
		};
		const target = getPetPurchaseTarget(items, FarmingPets.MooshroomCow)!;
		const player = createPestFarmingPlayer({ pets: [] });

		player.applyPhaseUpgrade(
			PestFarmingPhase.Farm,
			createPetPurchaseUpgrade(target, { phases: [PestFarmingPhase.Farm, PestFarmingPhase.Kill] })
		);

		expect(player.phaseLoadouts[PestFarmingPhase.Farm].petId).toBe(target.petId);
		expect(player.phaseLoadouts[PestFarmingPhase.Kill].petId).toBe(target.petId);
		expect(player.phaseLoadouts[PestFarmingPhase.Spawn].petId).not.toBe(target.petId);
	});

	test('recommends a bare max-level pet when it improves normal farming profit', () => {
		const items = {
			PET: { auctions: [auction(FarmingPets.Elephant, Rarity.Mythic, 100, 100, 25)] },
			[Crop.Wheat]: { item: { npc_sell_price: 6 } },
		} as unknown as RatesItemPriceData;
		const recommendations = findFortunePetPurchaseRecommendations({
			player: new FarmingPlayer({ pets: [ownedRabbit] }),
			crop: Crop.Wheat,
			blocksPerHour: 72_000,
			items,
		});

		expect(recommendations).toHaveLength(1);
		expect(recommendations[0]?.upgrade.title).toBe('Buy Level 100 Mythic Elephant');
		expect(recommendations[0]?.upgrade.groupedUpgrades).toHaveLength(1);
		expect(recommendations[0]?.coinsPerHour).toBeGreaterThan(0);
	});

	test('does not recommend a max-level pet the player already owns at the target rarity', () => {
		const items = {
			PET: { auctions: [auction(FarmingPets.Elephant, Rarity.Mythic, 100, 100, 25)] },
			[Crop.Wheat]: { item: { npc_sell_price: 6 } },
		} as unknown as RatesItemPriceData;
		const target = getPetPurchaseTarget(items, FarmingPets.Elephant)!;
		const recommendations = findFortunePetPurchaseRecommendations({
			player: new FarmingPlayer({ pets: [target.pet] }),
			crop: Crop.Wheat,
			blocksPerHour: 72_000,
			items,
		});

		expect(recommendations).toEqual([]);
	});

	test('bundles a priced held item when the bare pet does not improve rates', () => {
		const items = {
			PET: { auctions: [auction(FarmingPets.Mosquito, Rarity.Legendary, 100, 100, 25)] },
			[Crop.Wheat]: { item: { npc_sell_price: 6 } },
			YELLOW_BANDANA: {
				item: { name: 'Yellow Bandana' },
				auctions: [auction(FarmingPets.Mosquito, Rarity.Legendary, 1, 1, 10)],
			},
		} as unknown as RatesItemPriceData;
		const recommendations = findFortunePetPurchaseRecommendations({
			player: new FarmingPlayer({ pets: [ownedRabbit] }),
			crop: Crop.Wheat,
			blocksPerHour: 72_000,
			items,
		});

		expect(recommendations).toHaveLength(1);
		expect(recommendations[0]?.upgrade.groupedUpgrades?.map((upgrade) => upgrade.meta?.type)).toStrictEqual([
			'buy_pet',
			'pet_item',
		]);
		expect(recommendations[0]?.upgrade.groupedUpgrades?.[1]?.purchase).toBe('YELLOW_BANDANA');
	});

	test('does not bundle a held item when the bare pet is already profitable', () => {
		const items = {
			PET: { auctions: [auction(FarmingPets.Elephant, Rarity.Mythic, 100, 100, 25)] },
			[Crop.Wheat]: { item: { npc_sell_price: 6 } },
			YELLOW_BANDANA: {
				item: { name: 'Yellow Bandana' },
				auctions: [auction(FarmingPets.Elephant, Rarity.Mythic, 1, 1, 1)],
			},
		} as unknown as RatesItemPriceData;
		const recommendations = findFortunePetPurchaseRecommendations({
			player: new FarmingPlayer({ pets: [ownedRabbit] }),
			crop: Crop.Wheat,
			blocksPerHour: 72_000,
			items,
		});

		expect(recommendations).toHaveLength(1);
		expect(recommendations[0]?.upgrade.groupedUpgrades?.map((upgrade) => upgrade.meta?.type)).toStrictEqual([
			'buy_pet',
		]);
	});

	test('focuses a starter fortune profile on a bare Mooshroom Cow when it is already profitable', () => {
		const items = {
			PET: {
				auctions: [
					auction(FarmingPets.MooshroomCow, Rarity.Legendary, 100, 100, 25),
					auction(FarmingPets.Elephant, Rarity.Mythic, 100, 100, 25),
				],
			},
			[Crop.Wheat]: { item: { npc_sell_price: 6 } },
			YELLOW_BANDANA: {
				item: { name: 'Yellow Bandana' },
				auctions: [auction(FarmingPets.MooshroomCow, Rarity.Legendary, 1, 1, 1)],
			},
		} as unknown as RatesItemPriceData;
		const player = new FarmingPlayer({ farmingLevel: 1, pets: [] });
		const recommendations = findFortunePetPurchaseRecommendations({
			player,
			crop: Crop.Wheat,
			blocksPerHour: 72_000,
			items,
		});

		expect(recommendations).toHaveLength(1);
		expect(recommendations[0]?.upgrade.title).toBe('Buy Level 100 Legendary Mooshroom Cow');
		expect(recommendations[0]?.upgrade.groupedUpgrades?.map((upgrade) => upgrade.meta?.type)).toStrictEqual([
			'buy_pet',
		]);
		const tree = player.expandUpgrade(recommendations[0]!.upgrade, {
			stats: [Stat.FarmingFortune],
			maxDepth: 1,
		});
		const heldItemUpgrade = tree.children.find(
			(child) => child.upgrade.meta?.type === 'pet_item' && child.upgrade.purchase === 'YELLOW_BANDANA'
		);
		expect(heldItemUpgrade?.upgrade.purchase).toBe('YELLOW_BANDANA');
		expect(heldItemUpgrade?.statsGained[Stat.FarmingFortune]).toBeGreaterThan(0);
	});

	test('evaluates pest purchases against full-cycle profit and assigns profitable phases', async () => {
		const items: RatesItemPriceData = {
			PET: { auctions: [auction(FarmingPets.Elephant, Rarity.Mythic, 100, 100, 25)] },
		};
		const player = createPestFarmingPlayer({ pets: [ownedRabbit] });
		const options = { crop: Crop.Wheat, cycle: DEFAULT_PEST_CYCLE_SETTINGS };
		const priceBook = {
			version: 'pet-purchase-test',
			missingItemMode: 'zero' as const,
			items: { [Crop.Wheat]: { coins: 6, source: 'npc' as const } },
		};
		const before = new PestFarmingRateCalculator({ player, options, priceBook }).calculate();
		const target = getPetPurchaseTarget(items, FarmingPets.Elephant)!;
		const manual = player.clone();
		manual.applyPhaseUpgrade(
			PestFarmingPhase.Farm,
			createPetPurchaseUpgrade(target, { phases: [PestFarmingPhase.Farm] })
		);
		const manualAfter = new PestFarmingRateCalculator({ player: manual, options, priceBook }).calculate();
		expect(manual.phaseLoadouts[PestFarmingPhase.Farm].petId).toBe(target.petId);
		expect(manual.crop.selectedPet?.type).toBe(FarmingPets.Elephant);
		expect(manual.crop.selectedPet?.rarity).toBe(Rarity.Mythic);
		expect(manual.crop.selectedPet?.level).toBe(100);
		expect(manual.crop.selectedPet?.getFortune()).toBeGreaterThan(0);
		expect(manual.crop.fortune).toBeGreaterThan(player.crop.fortune);

		const recommendations = await findPestPetPurchaseRecommendations({
			player,
			options,
			priceBook,
			before,
			items,
		});

		expect(manualAfter.valuation.coinsPerHour).toBeGreaterThan(before.valuation.coinsPerHour);
		expect(recommendations).toHaveLength(1);
		expect(recommendations[0]?.impact.valuationDelta.coinsPerHour).toBeGreaterThan(0);
		expect(recommendations[0]?.phases).toContain(PestFarmingPhase.Farm);
	});

	test('focuses a starter pest profile on one bare Mooshroom Cow when it is already profitable', async () => {
		const items = {
			PET: {
				auctions: [
					auction(FarmingPets.MooshroomCow, Rarity.Legendary, 100, 100, 25),
					auction(FarmingPets.Elephant, Rarity.Mythic, 100, 100, 25),
				],
			},
			YELLOW_BANDANA: {
				item: { name: 'Yellow Bandana' },
				auctions: [auction(FarmingPets.MooshroomCow, Rarity.Legendary, 1, 1, 1)],
			},
		} as unknown as RatesItemPriceData;
		const player = createPestFarmingPlayer({ farmingLevel: 1, pets: [] });
		const options = { crop: Crop.Wheat, cycle: DEFAULT_PEST_CYCLE_SETTINGS };
		const priceBook = {
			version: 'starter-pet-purchase-test',
			missingItemMode: 'zero' as const,
			items: { [Crop.Wheat]: { coins: 6, source: 'npc' as const } },
		};
		const before = new PestFarmingRateCalculator({ player, options, priceBook }).calculate();

		const recommendations = await findPestPetPurchaseRecommendations({
			player,
			options,
			priceBook,
			before,
			items,
		});

		expect(recommendations).toHaveLength(1);
		expect(recommendations[0]?.upgrade.title).toBe('Buy Level 100 Legendary Mooshroom Cow');
		expect(recommendations[0]?.upgrade.groupedUpgrades?.map((upgrade) => upgrade.meta?.type)).toStrictEqual([
			'buy_pet',
		]);
		const tree = player.expandPhaseUpgrade(recommendations[0]!.primaryPhase, recommendations[0]!.upgrade, {
			stats: [Stat.FarmingFortune],
			crop: Crop.Wheat,
			maxDepth: 1,
		});
		const heldItemUpgrade = tree.children.find(
			(child) => child.upgrade.meta?.type === 'pet_item' && child.upgrade.purchase === 'YELLOW_BANDANA'
		);
		expect(heldItemUpgrade?.upgrade.purchase).toBe('YELLOW_BANDANA');
		expect(heldItemUpgrade?.statsGained[Stat.FarmingFortune]).toBeGreaterThan(0);
	});

	test('keeps better held items in the normal upgrade lists for owned pets', () => {
		const items = {
			PET: { auctions: [auction(FarmingPets.MooshroomCow, Rarity.Legendary, 100, 100, 25)] },
		} as unknown as RatesItemPriceData;
		const target = getPetPurchaseTarget(items, FarmingPets.MooshroomCow)!;
		const player = new FarmingPlayer({ pets: [target.pet] });

		const upgrades = player.getPetProgress([Stat.FarmingFortune]).flatMap((progress) => progress.upgrades ?? []);

		expect(
			upgrades.some((upgrade) => upgrade.meta?.type === 'pet_item' && upgrade.purchase === 'YELLOW_BANDANA')
		).toBe(true);

		const pestPlayer = createPestFarmingPlayer({ pets: [target.pet] });
		pestPlayer.setPhasePet(PestFarmingPhase.Farm, target.petId);
		const pestUpgrades = pestPlayer.getPhaseUpgrades(PestFarmingPhase.Farm, {
			stats: [Stat.FarmingFortune],
		});
		expect(
			pestUpgrades.some(
				(upgrade) => upgrade.meta?.type === 'pet_item' && (upgrade.stats?.[Stat.FarmingFortune] ?? 0) > 0
			)
		).toBe(true);
	});

	test('recommends a separate copy when an owned pet needs a different held item in spawn', async () => {
		const items = {
			PET: { auctions: [auction(FarmingPets.MooshroomCow, Rarity.Legendary, 100, 100, 25)] },
			BROWN_BANDANA: {
				item: { name: 'Brown Bandana' },
				auctions: [auction(FarmingPets.MooshroomCow, Rarity.Legendary, 1, 1, 10)],
			},
		} as unknown as RatesItemPriceData;
		const owned = getPetPurchaseTarget(items, FarmingPets.MooshroomCow)!;
		const player = createPestFarmingPlayer({
			pets: [{ ...owned.pet, heldItem: 'GREEN_BANDANA' }],
			gardenLevel: 100,
			bestiaryKills: Object.fromEntries(
				[
					'beetle',
					'cricket',
					'dragonfly',
					'firefly',
					'fly',
					'locust',
					'mantis',
					'mite',
					'mosquito',
					'moth',
					'rat',
					'slug',
					'worm',
				].map((pest) => [`pest_${pest}_1`, 250])
			),
			phaseLoadouts: {
				[PestFarmingPhase.Farm]: { petId: owned.petId },
				[PestFarmingPhase.Spawn]: { petId: owned.petId },
				[PestFarmingPhase.Kill]: { petId: owned.petId },
			},
		});
		const options = {
			crop: Crop.Wheat,
			cycle: { ...DEFAULT_PEST_CYCLE_SETTINGS, farmSwapBeforeCooldownSeconds: 0 },
		};
		const priceBook = {
			version: 'second-pet-test',
			missingItemMode: 'zero' as const,
			items: {
				[Crop.Wheat]: { coins: 6, source: 'npc' as const },
				ENCHANTED_WHEAT: { coins: 1_000_000, source: 'manual' as const },
			},
		};
		const before = new PestFarmingRateCalculator({ player, options, priceBook }).calculate();
		const duplicate = getPetPurchaseTarget(items, FarmingPets.MooshroomCow, [owned.petId])!;
		const manual = player.clone();
		manual.applyPhaseUpgrade(
			PestFarmingPhase.Spawn,
			createPetPurchaseUpgrade(duplicate, {
				phases: [PestFarmingPhase.Spawn],
				heldItemId: 'BROWN_BANDANA',
			})
		);
		const manualAfter = new PestFarmingRateCalculator({ player: manual, options, priceBook }).calculate();
		expect(manualAfter.valuation.coinsPerHour).toBeGreaterThan(before.valuation.coinsPerHour);

		const recommendations = await findPestPetPurchaseRecommendations({
			player,
			options,
			priceBook,
			before,
			items,
		});

		expect(recommendations).toHaveLength(1);
		expect(recommendations[0]?.upgrade.title).toBe('Buy Level 100 Legendary Mooshroom Cow');
		expect(recommendations[0]?.upgrade.groupedUpgrades?.[1]?.meta?.id).toBe('BROWN_BANDANA');
		expect(recommendations[0]?.phases).toEqual([PestFarmingPhase.Spawn]);
		expect(recommendations[0]?.player.getOwnedPets()).toHaveLength(2);
		expect(
			recommendations[0]?.player.getOwnedPets().find((pet) => getFarmingPetId(pet) === owned.petId)?.pet.heldItem
		).toBe('GREEN_BANDANA');
	});

	test('assigns competing pet purchases to disjoint phases', async () => {
		const items = {
			PET: {
				auctions: [
					auction(FarmingPets.RoseDragon, Rarity.Legendary, 200, 200, 100),
					auction(FarmingPets.Slug, Rarity.Legendary, 100, 100, 10),
				],
			},
		} as unknown as RatesItemPriceData;
		const player = createPestFarmingPlayer({
			pets: [ownedRabbit],
			gardenLevel: 100,
			farmingLevel: 60,
			strength: 1_600,
		});
		const options = { crop: Crop.Wheat, cycle: DEFAULT_PEST_CYCLE_SETTINGS };
		const priceBook = {
			version: 'overlapping-pet-purchases',
			missingItemMode: 'zero' as const,
			items: {
				[Crop.Wheat]: { coins: 6, source: 'npc' as const },
				ENCHANTED_WHEAT: { coins: 1_000_000, source: 'manual' as const },
			},
		};
		const before = new PestFarmingRateCalculator({ player, options, priceBook }).calculate();

		const recommendations = await findPestPetPurchaseRecommendations({
			player,
			options,
			priceBook,
			before,
			items,
		});
		const roseDragon = recommendations.find((recommendation) =>
			recommendation.upgrade.title.includes('Rose Dragon')
		);
		const slug = recommendations.find((recommendation) => recommendation.upgrade.title.includes('Slug'));

		expect(slug?.phases).toEqual([PestFarmingPhase.Spawn]);
		expect(roseDragon?.phases).toContain(PestFarmingPhase.Farm);
		expect(roseDragon?.phases).not.toContain(PestFarmingPhase.Spawn);
		expect(roseDragon).toBeDefined();
		const roseDragonTree = player.expandPhaseUpgrade(roseDragon!.primaryPhase, roseDragon!.upgrade, {
			stats: [Stat.FarmingFortune],
			crop: Crop.Wheat,
			maxDepth: 1,
		});
		expect(
			roseDragonTree.children.some(
				(child) => child.upgrade.meta?.type === 'pet_item' && child.upgrade.purchase === 'GREEN_BANDANA'
			)
		).toBe(true);
		for (const [index, recommendation] of recommendations.entries()) {
			const laterPhases = recommendations.slice(index + 1).flatMap((candidate) => candidate.phases);
			expect(recommendation.phases.some((phase) => laterPhases.includes(phase))).toBe(false);
		}
	});

	test('prefers the strongest pet for a contested phase over the cheapest payoff', async () => {
		const items = {
			PET: {
				auctions: [
					auction(FarmingPets.Rabbit, Rarity.Mythic, 100, 100, 1),
					auction(FarmingPets.Slug, Rarity.Legendary, 100, 100, 1_000_000),
					auction(FarmingPets.Mosquito, Rarity.Legendary, 100, 100, 1_000_000_000),
				],
			},
			BROWN_BANDANA: {
				item: { name: 'Brown Bandana' },
				auctions: [auction(FarmingPets.Rabbit, Rarity.Mythic, 1, 1, 1)],
			},
		} as unknown as RatesItemPriceData;
		const player = createPestFarmingPlayer({
			pets: [ownedRabbit],
			bestiaryKills: Object.fromEntries(
				[
					'beetle',
					'cricket',
					'dragonfly',
					'firefly',
					'fly',
					'locust',
					'mantis',
					'mite',
					'mosquito',
					'moth',
					'rat',
					'slug',
					'worm',
				].map((pest) => [`pest_${pest}_1`, 250])
			),
		});
		const options = { crop: Crop.Wheat, cycle: DEFAULT_PEST_CYCLE_SETTINGS };
		const priceBook = {
			version: 'best-pet-before-payoff',
			missingItemMode: 'zero' as const,
			items: { [Crop.Wheat]: { coins: 6, source: 'npc' as const } },
		};
		const before = new PestFarmingRateCalculator({ player, options, priceBook }).calculate();

		const recommendations = await findPestPetPurchaseRecommendations({
			player,
			options,
			priceBook,
			before,
			items,
		});
		const mosquito = recommendations.find((recommendation) => recommendation.upgrade.title.includes('Mosquito'));
		const slug = recommendations.find((recommendation) => recommendation.upgrade.title.includes('Slug'));
		const rabbit = recommendations.find((recommendation) => recommendation.upgrade.title.includes('Rabbit'));

		expect(mosquito?.phases).toEqual([PestFarmingPhase.Spawn]);
		expect(mosquito?.impact.valuationDelta.coinsPerHour).toBeGreaterThan(0);
		expect(slug).toBeUndefined();
		expect(rabbit).toBeUndefined();
	});
});
