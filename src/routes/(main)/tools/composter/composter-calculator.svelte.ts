import type { RatesItemPriceData } from '$lib/api/elite';
import {
	COMPOSTER_PRICE_ITEM_IDS,
	getCheapestUsableMaterial,
	getComposterPriceMap,
	getComposterPurchasePrice,
	getCompostSellPrice,
	type ComposterPurchaseMode,
	type ComposterSellMode,
} from '$lib/calc/composter';
import { getItems } from '$lib/remote/items.remote';
import {
	calculateComposter,
	COMPOSTER_FUELS,
	COMPOSTER_ORGANIC_MATTER_ITEMS,
	ComposterUpgrade,
	rankComposterMaterials,
} from 'farming-weight';
import { upgradeSettings } from './composter-content';
import { onMount, onDestroy } from 'svelte';
import { syncToolQuery } from '$lib/tools/query-state.svelte';
import { nonDefault, readNumber, readChoice, type ToolQueryValues } from '$lib/tools/query-params';

type PriceStatus = 'loading' | 'ready' | 'error';

const placeholderOrganic = COMPOSTER_ORGANIC_MATTER_ITEMS[0];

const placeholderFuel = COMPOSTER_FUELS[0];

export class ComposterCalculator {
	upgradeLevels = $state<Record<ComposterUpgrade, number>>({
		[ComposterUpgrade.Speed]: 0,
		[ComposterUpgrade.MultiDrop]: 0,
		[ComposterUpgrade.FuelCap]: 0,
		[ComposterUpgrade.OrganicMatterCap]: 0,
		[ComposterUpgrade.CostReduction]: 0,
	});

	purchaseMode = $state<ComposterPurchaseMode>('instabuy');

	sellMode = $state<ComposterSellMode>('instasell');

	selectedOrganicId = $state('');

	selectedFuelId = $state('');

	prices = $state<RatesItemPriceData>({});

	priceStatus = $state<PriceStatus>('loading');

	priceRequest = 0;

	mechanics = $derived(
		calculateComposter({
			upgradeLevels: this.upgradeLevels,
			organicMatter: placeholderOrganic,
			fuel: placeholderFuel,
		})
	);

	priceMap = $derived(getComposterPriceMap(this.prices, this.purchaseMode));

	organicRankings = $derived(
		rankComposterMaterials(
			COMPOSTER_ORGANIC_MATTER_ITEMS,
			this.priceMap,
			this.mechanics.organicMatterPerCycle,
			this.mechanics.organicMatterCapacity
		)
	);

	fuelRankings = $derived(
		rankComposterMaterials(COMPOSTER_FUELS, this.priceMap, this.mechanics.fuelPerCycle, this.mechanics.fuelCapacity)
	);

	selectedOrganic = $derived(
		this.organicRankings.find((item) => item.itemId === this.selectedOrganicId && item.fitsCapacity) ??
			getCheapestUsableMaterial(this.organicRankings) ??
			placeholderOrganic
	);

	selectedFuel = $derived(
		this.fuelRankings.find((item) => item.itemId === this.selectedFuelId && item.fitsCapacity) ??
			getCheapestUsableMaterial(this.fuelRankings) ??
			placeholderFuel
	);

	compostPrice = $derived(getCompostSellPrice(this.prices, this.sellMode));

	calculation = $derived(
		calculateComposter({
			upgradeLevels: this.upgradeLevels,
			organicMatter: this.selectedOrganic,
			fuel: this.selectedFuel,
			organicMatterPrice: getComposterPurchasePrice(this.prices[this.selectedOrganic.itemId], this.purchaseMode),
			fuelPrice: getComposterPurchasePrice(this.prices[this.selectedFuel.itemId], this.purchaseMode),
			compostPrice: this.compostPrice,
		})
	);

	resetUpgrades = (level = 0) => {
		for (const upgrade of upgradeSettings) this.upgradeLevels[upgrade.key] = level;
	};

	formatNumber = (value: number, digits = 0) => {
		return value.toLocaleString('en-US', { maximumFractionDigits: digits });
	};

	formatCoins = (value: number | undefined) => {
		return value === undefined ? 'Unavailable' : `${this.formatNumber(value)} coins`;
	};

	formatDuration = (hours: number) => {
		if (!Number.isFinite(hours) || hours <= 0) return 'Unavailable';
		const wholeHours = Math.floor(hours);
		const minutes = Math.round((hours - wholeHours) * 60);
		return wholeHours > 0 ? `${wholeHours}h ${minutes}m` : `${minutes}m`;
	};

	fetchPrices = async () => {
		const requestId = ++this.priceRequest;
		this.priceStatus = 'loading';
		try {
			const result = await getItems(COMPOSTER_PRICE_ITEM_IDS);
			if (requestId !== this.priceRequest) return;
			this.prices = result;
			this.priceStatus = getCompostSellPrice(result, this.sellMode) !== undefined ? 'ready' : 'error';
		} catch {
			if (requestId !== this.priceRequest) return;
			this.prices = {};
			this.priceStatus = 'error';
		}
	};

	connect(getUrl: () => URL) {
		syncToolQuery(getUrl, this.readQuery, this.writeQuery);
		onMount(this.fetchPrices);
		onDestroy(() => {
			this.priceRequest++;
		});
	}

	readQuery = (params: URLSearchParams) => {
		for (const { key } of upgradeSettings) this.upgradeLevels[key] = readNumber(params, key, 0, 0, 25, 1);
		this.purchaseMode = readChoice(params, 'buy', ['instabuy', 'buyorder'] as const, 'instabuy');
		this.sellMode = readChoice(params, 'sell', ['instasell', 'sellorder'] as const, 'instasell');
		this.selectedOrganicId = readChoice(
			params,
			'organic',
			COMPOSTER_ORGANIC_MATTER_ITEMS.map((item) => item.itemId),
			''
		);
		this.selectedFuelId = readChoice(
			params,
			'fuel',
			COMPOSTER_FUELS.map((item) => item.itemId),
			''
		);
	};
	writeQuery = (): ToolQueryValues => ({
		...Object.fromEntries(upgradeSettings.map(({ key }) => [key, nonDefault(this.upgradeLevels[key], 0)])),
		buy: nonDefault(this.purchaseMode, 'instabuy'),
		sell: nonDefault(this.sellMode, 'instasell'),
		organic: this.selectedOrganicId,
		fuel: this.selectedFuelId,
	});
}
