<script lang="ts">
	import { resolve } from '$app/paths';
	import {
		COMPOSTER_PRICE_ITEM_IDS,
		getCheapestUsableMaterial,
		getComposterPriceMap,
		getComposterPurchasePrice,
		getCompostSellPrice,
	} from '$lib/calc/composter';
	import { getItems } from '$lib/remote/items.remote';
	import { getStatsContext } from '$lib/stores/stats.svelte';
	import { Button } from '$ui/button';
	import Loader2 from '@lucide/svelte/icons/loader-2';
	import {
		calculateComposter,
		COMPOSTER_FUELS,
		COMPOSTER_ORGANIC_MATTER_ITEMS,
		ComposterUpgrade,
		rankComposterMaterials,
	} from 'farming-weight';
	import { onMount } from 'svelte';
	import { SvelteURLSearchParams } from 'svelte/reactivity';

	const ctx = getStatsContext();
	const garden = $derived(ctx.garden);
	const upgrades = $derived(
		garden?.composter?.upgrades ?? {
			[ComposterUpgrade.Speed]: 0,
			[ComposterUpgrade.MultiDrop]: 0,
			[ComposterUpgrade.FuelCap]: 0,
			[ComposterUpgrade.OrganicMatterCap]: 0,
			[ComposterUpgrade.CostReduction]: 0,
		}
	);
	const calculatorHref = $derived.by(() => {
		const params = new SvelteURLSearchParams();
		for (const key of Object.values(ComposterUpgrade)) {
			const level = upgrades[key] ?? 0;
			if (level) params.set(key, String(level));
		}
		if (organic) params.set('organic', organic.itemId);
		if (fuel) params.set('fuel', fuel.itemId);
		const query = params.toString();
		return resolve('/tools/composter') + (query ? `?${query}` : '');
	});

	let priceData = $state<Awaited<ReturnType<typeof getItems>>>({});
	let status = $state<'loading' | 'ready' | 'error'>('loading');

	const base = $derived(
		calculateComposter({
			upgradeLevels: upgrades,
			organicMatter: COMPOSTER_ORGANIC_MATTER_ITEMS[0],
			fuel: COMPOSTER_FUELS[0],
		})
	);
	const priceMap = $derived(getComposterPriceMap(priceData, 'instabuy'));
	const organic = $derived(
		getCheapestUsableMaterial(
			rankComposterMaterials(
				COMPOSTER_ORGANIC_MATTER_ITEMS,
				priceMap,
				base.organicMatterPerCycle,
				base.organicMatterCapacity
			)
		)
	);
	const fuel = $derived(
		getCheapestUsableMaterial(
			rankComposterMaterials(COMPOSTER_FUELS, priceMap, base.fuelPerCycle, base.fuelCapacity)
		)
	);
	const estimate = $derived(
		organic && fuel
			? calculateComposter({
					upgradeLevels: upgrades,
					organicMatter: organic,
					fuel,
					organicMatterPrice: getComposterPurchasePrice(priceData[organic.itemId], 'instabuy'),
					fuelPrice: getComposterPurchasePrice(priceData[fuel.itemId], 'instabuy'),
					compostPrice: getCompostSellPrice(priceData, 'instasell'),
				})
			: undefined
	);

	function formatCoins(value: number | undefined) {
		return value === undefined
			? 'Unavailable'
			: `${value.toLocaleString('en-US', { notation: 'compact', maximumFractionDigits: 1 })} coins`;
	}

	async function loadPrices() {
		status = 'loading';
		try {
			priceData = await getItems(COMPOSTER_PRICE_ITEM_IDS);
			status = getCompostSellPrice(priceData, 'instasell') === undefined ? 'error' : 'ready';
		} catch {
			priceData = {};
			status = 'error';
		}
	}

	onMount(loadPrices);
</script>

<Button
	href={calculatorHref}
	variant="ghost"
	size="sm"
	class="px-2 font-normal text-muted-foreground"
	title="Estimated daily profit with instant buys and instant Compost sales. Open the Composter calculator."
>
	<span class="sr-only">Composter calculator. Estimated profit: </span>
	<span class="inline-flex items-center gap-1.5 tabular-nums" aria-live="polite">
		{#if status === 'loading'}
			<Loader2 class="size-3.5 animate-spin" aria-hidden="true" />
			Loading...
		{:else if status === 'ready' && estimate?.profitPerDay !== undefined}
			<span class:text-destructive={estimate.profitPerDay < 0}>{formatCoins(estimate.profitPerDay)} / day</span>
		{:else}
			Profit unavailable
		{/if}
	</span>
</Button>
