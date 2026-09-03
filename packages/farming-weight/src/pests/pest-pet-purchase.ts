import { FarmingPets } from '../constants/pets.js';
import { compareRarity } from '../constants/reforge-types.js';
import { Stat } from '../constants/stats.js';
import type { FortuneUpgrade } from '../constants/upgrades.js';
import { getFarmingPetId } from '../fortune/farmingpet.js';
import { FARMING_PET_ITEMS } from '../items/pets.js';
import { PEST_FARMING_PHASES, PestFarmingPhase, type PestFarmingPlayer } from '../player/pestfarmingplayer.js';
import {
	createPetPurchaseUpgrade,
	getPetPurchaseTarget,
	getPetPurchaseUpgradeCost,
	getPetTargetLevel,
	getPetTargetRarity,
	type PetPurchasePriceBook,
} from '../upgrades/pet-purchase.js';
import { PestFarmingRateCalculator } from './pest-farming-rate-calculator.js';
import type {
	PestFarmingRateOptions,
	PestFarmingRateResult,
	PestFarmingUpgradeRateImpact,
	PestRatePriceBook,
} from './pest-rate-types.js';

const RATE_EPSILON = 1e-7;

export interface PestPetPurchaseRecommendation {
	upgrade: FortuneUpgrade;
	impact: PestFarmingUpgradeRateImpact;
	player: PestFarmingPlayer;
	phases: PestFarmingPhase[];
	primaryPhase: PestFarmingPhase;
}

export interface PestPetPurchaseRecommendationInput {
	player: PestFarmingPlayer;
	options: PestFarmingRateOptions;
	priceBook: PestRatePriceBook;
	before: PestFarmingRateResult;
	prices: PetPurchasePriceBook;
	shouldCancel?: () => boolean;
	yieldControl?: () => Promise<void>;
}

interface EvaluatedPurchase {
	upgrade: FortuneUpgrade;
	player: PestFarmingPlayer;
	result: PestFarmingRateResult;
	petType: FarmingPets;
	phases: PestFarmingPhase[];
	phaseCoinsPerHour: Partial<Record<PestFarmingPhase, number>>;
	heldItemId?: string;
	totalCost: number;
}

export async function findPestPetPurchaseRecommendations(
	input: PestPetPurchaseRecommendationInput
): Promise<PestPetPurchaseRecommendation[]> {
	const evaluatedPurchases: EvaluatedPurchase[] = [];
	const owned = input.player.getOwnedPets();
	const ownedIds = owned.map((pet) => getFarmingPetId(pet)).filter((id): id is string => !!id);
	const starterProfile = owned.length === 0;
	const petTypes = starterProfile ? [FarmingPets.MooshroomCow] : Object.values(FarmingPets);

	for (const type of petTypes) {
		if (input.shouldCancel?.()) return [];
		const level = getPetTargetLevel(type);
		const rarity = getPetTargetRarity(type);
		const matchingOwnedPets = owned.filter(
			(pet) => pet.type === type && pet.level >= level && compareRarity(pet.rarity, rarity) >= 0
		);
		const target = getPetPurchaseTarget(input.prices, type, ownedIds);
		if (!target) continue;

		const candidates: EvaluatedPurchase[] = [];
		if (matchingOwnedPets.length === 0) {
			candidates.push(await getBestAssignment(input, target, undefined));
			if (input.shouldCancel?.()) return [];
		}

		for (const heldItemId of Object.keys(FARMING_PET_ITEMS).sort()) {
			if (matchingOwnedPets.some((pet) => pet.pet.heldItem === heldItemId)) continue;
			if ((input.prices.heldItemPrices[heldItemId] ?? 0) <= 0) continue;
			const candidate = await getBestAssignment(input, target, heldItemId);
			if (input.shouldCancel?.()) return [];
			candidates.push(candidate);
		}
		const best = candidates
			.filter(
				(candidate) =>
					candidate.result.valuation.coinsPerHour > input.before.valuation.coinsPerHour + RATE_EPSILON
			)
			.sort((a, b) => comparePurchases(a, b, input.before.valuation.coinsPerHour))[0];

		if (!best) continue;
		evaluatedPurchases.push(best);
	}

	const assignments = new Map<EvaluatedPurchase, PestFarmingPhase[]>();
	for (const phase of PEST_FARMING_PHASES) {
		const winner = evaluatedPurchases
			.filter((candidate) => getPhaseGain(candidate, phase, input.before.valuation.coinsPerHour) > RATE_EPSILON)
			.sort((a, b) => comparePhasePurchases(a, b, phase, input.before.valuation.coinsPerHour))[0];
		if (winner) assignments.set(winner, [...(assignments.get(winner) ?? []), phase]);
	}

	const selectedPurchases = [...assignments.entries()].map(([candidate, phases]) =>
		reassignPurchasePhases(input, candidate, phases)
	);
	const passive = evaluatedPurchases
		.filter(
			(candidate) =>
				candidate.phases.length === 0 &&
				candidate.result.valuation.coinsPerHour > input.before.valuation.coinsPerHour + RATE_EPSILON &&
				!assignments.has(candidate)
		)
		.sort((a, b) => comparePurchases(a, b, input.before.valuation.coinsPerHour))[0];
	if (passive) selectedPurchases.push(passive);

	const recommendations: PestPetPurchaseRecommendation[] = [];
	for (const selected of selectedPurchases.sort((a, b) =>
		comparePurchases(a, b, input.before.valuation.coinsPerHour)
	)) {
		if (selected.result.valuation.coinsPerHour <= input.before.valuation.coinsPerHour + RATE_EPSILON) continue;
		const heldItemApplication = getHeldItemApplication(input, selected);
		if (heldItemApplication) {
			recommendations.push(heldItemApplication);
			continue;
		}

		const primaryPhase = selected.phases[0] ?? PestFarmingPhase.Farm;
		const phaseLabel = selected.phases.length > 0 ? formatNames(selected.phases.map(titleCasePhase)) : 'owned pets';
		if (selected.upgrade.group) {
			selected.upgrade.group.warning =
				selected.phases.length > 0
					? `New pet for ${phaseLabel}; owned pet items stay unchanged.`
					: 'Adds this pet to your owned pets because it improves the active Rose Dragon Symbiosis bonus.';
		}
		const calculator = new PestFarmingRateCalculator({
			player: input.player,
			options: input.options,
			priceBook: input.priceBook,
		});
		recommendations.push({
			upgrade: selected.upgrade,
			impact: calculator.compareResults(
				input.before,
				selected.result,
				primaryPhase,
				selected.upgrade.conflictKey ?? 'pet-purchase',
				selected.totalCost
			),
			player: selected.player,
			phases: selected.phases,
			primaryPhase,
		});
	}

	return recommendations;
}

