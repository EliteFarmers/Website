import { Rarity } from 'farming-weight';

export type MutationBuyType = 'instabuy' | 'buyorder';

export interface MutationAnalysisSource {
	id: string;
	display: {
		name?: string;
	};
	analysis: {
		baseCost: number;
		copper: number;
	};
}

export interface MutationBazaarPrice {
	averageBuy?: number | null;
	buy?: number | null;
	averageBuyOrder?: number | null;
	buyOrder?: number | null;
}

export type MutationPriceData = Record<string, { bazaar?: MutationBazaarPrice }>;

export interface SynthesisChip {
	level: number;
	rarity: Rarity.Rare | Rarity.Epic | Rarity.Legendary;
	bonus: number;
}

export interface MutationCopperRatio {
	id: string;
	name: string;
	copper: number;
	baseCost: number;
	buyCoinPerCopper: number;
	buyCoinTotal: number;
	buyOrderCoinPerCopper: number;
	buyOrderCoinTotal: number;
}

export function getSynthesisChipFromLevel(level: number): SynthesisChip {
	const normalizedLevel = Math.min(20, Math.max(0, Math.round(level)));
	let rarity: SynthesisChip['rarity'];

	if (normalizedLevel > 15) {
		rarity = Rarity.Legendary;
	} else if (normalizedLevel > 10) {
		rarity = Rarity.Epic;
	} else {
		rarity = Rarity.Rare;
	}

	const bonusPerLevel = {
		[Rarity.Rare]: 1,
		[Rarity.Epic]: 1.5,
		[Rarity.Legendary]: 2,
	} satisfies Record<SynthesisChip['rarity'], number>;

	return {
		level: normalizedLevel,
		rarity,
		bonus: bonusPerLevel[rarity] * normalizedLevel,
	};
}

export function getRoseDragonBonus(level: number): number {
	const normalizedLevel = Math.min(200, Math.max(0, Math.round(level)));
	return normalizedLevel > 100 ? normalizedLevel * 0.1 : 0;
}

export function calculateMutationCopperRatios(
	mutations: readonly MutationAnalysisSource[],
	prices: MutationPriceData,
	synthesisLevel: number,
	roseDragonLevel: number
): MutationCopperRatio[] {
	const synthesis = getSynthesisChipFromLevel(synthesisLevel);
	const roseDragonBonus = getRoseDragonBonus(roseDragonLevel);
	const copperMultiplier = 1 + synthesis.bonus / 100 + roseDragonBonus / 100;

	return mutations.map((mutation) => {
		const bazaar = prices[mutation.id]?.bazaar;
		const instaBuyPrice = getPrice(bazaar?.averageBuy) ?? getPrice(bazaar?.buy);
		const buyOrderPrice = getPrice(bazaar?.averageBuyOrder) ?? getPrice(bazaar?.buyOrder);
		const buyCoinTotal = getCoinTotal(mutation.analysis.baseCost, instaBuyPrice);
		const buyOrderCoinTotal = getCoinTotal(mutation.analysis.baseCost, buyOrderPrice);
		const copper = mutation.analysis.copper * copperMultiplier;

		return {
			id: mutation.id,
			name: mutation.display.name ?? mutation.id,
			copper,
			baseCost: mutation.analysis.baseCost,
			buyCoinPerCopper: buyCoinTotal / copper,
			buyCoinTotal,
			buyOrderCoinPerCopper: buyOrderCoinTotal / copper,
			buyOrderCoinTotal,
		};
	});
}

export function sortMutationCopperRatios(
	ratios: readonly MutationCopperRatio[],
	type: MutationBuyType
): MutationCopperRatio[] {
	const getRatio = (entry: MutationCopperRatio) =>
		type === 'instabuy' ? entry.buyCoinPerCopper : entry.buyOrderCoinPerCopper;

	return [...ratios].sort((a, b) => {
		const aRatio = getRatio(a);
		const bRatio = getRatio(b);
		if (aRatio === bRatio) return a.name.localeCompare(b.name);
		if (!Number.isFinite(aRatio)) return 1;
		if (!Number.isFinite(bRatio)) return -1;
		return aRatio - bRatio;
	});
}

function getPrice(price: number | null | undefined): number | undefined {
	return price !== undefined && price !== null && price > 0 ? price : undefined;
}

function getCoinTotal(baseCost: number, bazaarPrice: number | undefined): number {
	return bazaarPrice === undefined ? Number.POSITIVE_INFINITY : baseCost + bazaarPrice;
}
