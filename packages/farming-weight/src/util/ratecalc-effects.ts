import {
	getChipInputLevel,
	getChipInputRarity,
	getChipLevel,
	getChipRarity,
	normalizeChipLevels,
	normalizeChipRarities,
} from '../constants/chips.js';
import { CROP_INFO, Crop, type CropInfo, MAX_CROP_FORTUNE } from '../constants/crops.js';
import { Rarity, REFORGES } from '../constants/reforges.js';
import { MATCHING_SPECIAL_CROP, SPECIAL_CROP_INFO, type SpecialCrop } from '../constants/specialcrops.js';
import { Stat } from '../constants/stats.js';
import { calculateAverageSpecialCrops } from '../crops/special.js';
import { produceAddedDrops, resolveDropEffects } from '../effects/resolver.js';
import type {
	AppliedEffect,
	DropContext,
	DropTag,
	Effect,
	EffectEnvironment,
	EffectsBreakdown,
} from '../effects/types.js';
import type { FarmingPet } from '../fortune/farmingpet.js';
import { BEST_FARMING_TOOLS } from '../items/tools.js';

/**
 * Effect-driven detailed-drops calculator options
 */
export interface CalculateDetailedDropsFromEffectsOptions {
	crop: Crop;
	blocksBroken: number;
	farmingFortune?: number;
	dicerLevel?: 1 | 2 | 3;
	armorPieces?: 0 | 1 | 2 | 3 | 4;
	bountiful?: boolean;
	mooshroom?: boolean;
	maxTool?: boolean;
	pet?: FarmingPet;
	chips?: Record<string, number | null | undefined>;
	chipRarities?: Record<string, string | Rarity | null | undefined>;
	toolReforge?: string;
	/** Effects collected via `FarmingPlayer.collectEffects(env)`. */
	effects: readonly Effect[];
	/** Environment for the calc. Built by `buildEffectEnvironment(player, crop)`. */
	env: EffectEnvironment;
}

/**
 * Output of {@link calculateDetailedDropsFromEffects}.
 */
export interface DetailedDropsFromEffectsResult {
	npcPrice: number;
	collection: number;
	npcCoins: number;
	fortune: number;
	blocksBroken: number;
	coinSources: Record<string, number>;
	otherCollection: Record<string, number>;
	items: Record<string, number>;
	currencies: Record<string, number>;
	rngItems?: Record<string, number>;
	specialCropBonus: number;
	specialCropBonusBreakdown: Record<string, number>;
	appliedEffects: Record<string, AppliedEffect[]>;
	effectsBreakdown: EffectsBreakdown;
}

interface CandidateRngDrop {
	itemId: string;
	output: NonNullable<NonNullable<Effect['drop']>['output']>;
	/** Expected drops *before* per-drop effect resolution. */
	baseAmount: number;
	tags: ReadonlySet<DropTag>;
	dropKind: DropContext['dropKind'];
	fromAddDrop?: boolean;
	source?: string;
}

const DEFAULT_RNG_TAGS: readonly DropTag[] = ['overbloom', 'rare-crop'];

function tagSet(tags: readonly DropTag[] | undefined): ReadonlySet<DropTag> {
	return new Set(tags ?? DEFAULT_RNG_TAGS);
}

function getEffectiveFortune(opts: CalculateDetailedDropsFromEffectsOptions): number {
	const base = opts.farmingFortune ?? MAX_CROP_FORTUNE[opts.crop] ?? 0;
	let fortune = base + 100;
	if (!opts.bountiful && !opts.farmingFortune) {
		const maxRarity = BEST_FARMING_TOOLS[opts.crop]?.maxRarity ?? Rarity.Mythic;
		const bountifulFortune = REFORGES.bountiful?.tiers[maxRarity]?.stats?.[Stat.FarmingFortune] ?? 0;
		const blessedFortune = REFORGES.blessed?.tiers[maxRarity]?.stats?.[Stat.FarmingFortune] ?? 0;
		fortune += blessedFortune - bountifulFortune;
	}
	return fortune;
}

function getCropInfo(crop: Crop): CropInfo {
	return CROP_INFO[crop] ?? {};
}

function buildBaseRngCandidates(cropInfo: CropInfo, env: EffectEnvironment, blocksBroken: number): CandidateRngDrop[] {
	const out: CandidateRngDrop[] = [];
	const inSeason = env.harvestFeast && env.inSeason;
	for (const drop of cropInfo.rng ?? []) {
		if (drop.only === 'harvestFeast' && !inSeason) continue;
		const tags = tagSet(drop.tags);
		const kind: DropContext['dropKind'] = drop.dropKind ?? 'rng';
		for (const [item, count] of Object.entries(drop.drops)) {
			out.push({
				itemId: item,
				output: drop.output ?? 'rng',
				baseAmount: drop.chance * blocksBroken * count,
				tags,
				dropKind: kind,
			});
		}
	}
	return out;
}