function reassignPurchasePhases(
	input: PestPetPurchaseRecommendationInput,
	candidate: EvaluatedPurchase,
	phases: PestFarmingPhase[]
): EvaluatedPurchase {
	const upgrade: FortuneUpgrade = {
		...candidate.upgrade,
		group: candidate.upgrade.group ? { ...candidate.upgrade.group } : undefined,
		groupedUpgrades: candidate.upgrade.groupedUpgrades?.map((member) => ({
			...member,
			meta:
				member.meta?.type === 'buy_pet'
					? { ...member.meta, phases: [...phases] }
					: member.meta
						? { ...member.meta }
						: undefined,
		})),
		meta: candidate.upgrade.meta ? { ...candidate.upgrade.meta, phases: [...phases] } : undefined,
	};
	const player = input.player.clone();
	player.applyPhaseUpgrade(PestFarmingPhase.Farm, upgrade);
	const result = new PestFarmingRateCalculator({
		player,
		options: input.options,
		priceBook: input.priceBook,
	}).calculate();
	return { ...candidate, upgrade, player, result, phases };
}

function comparePurchases(a: EvaluatedPurchase, b: EvaluatedPurchase, baselineCoinsPerHour: number): number {
	const aGain = a.result.valuation.coinsPerHour - baselineCoinsPerHour;
	const bGain = b.result.valuation.coinsPerHour - baselineCoinsPerHour;
	return (
		bGain - aGain ||
		a.totalCost / aGain - b.totalCost / bGain ||
		(a.heldItemId ?? '').localeCompare(b.heldItemId ?? '') ||
		phaseKey(a.phases).localeCompare(phaseKey(b.phases))
	);
}

function getPhaseGain(candidate: EvaluatedPurchase, phase: PestFarmingPhase, baselineCoinsPerHour: number): number {
	return (candidate.phaseCoinsPerHour[phase] ?? baselineCoinsPerHour) - baselineCoinsPerHour;
}

function comparePhasePurchases(
	a: EvaluatedPurchase,
	b: EvaluatedPurchase,
	phase: PestFarmingPhase,
	baselineCoinsPerHour: number
): number {
	const aGain = getPhaseGain(a, phase, baselineCoinsPerHour);
	const bGain = getPhaseGain(b, phase, baselineCoinsPerHour);
	return (
		bGain - aGain ||
		a.totalCost / aGain - b.totalCost / bGain ||
		(a.heldItemId ?? '').localeCompare(b.heldItemId ?? '')
	);
}

