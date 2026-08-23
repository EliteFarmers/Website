import {
	createPestFarmingPlayer,
	PEST_FARMING_PHASES,
	PestFarmingPhase,
	type PestFarmingPlayer,
	type PestLoadoutPreset,
} from '../player/pestfarmingplayer.js';
import { PestFarmingRateCalculator } from './pest-farming-rate-calculator.js';
import type { PestFarmingRateOptions, PestRatePriceBook } from './pest-rate-types.js';

export interface PestLoadoutCandidate {
	armorSetId?: string;
	equipmentSetId?: string;
	petId?: string;
}

export interface PestLoadoutOptimizationProgress {
	evaluated: number;
	pass: number;
	phase: PestFarmingPhase;
	totalCandidates: number;
}

export interface PestLoadoutOptimizationResult {
	cancelled: boolean;
	evaluated: number;
	coinsPerHour: number;
	presets: PestLoadoutPreset[];
	phasePresetIds: Record<PestFarmingPhase, string>;
}

export interface PestLoadoutOptimizerInput {
	player: PestFarmingPlayer;
	options: PestFarmingRateOptions;
	priceBook: PestRatePriceBook;
	shouldCancel?: () => boolean;
	yieldControl?: () => Promise<void>;
	onProgress?: (progress: PestLoadoutOptimizationProgress) => void;
	batchSize?: number;
	frameBudgetMs?: number;
}

const RATE_EPSILON = 1e-7;

type CandidateField = keyof PestLoadoutCandidate;

interface CandidateDimension {
	field: CandidateField;
	values: (string | undefined)[];
}

function candidateKey(candidate: PestLoadoutCandidate): string {
	return [candidate.armorSetId ?? '', candidate.equipmentSetId ?? '', candidate.petId ?? ''].join('|');
}

function presetMatches(preset: PestLoadoutPreset, candidate: PestLoadoutCandidate): boolean {
	return (
		preset.armorSetId === candidate.armorSetId &&
		preset.equipmentSetId === candidate.equipmentSetId &&
		preset.petId === candidate.petId
	);
}

function stableId(value: string): string {
	let hash = 2166136261;
	for (let i = 0; i < value.length; i++) {
		hash ^= value.charCodeAt(i);
		hash = Math.imul(hash, 16777619);
	}
	return (hash >>> 0).toString(36);
}

function orderedMatchingPreset(
	presets: PestLoadoutPreset[],
	candidate: PestLoadoutCandidate
): PestLoadoutPreset | undefined {
	return presets
		.filter((preset) => presetMatches(preset, candidate))
		.sort((a, b) => {
			const aHypixel = a.id.startsWith('hypixel:') ? 0 : 1;
			const bHypixel = b.id.startsWith('hypixel:') ? 0 : 1;
			return aHypixel - bHypixel || a.id.localeCompare(b.id);
		})[0];
}

function candidateRank(player: PestFarmingPlayer, candidate: PestLoadoutCandidate): [number, string] {
	const matching = player.loadoutPresets.filter((preset) => presetMatches(preset, candidate));
	if (matching.some((preset) => preset.id.startsWith('hypixel:'))) return [0, candidateKey(candidate)];
	if (matching.length > 0) return [1, candidateKey(candidate)];
	return [2, candidateKey(candidate)];
}

function compareCandidates(player: PestFarmingPlayer, a: PestLoadoutCandidate, b: PestLoadoutCandidate): number {
	const [aRank, aKey] = candidateRank(player, a);
	const [bRank, bKey] = candidateRank(player, b);
	return aRank - bRank || aKey.localeCompare(bKey);
}

function uniqueChoices(values: (string | undefined)[]): (string | undefined)[] {
	const seen = new Set<string>();
	return values.filter((value) => {
		const key = value ?? '';
		if (seen.has(key)) return false;
		seen.add(key);
		return true;
	});
}

function createCandidateDimensions(player: PestFarmingPlayer): CandidateDimension[] {
	return [
		{
			field: 'armorSetId',
			values: uniqueChoices([undefined, ...player.armorSetLoadouts.map((set) => set.id)]),
		},
		{
			field: 'equipmentSetId',
			values: uniqueChoices([undefined, ...player.equipmentSetLoadouts.map((set) => set.id)]),
		},
		{
			field: 'petId',
			values: uniqueChoices([
				undefined,
				...player.crop.pets.map((pet) => pet.pet.uuid || pet.pet.localId || undefined),
			]),
		},
	];
}

function currentSelections(player: PestFarmingPlayer): Record<PestFarmingPhase, PestLoadoutCandidate> {
	return Object.fromEntries(
		PEST_FARMING_PHASES.map((phase) => {
			const loadout = player.phaseLoadouts[phase];
			return [
				phase,
				{
					armorSetId: loadout.armorSetId,
					equipmentSetId: loadout.equipmentSetId,
					petId: loadout.petId,
				},
			];
		})
	) as Record<PestFarmingPhase, PestLoadoutCandidate>;
}

