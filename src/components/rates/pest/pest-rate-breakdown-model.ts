import type { RatesItemPriceData } from '$lib/api/elite';
import {
	Crop,
	CROP_INFO,
	Pest,
	getPestName,
	type DetailedDropsFromEffectsResult,
	type DetailedPestDropsResult,
	type PestFarmingRateResult,
	type PestRatePriceBook,
	type PestRateQuantities,
} from 'farming-weight';

export type PestRateBreakdownLine = {
	key: string;
	label: string;
	quantity?: number;
	price?: number;
	priceSource?: string;
	value: number;
	itemId?: string;
	group?: string;
};

export type PestRateBreakdownRow = {
	key: string;
	label: string;
	value: number;
	detail: string;
	lines: PestRateBreakdownLine[];
};

export type PestRateMetric = {
	label: string;
	value: string;
	detail: string;
};

export type PestRateBreakdownModel = {
	rows: PestRateBreakdownRow[];
	displayedDelta: number;
	summary: PestRateMetric[];
	cycleAssumptions: PestRateMetric[];
};

type BuildOptions = {
	result: PestFarmingRateResult;
	priceBook: PestRatePriceBook;
	items: RatesItemPriceData;
	formatNumber: (value: number, maximumFractionDigits?: number) => string;
	formatDuration: (seconds: number) => string;
};

type QuantityLineOptions = {
	labelPrefix?: string;
	includeItems?: boolean;
	includeRngItems?: boolean;
	includeCurrencies?: boolean;
	includeNpcCoins?: boolean;
};

const VALUE_THRESHOLD = 0.5;