function appendAddedDropCandidates(
	candidates: CandidateRngDrop[],
	effects: readonly Effect[],
	env: EffectEnvironment,
	blocksBroken: number
): void {
	for (const { source, payload } of produceAddedDrops(effects, env)) {
		const baseAmount =
			payload.baseAmount !== undefined
				? payload.baseAmount * blocksBroken
				: payload.chance !== undefined
					? payload.chance * blocksBroken
					: 0;
		if (baseAmount <= 0) continue;
		candidates.push({
			itemId: payload.itemId,
			output: payload.output ?? 'rng',
			baseAmount,
			tags: tagSet(payload.tags),
			dropKind: payload.dropKind ?? 'rare',
			fromAddDrop: true,
			source,
		});
	}
}

function aggregateEffectsBreakdown(target: EffectsBreakdown, applied: readonly AppliedEffect[]): void {
	for (const entry of applied) {
		// Only `add-rare-pct` contributes additively to the breakdown
		if (entry.op !== 'add-rare-pct') continue;
		const prev = target[entry.source] ?? 0;
		if (entry.amount > prev) target[entry.source] = entry.amount;
	}
}

/**
 * Run the new effect-driven detailed-drops calculation.
 */
export function calculateDetailedDropsFromEffects(
	options: CalculateDetailedDropsFromEffectsOptions
): DetailedDropsFromEffectsResult {
	const calcOptions: CalculateDetailedDropsFromEffectsOptions = {
		...options,
		chips: normalizeChipLevels(options.chips ?? {}),
		chipRarities: normalizeChipRarities(options.chipRarities ?? {}),
	};
	const { crop, blocksBroken, env, effects } = calcOptions;

	const result: DetailedDropsFromEffectsResult = {
		npcPrice: 0,
		collection: 0,
		npcCoins: 0,
		fortune: 0,
		blocksBroken,
		coinSources: {},
		otherCollection: {},
		items: {},
		currencies: {},
		specialCropBonus: 0,
		specialCropBonusBreakdown: {},
		appliedEffects: {},
		effectsBreakdown: {},
	};

	result.fortune = calcOptions.farmingFortune ?? MAX_CROP_FORTUNE[crop] ?? 0;
	const fortune = getEffectiveFortune(calcOptions);
	if (fortune <= 0 || blocksBroken < 0) return result;

	const cropInfo = getCropInfo(crop);
	const { drops, npc, breaks = 1, replenish = false } = cropInfo;
	result.npcPrice = npc;
	if (!drops) return result;

	const baseDrops = blocksBroken * drops * (fortune * 0.01);
	result.otherCollection['Normal'] = Math.round(baseDrops);

	if (calcOptions.bountiful) {
		result.coinSources['Bountiful'] = Math.round(baseDrops * 0.2);
	}
	if (calcOptions.mooshroom) {
		const mushroomDrops = Math.round(blocksBroken * breaks);
		result.coinSources['Mooshroom'] = mushroomDrops * CROP_INFO[Crop.Mushroom].npc;
		result.otherCollection['Mushroom'] = mushroomDrops;
		result.items[Crop.Mushroom] = mushroomDrops;
	}

	const armorPieces = Math.min(Math.max(calcOptions.armorPieces ?? 4, 0), 4) as 0 | 1 | 2 | 3 | 4;
	const baseSpecialCrops = calculateAverageSpecialCrops(blocksBroken, crop, armorPieces, 1);
	result.otherCollection[baseSpecialCrops.type] = baseSpecialCrops.amount;
	result.items[baseSpecialCrops.id] = baseSpecialCrops.amount;
	result.coinSources[baseSpecialCrops.type] = baseSpecialCrops.npc;

	if (replenish) {
		result.coinSources['Collection'] = Math.round((baseDrops - blocksBroken * breaks) * npc);
		result.otherCollection['Replenish'] = -Math.round(blocksBroken * breaks);
		result.collection = Math.round(baseDrops);
		result.items[crop] = Math.round(baseDrops - blocksBroken * breaks);
	} else {
		result.coinSources['Collection'] = Math.round(baseDrops * npc);
		result.collection = Math.round(baseDrops);
		result.items[crop] = Math.round(baseDrops);
	}

	if (crop === Crop.Wheat) {
		const seedsResult = calculateDetailedDropsFromEffects({
			...calcOptions,
			crop: Crop.Seeds,
			maxTool: false,
			mooshroom: false,
			env: { ...env, crop: Crop.Seeds },
		});
		const seedCollection = seedsResult.collection - blocksBroken;
		result.otherCollection['Seeds'] = seedCollection;
		result.items[Crop.Seeds] = seedCollection;
		result.coinSources['Seeds'] = seedCollection * seedsResult.npcPrice;
		if (calcOptions.bountiful) {
			result.coinSources['Bountiful (Seeds)'] = seedsResult.coinSources['Bountiful'] ?? 0;
		}
	}

	if (calcOptions.maxTool) {
		let multiplier = 1;
		if (calcOptions.chips) {
			const level = getChipLevel(getChipInputLevel(calcOptions.chips, 'mechamind'));
			if (level > 0) {
				const rarity = getChipRarity(level, getChipInputRarity(calcOptions.chipRarities, 'mechamind'));
				let perLevel = 0.015;
				if (rarity === Rarity.Epic) perLevel = 0.02;
				else if (rarity === Rarity.Legendary) perLevel = 0.025;
				multiplier = 1 + level * perLevel;
			}
		}
		const toolXpFactor = cropInfo.toolXpFactor ?? 1;
		const capsules = Math.floor(
			((result.collection + (result.otherCollection['Seeds'] ?? 0)) * multiplier) / toolXpFactor / 200_000
		);
		if (capsules > 0) {
			result.items['TOOL_EXP_CAPSULE'] = capsules;
			result.coinSources['Tool Exp Capsule'] = capsules * 100_000;
			result.otherCollection['Tool Exp Capsule'] = capsules;
		}
	}

	// Build candidate RNG drops: built-in `rng:` entries + `add-drop` payloads.
	const candidates = buildBaseRngCandidates(cropInfo, env, blocksBroken);
	appendAddedDropCandidates(candidates, effects, env, blocksBroken);

	for (const candidate of candidates) {
		const ctx: DropContext = {
			env,
			crop,
			dropKind: candidate.dropKind,
			itemId: candidate.itemId,
			tags: candidate.tags,
			fromAddDrop: candidate.fromAddDrop,
		};
		const { addRarePct, mulRare, mulDrop, applied } = resolveDropEffects(effects, ctx);
		const rareMultiplier = (1 + addRarePct / 100) * mulRare * mulDrop;
		const finalAmount = candidate.baseAmount * rareMultiplier;
		if (finalAmount <= 0) continue;

		if (candidate.output === 'collection') {
			result.collection += finalAmount;
			result.items[candidate.itemId] = (result.items[candidate.itemId] ?? 0) + finalAmount;
			result.otherCollection[candidate.source ?? candidate.itemId] =
				(result.otherCollection[candidate.source ?? candidate.itemId] ?? 0) + finalAmount;

			const itemNpc = CROP_INFO[candidate.itemId as Crop]?.npc ?? 0;
			if (itemNpc > 0) {
				result.coinSources[candidate.source ?? candidate.itemId] =
					(result.coinSources[candidate.source ?? candidate.itemId] ?? 0) + finalAmount * itemNpc;
			}

			if (applied.length > 0) {
				result.appliedEffects[candidate.itemId] = (result.appliedEffects[candidate.itemId] ?? []).concat(
					applied
				);
				aggregateEffectsBreakdown(result.effectsBreakdown, applied);
			}
			continue;
		}

		if (candidate.output === 'currency') {
			result.currencies[candidate.itemId] = (result.currencies[candidate.itemId] ?? 0) + finalAmount;

			if (applied.length > 0) {
				result.appliedEffects[candidate.itemId] = (result.appliedEffects[candidate.itemId] ?? []).concat(
					applied
				);
				aggregateEffectsBreakdown(result.effectsBreakdown, applied);
			}
			continue;
		}

		result.rngItems ??= {};
		result.rngItems[candidate.itemId] = (result.rngItems[candidate.itemId] ?? 0) + finalAmount;

		if (applied.length > 0) {
			result.appliedEffects[candidate.itemId] = (result.appliedEffects[candidate.itemId] ?? []).concat(applied);
			aggregateEffectsBreakdown(result.effectsBreakdown, applied);
		}
	}

	// Special crops: re-scale by the multiplicative bonus produced by effects whose
	// scope matches a special-crop drop. We pick a representative special crop drop
	// for this `crop` (the matching SpecialCrop tier) and feed it into the resolver.
	const specialCrop = MATCHING_SPECIAL_CROP[crop];
	if (specialCrop) {
		const specialCtx: DropContext = {
			env,
			crop,
			dropKind: 'special-crop',
			itemId: SPECIAL_CROP_INFO[specialCrop].id,
			specialCropType: specialCrop as SpecialCrop,
			tags: new Set<DropTag>(['overbloom', 'rare-crop', 'special-crop']),
		};
		const { addRarePct, mulRare, mulDrop, applied } = resolveDropEffects(effects, specialCtx);
		const totalMultiplier = (1 + addRarePct / 100) * mulRare * mulDrop;
		if (totalMultiplier !== 1 && totalMultiplier > 0) {
			const newAmount = calculateAverageSpecialCrops(blocksBroken, crop, armorPieces, totalMultiplier);
			result.otherCollection[specialCrop] = newAmount.amount;
			result.items[SPECIAL_CROP_INFO[specialCrop].id] = newAmount.amount;
			result.coinSources[specialCrop] = newAmount.npc;
			if (applied.length > 0) {
				result.appliedEffects[SPECIAL_CROP_INFO[specialCrop].id] = applied;
				aggregateEffectsBreakdown(result.effectsBreakdown, applied);
			}
		}
	}

	result.npcCoins = Object.values(result.coinSources).reduce((a, b) => a + b, 0);
	return result;
}
