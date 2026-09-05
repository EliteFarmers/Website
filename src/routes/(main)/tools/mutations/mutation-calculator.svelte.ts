import type { RatesItemPriceData } from '$lib/api/elite';
import {
	calculateMutationCopperRatios,
	getRoseDragonBonus,
	getSynthesisChipFromLevel,
	sortMutationCopperRatios,
	type MutationBuyType,
	type MutationCopperRatio,
} from '$lib/calc/mutation-copper';
import { getItems } from '$lib/remote/items.remote';
import { GREENHOUSE_MUTATIONS } from 'farming-weight';
import { onMount, onDestroy } from 'svelte';
import { syncToolQuery } from '$lib/tools/query-state.svelte';
import { nonDefault, readNumber, readChoice, type ToolQueryValues } from '$lib/tools/query-params';

const MUTATIONS = Object.values(GREENHOUSE_MUTATIONS);

const MUTATION_IDS = MUTATIONS.map((mutation) => mutation.id);

export class MutationCalculator {
	synthesisLevel = $state(0);

	roseDragonLevel = $state(0);

	selectedType = $state<MutationBuyType>('instabuy');

	prices = $state<RatesItemPriceData>({});

	priceStatus = $state<'loading' | 'ready' | 'error'>('loading');

	priceRequest = 0;

	synthesis = $derived(getSynthesisChipFromLevel(this.synthesisLevel));

	roseDragonBonus = $derived(getRoseDragonBonus(this.roseDragonLevel));

	totalCopperBonus = $derived(this.synthesis.bonus + this.roseDragonBonus);

	calculatedRatios = $derived(
		calculateMutationCopperRatios(MUTATIONS, this.prices, this.synthesisLevel, this.roseDragonLevel)
	);

	sortedRatios = $derived(sortMutationCopperRatios(this.calculatedRatios, this.selectedType));

	getCoinPerCopper = (entry: MutationCopperRatio): number => {
		return this.selectedType === 'instabuy' ? entry.buyCoinPerCopper : entry.buyOrderCoinPerCopper;
	};

	getTotalCost = (entry: MutationCopperRatio): number => {
		return this.selectedType === 'instabuy' ? entry.buyCoinTotal : entry.buyOrderCoinTotal;
	};

	formatCoins = (value: number): string => {
		return value.toLocaleString('en-US', { maximumFractionDigits: 0 });
	};

	formatCoinRatio = (value: number): string => {
		return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
	};

	formatCopper = (value: number): string => {
		return value.toLocaleString('en-US', { maximumFractionDigits: 1 });
	};

	fetchPrices = async () => {
		const requestId = ++this.priceRequest;
		this.priceStatus = 'loading';

		try {
			const result = await getItems(MUTATION_IDS);
			if (requestId !== this.priceRequest) return;
			this.prices = result;
			this.priceStatus = Object.values(result).some((entry) => entry.bazaar) ? 'ready' : 'error';
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
		this.synthesisLevel = readNumber(params, 'synthesis', 0, 0, 20, 1);
		const rose = readNumber(params, 'rose', 0, 0, 200, 1);
		this.roseDragonLevel = rose >= 100 ? rose : 0;
		this.selectedType = readChoice(params, 'buy', ['instabuy', 'buyorder'] as const, 'instabuy');
	};
	writeQuery = (): ToolQueryValues => ({
		synthesis: nonDefault(this.synthesisLevel, 0),
		rose: nonDefault(this.roseDragonLevel, 0),
		buy: nonDefault(this.selectedType, 'instabuy'),
	});
}