export function buildPestRateBreakdown(options: BuildOptions): PestRateBreakdownModel {
	const { result, formatNumber, formatDuration } = options;
	const buckets = result.valuation.byBucket;
	const farmBlocksPerHour = result.debug.farmBlocks * result.debug.cyclesPerHour;
	const spawnBlocksPerHour = result.debug.spawnBlocks * result.debug.cyclesPerHour;
	const cropBlocksPerHour = farmBlocksPerHour + spawnBlocksPerHour;
	const pestsPerHour = result.breakdown.pestSpawning.pestsPerInterval * result.debug.intervalsPerHour;
	const topPests = formatTopPests(result.breakdown.pestSpawning.distribution.pestTypeProbabilities, formatNumber);

	const helpers = createLineHelpers(options);
	const rows = [
		{
			key: 'crop-breaking',
			label: 'Crop Breaking',
			value: buckets.cropBreaking,
			detail: `${formatNumber(cropBlocksPerHour)} crop blocks/hr across farm and spawn phases`,
			lines: helpers.cropBreakingLines(result),
			always: true,
		},
		{
			key: 'pest-drops',
			label: 'Pest Drops',
			value: buckets.pestDrops + buckets.npcCoins,
			detail: `${formatNumber(pestsPerHour, 1)} pests/hr, guaranteed drops, and pest coins`,
			lines: helpers.sortLineItems(
				helpers.pestDropLines(result.breakdown.pestDrops.byPest, result.debug.cyclesPerHour, 'pest-drops', {
					includeItems: true,
					includeCoins: true,
				})
			),
			always: true,
		},
		{
			key: 'rare-pest-drops',
			label: 'Rare Pest Drops',
			value: buckets.rngDrops,
			detail: 'Expected value from rare pest drop chances',
			lines: helpers.sortLineItems(
				helpers.pestDropLines(
					result.breakdown.pestDrops.byPest,
					result.debug.cyclesPerHour,
					'rare-pest-drops',
					{
						includeRngItems: true,
					}
				)
			),
			always: true,
		},
		{
			key: 'pest-exchanges',
			label: 'Pest Exchanges',
			value: buckets.pestExchanges,
			detail: 'Expected value from exchanging pests after reserved pests are kept',
			lines: helpers.sortLineItems(
				helpers.quantityLines(
					result.breakdown.economy.pestExchanges,
					result.debug.cyclesPerHour,
					'pest-exchanges',
					{
						includeRngItems: true,
						includeNpcCoins: true,
					}
				)
			),
		},
		{
			key: 'pest-shards',
			label: 'Pest Shards',
			value: buckets.pestShards,
			detail: 'Expected pest shard value after shard fortune',
			lines: helpers.sortLineItems(
				helpers.quantityLines(result.breakdown.economy.pestShards, result.debug.cyclesPerHour, 'pest-shards', {
					includeRngItems: true,
					includeNpcCoins: true,
				})
			),
		},
		{
			key: 'feast-rare-crops',
			label: 'Feast Rare Crops',
			value: buckets.feastRareCrops,
			detail: 'Expected Harvest Feast rare crop value',
			lines: helpers.sortLineItems(
				helpers.quantityLines(
					result.breakdown.economy.feastRareCrops,
					result.debug.cyclesPerHour,
					'feast-rare-crops',
					{
						includeRngItems: true,
						includeNpcCoins: true,
					}
				)
			),
		},
		{
			key: 'currencies',
			label: 'Other Currencies',
			value: buckets.currencies,
			detail: 'Priced currency outputs not already shown in another source',
			lines: helpers.sortLineItems(
				helpers.currencyLines(helpers.getUnbucketedCurrencies(result), result.debug.cyclesPerHour, 'currencies')
			),
		},
		{
			key: 'costs',
			label: 'Costs',
			value: buckets.costs,
			detail: 'Recurring consumable costs applied to the modeled cycle',
			lines: helpers.sortLineItems(
				helpers.quantityLines(result.breakdown.economy.costs, result.debug.cyclesPerHour, 'costs', {
					includeRngItems: true,
					includeNpcCoins: true,
				})
			),
		},
	].filter((row) => row.always || Math.abs(row.value) >= VALUE_THRESHOLD);

	const rowTotal = rows.reduce((sum, row) => sum + row.value, 0);
	const delta = result.valuation.coinsPerHour - rowTotal;

	return {
		rows,
		displayedDelta: Math.abs(delta) < VALUE_THRESHOLD ? 0 : delta,
		summary: [
			{
				label: 'Pests',
				value: `${formatNumber(pestsPerHour, 1)}/hr`,
				detail: `${formatNumber(result.breakdown.pestSpawning.expectedPestsPerSpawn, 2)} each spawn`,
			},
			{
				label: 'Cycles',
				value: `${formatNumber(result.debug.cyclesPerHour, 2)}/hr`,
				detail: `${formatDuration(result.debug.cycleSeconds)} per cycle`,
			},
			{
				label: 'Crop Blocks',
				value: `${formatNumber(cropBlocksPerHour)}/hr`,
				detail: `${formatNumber(spawnBlocksPerHour)} while spawning`,
			},
		],
		cycleAssumptions: [
			{
				label: 'Farm Phase',
				value: formatDuration(result.debug.farmSeconds),
				detail: `${formatNumber(result.debug.farmBlocks)} blocks/cycle`,
			},
			{
				label: 'Spawn Phase',
				value: formatDuration(result.debug.spawnPhaseSeconds),
				detail: `${formatNumber(result.debug.spawnBlocks)} blocks/cycle`,
			},
			{
				label: 'Spawn Wait',
				value: formatDuration(result.debug.spawnWaitSeconds),
				detail: `${formatNumber(result.debug.spawnChancePerBreak * 100, 3)}% chance/block`,
			},
			{
				label: 'Kill Phase',
				value: formatDuration(result.debug.killPhaseSeconds),
				detail: `${formatNumber(result.breakdown.pestSpawning.expectedPestsPerSpawn, 2)} pests/cycle`,
			},
			{
				label: 'Pest Mix',
				value: topPests.value,
				detail: topPests.detail,
			},
		],
	};
}