function buildEvaluationPlayer(
	base: PestFarmingPlayer,
	selections: Record<PestFarmingPhase, PestLoadoutCandidate>
): PestFarmingPlayer {
	const presets = PEST_FARMING_PHASES.map((phase) => ({
		id: `optimizer:evaluate:${phase}`,
		name: `${phase} evaluation`,
		...selections[phase],
	}));
	return createPestFarmingPlayer({
		...base.options,
		armorSets: base.armorSetLoadouts.map((set) => ({ ...set, pieces: { ...set.pieces } })),
		equipmentSets: base.equipmentSetLoadouts.map((set) => ({ ...set, pieces: { ...set.pieces } })),
		loadoutPresets: presets,
		phasePresetIds: Object.fromEntries(
			PEST_FARMING_PHASES.map((phase) => [phase, `optimizer:evaluate:${phase}`])
		) as Record<PestFarmingPhase, string>,
		phaseLoadouts: undefined,
	});
}

function calculateRate(
	base: PestFarmingPlayer,
	selections: Record<PestFarmingPhase, PestLoadoutCandidate>,
	options: PestFarmingRateOptions,
	priceBook: PestRatePriceBook
): number {
	const rate = new PestFarmingRateCalculator({
		player: buildEvaluationPlayer(base, selections),
		options,
		priceBook,
	}).calculate().valuation.coinsPerHour;
	return Number.isFinite(rate) ? rate : Number.NEGATIVE_INFINITY;
}

function materializeResult(
	player: PestFarmingPlayer,
	selections: Record<PestFarmingPhase, PestLoadoutCandidate>
): { presets: PestLoadoutPreset[]; phasePresetIds: Record<PestFarmingPhase, string> } {
	const presets = player.loadoutPresets.map((preset) => ({ ...preset }));
	const assigned = {} as Record<PestFarmingPhase, string>;
	for (const phase of PEST_FARMING_PHASES) {
		const candidate = selections[phase];
		let preset = orderedMatchingPreset(presets, candidate);
		if (!preset) {
			const baseId = `optimizer:${stableId(candidateKey(candidate))}`;
			let id = baseId;
			let suffix = 2;
			while (presets.some((value) => value.id === id && !presetMatches(value, candidate))) {
				id = `${baseId}:${suffix++}`;
			}
			preset = presets.find((value) => value.id === id);
			if (!preset) {
				preset = { id, name: 'Optimized Loadout', ...candidate };
				presets.push(preset);
			}
		}
		assigned[phase] = preset.id;
	}
	return { presets, phasePresetIds: assigned };
}

export async function optimizePestLoadouts(input: PestLoadoutOptimizerInput): Promise<PestLoadoutOptimizationResult> {
	const player = input.player.clone();
	const dimensions = createCandidateDimensions(player);
	const choicesPerPhase = dimensions.reduce((total, dimension) => total + dimension.values.length, 0);
	const selections = currentSelections(player);
	const batchSize = Math.max(1, input.batchSize ?? 20);
	const frameBudgetMs = Math.max(1, input.frameBudgetMs ?? 8);
	let evaluated = 0;
	let frameStarted = globalThis.performance?.now() ?? Date.now();
	let pass = 0;
	let rate = calculateRate(player, selections, input.options, input.priceBook);
	let improved = true;

	while (improved) {
		improved = false;
		pass++;
		for (const phase of PEST_FARMING_PHASES) {
			for (const dimension of dimensions) {
				const current = selections[phase];
				let best = current;
				let bestRate = rate;
				for (const value of dimension.values) {
					if (current[dimension.field] === value) continue;
					if (input.shouldCancel?.()) {
						const materialized = materializeResult(player, selections);
						return { cancelled: true, evaluated, coinsPerHour: rate, ...materialized };
					}
					const candidate = { ...current, [dimension.field]: value };
					const next = { ...selections, [phase]: candidate };
					const candidateRate = calculateRate(player, next, input.options, input.priceBook);
					evaluated++;
					if (
						candidateRate > bestRate + RATE_EPSILON ||
						(Math.abs(candidateRate - bestRate) <= RATE_EPSILON &&
							compareCandidates(player, candidate, best) < 0)
					) {
						best = candidate;
						bestRate = candidateRate;
					}
					input.onProgress?.({ evaluated, pass, phase, totalCandidates: choicesPerPhase });
					const now = globalThis.performance?.now() ?? Date.now();
					if (evaluated % batchSize === 0 || now - frameStarted >= frameBudgetMs) {
						await input.yieldControl?.();
						frameStarted = globalThis.performance?.now() ?? Date.now();
					}
				}
				if (candidateKey(best) !== candidateKey(current)) {
					selections[phase] = best;
					rate = bestRate;
					improved = true;
				}
			}
		}
	}

	const materialized = materializeResult(player, selections);
	return { cancelled: false, evaluated, coinsPerHour: rate, ...materialized };
}
