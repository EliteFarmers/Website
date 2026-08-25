import type { RatesItemPriceData } from '$lib/api/elite';
import {
	Crop,
	CROP_INFO,
	Pest,
	getPestName,
	type AppliedEffect,
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
	details?: PestRateMetricDetails;
};

export type PestRateMetricDetailLine = {
	label: string;
	value: string;
	detail?: string;
	emphasis?: boolean;
	itemName?: boolean;
};

export type PestRateMetricDetails = {
	title: string;
	groups: {
		label: string;
		lines: PestRateMetricDetailLine[];
	}[];
};

export type PestRateBreakdownModel = {
	rows: PestRateBreakdownRow[];
	displayedDelta: number;
	summary: PestRateMetric[];
	cooldown: PestRateMetric & { details: PestRateMetricDetails };
	phaseAssumptions: PestRateMetric[];
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

export function getCropBreakingRngGroup(appliedEffects: readonly AppliedEffect[] | undefined): string {
	const producingSources = new Set(
		(appliedEffects ?? []).filter((effect) => effect.op === 'add-drop').map((effect) => effect.source)
	);
	return producingSources.size === 1 ? [...producingSources][0]! : 'Rare Crop Output';
}

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
			{
				label: 'Pest Mix',
				value: topPests.value,
				detail: topPests.detail,
			},
		],
		cooldown: {
			label: 'Cooldown',
			value: formatDuration(result.debug.cooldownSeconds),
			detail: 'Effective Pest spawn cooldown',
			details: buildFarmPhaseDetails(result, formatNumber, formatDuration),
		},
		phaseAssumptions: [
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
		],
	};
}

export function buildFarmPhaseDetails(
	result: PestFarmingRateResult,
	formatNumber: (value: number, maximumFractionDigits?: number) => string,
	formatDuration: (seconds: number) => string
): PestRateMetricDetails {
	const repellent = {
		none: { label: 'None', multiplier: 1 },
		normal: { label: 'Regular', multiplier: 2 },
		max: { label: 'MAX', multiplier: 4 },
	}[result.options.cycle.pestRepellent];
	const percentageReductionEntries = Object.entries(result.phaseStats.spawnPestCooldownReductionBreakdown ?? {});
	if (percentageReductionEntries.length === 0 && result.phaseStats.spawnPestCooldownReduction !== 0) {
		percentageReductionEntries.push(['Pest Cooldown Reduction', result.phaseStats.spawnPestCooldownReduction]);
	}
	const percentageReductionLines = percentageReductionEntries
		.filter(([, value]) => value !== 0)
		.sort(([, a], [, b]) => Math.abs(b) - Math.abs(a))
		.map(([source, value]) => ({
			label: source,
			value: formatReduction(value, '%', formatNumber),
			itemName: source !== 'Pest Cooldown Reduction',
		}));
	const flatReductionEntries = Object.entries(result.phaseStats.spawnPestCooldownReductionSecondsBreakdown ?? {});
	if (flatReductionEntries.length === 0 && result.phaseStats.spawnPestCooldownReductionSeconds !== 0) {
		flatReductionEntries.push(['Flat Cooldown Reduction', result.phaseStats.spawnPestCooldownReductionSeconds]);
	}
	const flatReductionLines = flatReductionEntries
		.filter(([, value]) => value !== 0)
		.sort(([, a], [, b]) => Math.abs(b) - Math.abs(a))
		.map(([source, value]) => ({
			label: source,
			value: formatReduction(value, 's', formatNumber),
			detail: 'Flat reduction after percentages',
			itemName: source !== 'Flat Cooldown Reduction',
		}));
	const finneganLines = result.options.cycle.finneganActive
		? [
				{
					label: 'Finnegan',
					value: '-20%',
					detail: 'Mayor perk',
				},
			]
		: [];
	const reductions = [...percentageReductionLines, ...finneganLines, ...flatReductionLines];

	return {
		title: 'Pest Cooldown Details',
		groups: [
			{
				label: 'Cooldown setup',
				lines: [
					{
						label: 'Base Pest Cooldown',
						value: formatDuration(300),
					},
					{
						label: 'Pest Repellent',
						value: `×${repellent.multiplier}`,
						detail: repellent.label,
					},
					{
						label: 'Cooldown Before Reductions',
						value: formatDuration(300 * repellent.multiplier),
						emphasis: true,
					},
				],
			},
			{
				label: 'Cooldown reductions',
				lines: [
					...(reductions.length > 0
						? reductions
						: [
								{
									label: 'Active Reductions',
									value: 'None',
								},
							]),
					{
						label: 'Pest Cooldown',
						value: formatDuration(result.debug.cooldownSeconds),
						emphasis: true,
					},
				],
			},
			{
				label: 'Active farming time',
				lines: [
					{
						label: 'Kill Phase Overlap',
						value: formatReduction(result.debug.killPhaseSeconds, 'duration', formatNumber, formatDuration),
						detail: 'Occurs during the cooldown',
					},
					{
						label: 'Early Spawn Swap',
						value: formatReduction(
							result.debug.spawnPreCooldownSeconds,
							'duration',
							formatNumber,
							formatDuration
						),
						detail: 'Stops farming before cooldown ends',
					},
					{
						label: 'Farm Phase',
						value: formatDuration(result.debug.farmSeconds),
						emphasis: true,
					},
				],
			},
		],
	};
}

function formatReduction(
	value: number,
	unit: '%' | 's' | 'duration',
	formatNumber: (value: number, maximumFractionDigits?: number) => string,
	formatDuration?: (seconds: number) => string
): string {
	const prefix = value >= 0 ? '-' : '+';
	const absoluteValue = Math.abs(value);
	if (absoluteValue === 0) {
		if (unit === 'duration') return formatDuration?.(0) ?? '0s';
		return `0${unit}`;
	}
	if (unit === 'duration')
		return `${prefix}${formatDuration?.(absoluteValue) ?? `${formatNumber(absoluteValue, 1)}s`}`;
	return `${prefix}${formatNumber(absoluteValue, unit === 's' ? 1 : 2)}${unit}`;
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
		labelPrefix: string | ((itemId: string) => string),
		sourcePrices: Record<string, number> = {}
	): PestRateBreakdownLine[] =>
		Object.entries(record).map(([itemId, quantity]) => {
			const price = priceBook.items?.[itemId];
			const fallbackPrice = quantity !== 0 ? sourcePrices[itemId] / quantity : undefined;
			const unitPrice = price?.coins ?? fallbackPrice;
			const group = typeof labelPrefix === 'function' ? labelPrefix(itemId) : labelPrefix;
			return {
				key: `${keyPrefix}:item:${group}:${itemId}`,
				label: getItemName(itemId),
				itemId,
				group,
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
			...pricedItemLines(
				cropRates.rngItems ?? {},
				'crop-breaking:rng',
				(itemId) => getCropBreakingRngGroup(cropRates.appliedEffects[itemId]),
				itemSourcePrices
			),
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
		addAppliedEffectRecords(result.appliedEffects, entry.appliedEffects);
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

function addAppliedEffectRecords(
	target: Record<string, AppliedEffect[]>,
	source: Record<string, AppliedEffect[]>
): void {
	for (const [itemId, effects] of Object.entries(source)) {
		target[itemId] = [...(target[itemId] ?? []), ...effects];
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