async function getBestAssignment(
	input: PestPetPurchaseRecommendationInput,
	target: NonNullable<ReturnType<typeof getPetPurchaseTarget>>,
	heldItemId: string | undefined
): Promise<EvaluatedPurchase> {
	let best: EvaluatedPurchase | undefined;
	const phaseCoinsPerHour: Partial<Record<PestFarmingPhase, number>> = {};
	const assignments = [[], ...PEST_FARMING_PHASES.map((phase) => [phase])] as PestFarmingPhase[][];
	for (const phases of assignments) {
		const upgrade = createPetPurchaseUpgrade(target, { selected: true, phases, heldItemId });
		const player = input.player.clone();
		player.applyPhaseUpgrade(PestFarmingPhase.Farm, upgrade);
		const result = new PestFarmingRateCalculator({
			player,
			options: input.options,
			priceBook: input.priceBook,
		}).calculate();
		const candidate = {
			upgrade,
			player,
			result,
			petType: target.type,
			phases,
			phaseCoinsPerHour,
			heldItemId,
			totalCost: getPetPurchaseUpgradeCost(upgrade, input.prices),
		};
		if (phases.length === 1) phaseCoinsPerHour[phases[0]!] = result.valuation.coinsPerHour;
		if (
			!best ||
			result.valuation.coinsPerHour > best.result.valuation.coinsPerHour + RATE_EPSILON ||
			(Math.abs(result.valuation.coinsPerHour - best.result.valuation.coinsPerHour) <= RATE_EPSILON &&
				phaseKey(phases).localeCompare(phaseKey(best.phases)) < 0)
		) {
			best = candidate;
		}
		await input.yieldControl?.();
		if (input.shouldCancel?.()) break;
	}
	return best!;
}

function getHeldItemApplication(
	input: PestPetPurchaseRecommendationInput,
	candidate: EvaluatedPurchase
): PestPetPurchaseRecommendation | undefined {
	if (!candidate.heldItemId || candidate.phases.length === 0) return undefined;

	const targetLevel = getPetTargetLevel(candidate.petType);
	const targetRarity = getPetTargetRarity(candidate.petType);
	const pet = input.player.getOwnedPets().find((pet) => {
		if (pet.type !== candidate.petType || pet.level < targetLevel || compareRarity(pet.rarity, targetRarity) < 0) {
			return false;
		}

		const petId = getFarmingPetId(pet);
		if (!petId) return false;
		const assignedPhases = PEST_FARMING_PHASES.filter((phase) => input.player.phaseLoadouts[phase].petId === petId);
		return (
			assignedPhases.length === candidate.phases.length &&
			assignedPhases.every((phase) => candidate.phases.includes(phase))
		);
	});
	if (!pet) return undefined;

	const primaryPhase = candidate.phases[0]!;
	const upgrade = pet
		.getUpgrades({ stats: Object.values(Stat), sourceTypes: ['pet'] }, input.player.phases[primaryPhase])
		.find((upgrade) => upgrade.meta?.type === 'pet_item' && upgrade.meta.id === candidate.heldItemId);
	if (!upgrade) return undefined;

	const player = input.player.clone();
	player.applyPhaseUpgrade(primaryPhase, upgrade);
	const result = new PestFarmingRateCalculator({
		player,
		options: input.options,
		priceBook: input.priceBook,
	}).calculate();
	if (result.valuation.coinsPerHour <= input.before.valuation.coinsPerHour + RATE_EPSILON) return undefined;

	const totalCost = input.prices.heldItemPrices[candidate.heldItemId] ?? 0;
	const calculator = new PestFarmingRateCalculator({
		player: input.player,
		options: input.options,
		priceBook: input.priceBook,
	});
	return {
		upgrade,
		impact: calculator.compareResults(
			input.before,
			result,
			primaryPhase,
			upgrade.conflictKey ?? 'pet-item',
			totalCost
		),
		player,
		phases: candidate.phases,
		primaryPhase,
	};
}

function phaseKey(phases: readonly PestFarmingPhase[]): string {
	return PEST_FARMING_PHASES.map((phase) => (phases.includes(phase) ? '1' : '0')).join('');
}

function titleCasePhase(phase: PestFarmingPhase): string {
	return `${phase[0]?.toUpperCase()}${phase.slice(1)}`;
}

function formatNames(names: string[]): string {
	if (names.length <= 1) return names[0] ?? '';
	if (names.length === 2) return `${names[0]} and ${names[1]}`;
	return `${names.slice(0, -1).join(', ')}, and ${names.at(-1)}`;
}