function formatIdentifier(value: string) {
	return value
		.replace(/_/g, ' ')
		.replace(/:/g, ' ')
		.toLowerCase()
		.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatTopPests(
	distribution: Partial<Record<Pest, number>>,
	formatNumber: (value: number, maximumFractionDigits?: number) => string
) {
	const top = Object.entries(distribution)
		.filter((entry): entry is [Pest, number] => entry[1] > 0)
		.sort((a, b) => b[1] - a[1])
		.slice(0, 3)
		.map(([pest, probability]) => `${getPestName(pest)} ${formatNumber(probability * 100, 1)}%`);

	return {
		value: top[0] ?? 'No pests',
		detail: top.length > 1 ? top.slice(1).join(', ') : 'No secondary pest weights',
	};
}

function createLineHelpers({ priceBook, items }: BuildOptions) {
	const cropName = (itemId: string) =>
		Object.values(Crop).includes(itemId as Crop) ? CROP_INFO[itemId as Crop]?.name : undefined;

	const getItemName = (itemId: string) =>
		items[itemId]?.item?.name ?? items[itemId]?.bazaar?.name ?? cropName(itemId) ?? formatIdentifier(itemId);

	const itemLines = (
		record: Record<string, number>,
		scale: number,
		keyPrefix: string,
		labelPrefix = ''
	): PestRateBreakdownLine[] =>
		Object.entries(record).map(([itemId, amount]) => {
			const quantity = amount * scale;
			const price = priceBook.items?.[itemId];
			return {
				key: `${keyPrefix}:item:${labelPrefix}:${itemId}`,
				label: getItemName(itemId),
				itemId,
				group: labelPrefix || 'Item output',
				quantity,
				price: price?.coins,
				priceSource: price?.source,
				value: quantity * (price?.coins ?? 0),
			};
		});

	const pricedItemLines = (
		record: Record<string, number>,
		keyPrefix: string,
		labelPrefix: string,
		sourcePrices: Record<string, number> = {}
	): PestRateBreakdownLine[] =>
		Object.entries(record).map(([itemId, quantity]) => {
			const price = priceBook.items?.[itemId];
			const fallbackPrice = quantity !== 0 ? sourcePrices[itemId] / quantity : undefined;
			const unitPrice = price?.coins ?? fallbackPrice;
			return {
				key: `${keyPrefix}:item:${labelPrefix}:${itemId}`,
				label: getItemName(itemId),
				itemId,
				group: labelPrefix,
				quantity,
				price: unitPrice,
				priceSource: price?.source ?? (fallbackPrice !== undefined ? 'npc' : undefined),
				value: quantity * (unitPrice ?? 0),
			};
		});

	const currencyLines = (
		record: Record<string, number>,
		scale: number,
		keyPrefix: string,
		labelPrefix = ''
	): PestRateBreakdownLine[] =>
		Object.entries(record).map(([currencyId, amount]) => {
			const quantity = amount * scale;
			const price = priceBook.currencies?.[currencyId];
			return {
				key: `${keyPrefix}:currency:${labelPrefix}:${currencyId}`,
				label: formatIdentifier(currencyId),
				group: labelPrefix || 'Currencies',
				quantity,
				price,
				priceSource: price === undefined ? undefined : 'currency',
				value: quantity * (price ?? 0),
			};
		});

	const coinSourceLines = (
		record: Record<string, number>,
		scale: number,
		keyPrefix: string,
		labelPrefix = ''
	): PestRateBreakdownLine[] =>
		Object.entries(record).map(([source, coins]) => {
			const value = coins * scale;
			return {
				key: `${keyPrefix}:coins:${labelPrefix}:${source}`,
				label: source,
				group: labelPrefix || 'Direct NPC Coins',
				quantity: value,
				value,
			};
		});

	const quantityLines = (
		quantities: PestRateQuantities,
		scale: number,
		keyPrefix: string,
		options: QuantityLineOptions = {}
	): PestRateBreakdownLine[] => {
		const labelPrefix = options.labelPrefix ?? '';
		return [
			...(options.includeItems === false ? [] : itemLines(quantities.items, scale, keyPrefix, labelPrefix)),
			...(options.includeRngItems
				? itemLines(quantities.rngItems, scale, `${keyPrefix}:rng`, labelPrefix || 'Rare item output')
				: []),
			...(options.includeCurrencies === false
				? []
				: currencyLines(quantities.currencies, scale, keyPrefix, labelPrefix)),
			...(options.includeNpcCoins
				? coinSourceLines({ Coins: quantities.npcCoins }, scale, keyPrefix, labelPrefix)
				: []),
		];
	};

	const sortLineItems = (lines: PestRateBreakdownLine[]) =>
		lines
			.filter((line) => line.quantity !== 0 || line.value !== 0)
			.sort((a, b) => Math.abs(b.value) - Math.abs(a.value) || a.label.localeCompare(b.label));

	const pestDropLines = (
		drops: Partial<Record<Pest, DetailedPestDropsResult>>,
		scale: number,
		keyPrefix: string,
		options: { includeItems?: boolean; includeRngItems?: boolean; includeCoins?: boolean }
	) =>
		Object.entries(drops).flatMap(([pestId, pestDrop]) => {
			if (!pestDrop) return [];
			const labelPrefix = getPestName(pestId as Pest);
			return [
				...(options.includeItems
					? quantityLines(pestDrop, scale, `${keyPrefix}:${pestId}`, {
							labelPrefix,
							includeItems: true,
							includeRngItems: false,
							includeCurrencies: true,
						})
					: []),
				...(options.includeRngItems
					? quantityLines(pestDrop, scale, `${keyPrefix}:${pestId}:rng`, {
							labelPrefix,
							includeItems: false,
							includeRngItems: true,
							includeCurrencies: false,
						})
					: []),
				...(options.includeCoins
					? coinSourceLines(pestDrop.coinSources, scale, `${keyPrefix}:${pestId}`, labelPrefix)
					: []),
			];
		});

	const cropBreakingLines = (rateResult: PestFarmingRateResult) => {
		const cropRates = scaleDetailedCropRates(
			sumDetailedCropRates(rateResult.breakdown.cropBreaking.farm, rateResult.breakdown.cropBreaking.spawn),
			rateResult.debug.cyclesPerHour
		);
		const representedSources = getRepresentedCropCoinSources(cropRates, getItemName);
		const itemSourcePrices = getItemSourcePrices(cropRates, representedSources, getItemName);
		return sortLineItems([
			...pricedItemLines(cropRates.items, 'crop-breaking', 'Crop Item Output', itemSourcePrices),
			...pricedItemLines(cropRates.rngItems ?? {}, 'crop-breaking:rng', 'Rare Crop Output', itemSourcePrices),
			...currencyLines(cropRates.currencies, 1, 'crop-breaking:currency', 'Currency Output'),
			...coinSourceLines(
				omitRecord(cropRates.coinSources, representedSources),
				1,
				'crop-breaking:coins',
				'Direct Coin Output'
			),
		]);
	};

	const getUnbucketedCurrencies = (rateResult: PestFarmingRateResult) => {
		const economy = rateResult.breakdown.economy;
		const bucketed = sumNumberRecords(
			rateResult.breakdown.cropBreaking.total.currencies,
			rateResult.breakdown.pestDrops.total.currencies,
			economy.pestExchanges.currencies,
			economy.pestShards.currencies,
			economy.costs.currencies,
			economy.feastRareCrops.currencies
		);
		return diffNumberRecords(bucketed, rateResult.perCycle.currencies);
	};

	return {
		cropBreakingLines,
		currencyLines,
		getUnbucketedCurrencies,
		pestDropLines,
		quantityLines,
		sortLineItems,
	};
}

function sumNumberRecords(...records: Record<string, number>[]): Record<string, number> {
	const result: Record<string, number> = {};
	for (const record of records) {
		for (const [key, value] of Object.entries(record)) {
			if (!value) continue;
			result[key] = (result[key] ?? 0) + value;
		}
	}
	return result;
}

function diffNumberRecords(before: Record<string, number>, after: Record<string, number>): Record<string, number> {
	const result: Record<string, number> = {};
	for (const key of new Set([...Object.keys(before), ...Object.keys(after)])) {
		const value = (after[key] ?? 0) - (before[key] ?? 0);
		if (value) result[key] = value;
	}
	return result;
}

function sumDetailedCropRates(...results: DetailedDropsFromEffectsResult[]): DetailedDropsFromEffectsResult {
	const [first] = results;
	const result: DetailedDropsFromEffectsResult = {
		npcPrice: first?.npcPrice ?? 0,
		collection: 0,
		npcCoins: 0,
		fortune: first?.fortune ?? 0,
		blocksBroken: 0,
		coinSources: {},
		otherCollection: {},
		items: {},
		currencies: {},
		rngItems: {},
		specialCropBonus: 0,
		specialCropBonusBreakdown: {},
		appliedEffects: {},
		effectsBreakdown: {},
	};

	for (const entry of results) {
		result.collection += entry.collection;
		result.npcCoins += entry.npcCoins;
		result.blocksBroken += entry.blocksBroken;
		result.specialCropBonus += entry.specialCropBonus;
		addNumberRecords(result.coinSources, entry.coinSources);
		addNumberRecords(result.otherCollection, entry.otherCollection);
		addNumberRecords(result.items, entry.items);
		addNumberRecords(result.currencies, entry.currencies);
		addNumberRecords(result.rngItems ?? {}, entry.rngItems ?? {});
		addNumberRecords(result.specialCropBonusBreakdown, entry.specialCropBonusBreakdown);
	}
	return result;
}

function scaleDetailedCropRates(result: DetailedDropsFromEffectsResult, scale: number): DetailedDropsFromEffectsResult {
	return {
		...result,
		collection: result.collection * scale,
		npcCoins: result.npcCoins * scale,
		blocksBroken: result.blocksBroken * scale,
		specialCropBonus: result.specialCropBonus * scale,
		coinSources: scaleNumberRecord(result.coinSources, scale),
		otherCollection: scaleNumberRecord(result.otherCollection, scale),
		items: scaleNumberRecord(result.items, scale),
		currencies: scaleNumberRecord(result.currencies, scale),
		rngItems: scaleNumberRecord(result.rngItems ?? {}, scale),
		specialCropBonusBreakdown: scaleNumberRecord(result.specialCropBonusBreakdown, scale),
	};
}

function addNumberRecords(target: Record<string, number>, source: Record<string, number>): void {
	for (const [key, value] of Object.entries(source)) {
		if (!value) continue;
		target[key] = (target[key] ?? 0) + value;
	}
}

function scaleNumberRecord(record: Record<string, number>, scale: number): Record<string, number> {
	return Object.fromEntries(Object.entries(record).map(([key, value]) => [key, value * scale]));
}

function omitRecord(record: Record<string, number>, omittedKeys: ReadonlySet<string>): Record<string, number> {
	return Object.fromEntries(Object.entries(record).filter(([key]) => !omittedKeys.has(key)));
}

function getRepresentedCropCoinSources(
	result: DetailedDropsFromEffectsResult,
	getItemName: (itemId: string) => string
): Set<string> {
	const represented = new Set<string>();
	const itemIds = [...Object.keys(result.items), ...Object.keys(result.rngItems ?? {})];
	if (itemIds.some((itemId) => Object.values(Crop).includes(itemId as Crop))) {
		represented.add('Collection');
	}

	for (const itemId of itemIds) {
		const labels = new Set([getItemName(itemId), formatIdentifier(itemId)]);
		for (const source of Object.keys(result.coinSources)) {
			if (labels.has(source)) represented.add(source);
		}
	}

	if (result.items[Crop.Mushroom]) {
		represented.add('Mooshroom');
	}

	return represented;
}

function getItemSourcePrices(
	result: DetailedDropsFromEffectsResult,
	representedSources: ReadonlySet<string>,
	getItemName: (itemId: string) => string
): Record<string, number> {
	const prices: Record<string, number> = {};
	for (const itemId of [...Object.keys(result.items), ...Object.keys(result.rngItems ?? {})]) {
		const labels = new Set([getItemName(itemId), formatIdentifier(itemId)]);
		for (const [source, coins] of Object.entries(result.coinSources)) {
			if (!representedSources.has(source) || !labels.has(source)) continue;
			prices[itemId] = coins;
			break;
		}
	}
	return prices;
}
