<script lang="ts">
	import { browser } from '$app/environment';
	import CoinsBreakdown from '$comp/rates/coins-breakdown.svelte';
	import type { RatesItemPriceData } from '$lib/api/elite';
	import { getItems } from '$lib/remote/items.remote';
	import { getRatesData } from '$lib/stores/ratesData';
	import * as Select from '$ui/select';
	import { Skeleton } from '$ui/skeleton';
	import Switch from '$ui/switch/switch.svelte';
	import { getPossibleResultsFromCrops, type Crop, type DetailedDropsResult } from 'farming-weight';
	import { watch } from 'runed';

	interface Props {
		crop: Crop;
		amount: number;
		otherCoins?: number;
		result: DetailedDropsResult;
	}

	const ratesData = getRatesData();

	let { crop, amount, otherCoins = 0, result }: Props = $props();

	const results = $derived(getPossibleResultsFromCrops(crop, amount));
	let includeRng = $state(false);

	async function getBazaarData(items: string[]) {
		if (!browser) return undefined;
		if (items.length === 0) return undefined;
		return await getItems(items);
	}

	let bzPromise = $state<ReturnType<typeof getBazaarData> | undefined>(undefined);

	watch(
		() => crop,
		() => {
			const items = Object.keys(getPossibleResultsFromCrops(crop, 1));
			bzPromise = getBazaarData([...items, ...Object.keys(result.rngItems ?? {})]);
		}
	);

	function price(items: RatesItemPriceData | undefined, item: string, amount: number) {
		const itemCost = items?.[item];
		if (!itemCost) return 0;
		const lowestPrice = itemCost.auctions?.filter((a) => a.lowest3Day > 0)?.length
			? Math.min(...itemCost.auctions.filter((a) => a.lowest3Day > 0).map((a) => a.lowest3Day))
			: (($ratesData.bzMode === 'insta' ? itemCost.bazaar?.averageSell : itemCost.bazaar?.averageSellOrder) ?? 0);
		return Math.round(lowestPrice * amount);
	}
</script>

{#if result.rngItems}
	<div class="my-2 rounded-md border p-2">
		<div class="mb-2 flex flex-row items-center justify-between">
			<div class="flex flex-row items-center gap-2">
				<span class="text-xl font-semibold">RNG Drops</span>
			</div>
		</div>

		<hr class="my-1" />
		{#if bzPromise}
			{#await bzPromise}
				{#each Object.entries(result.rngItems) as [id] (id)}
					{#if id !== crop}
						<div class="flex w-full items-center justify-between gap-4 py-1">
							<Skeleton class="my-1.5 h-4 w-full" />
							<Skeleton class="h-4 w-20" />
						</div>
						<div class="mt-4 flex w-full items-center justify-between gap-4 py-1">
							<Skeleton class="my-1.5 h-4 w-full" />
							<Skeleton class="h-4 w-20" />
						</div>
					{/if}
				{/each}
			{:then bz}
				{@const rngItems = Object.fromEntries(
					Object.entries(result.rngItems ?? {}).map(([item, amount], i) => {
						const name = bz?.[item]?.item?.name;
						return [name ?? 'RNG Item ' + i, { coins: price(bz, item, amount), amount }];
					})
				)}
				{#each Object.entries(rngItems) as [name, { coins, amount }], i (i)}
					<div class="flex h-8 w-full items-center justify-between py-1">
						<span class="text-lg">{amount.toFixed(2)} {name}</span>
						<CoinsBreakdown {coins} />
					</div>
				{/each}
				<div class="mt-4 flex h-8 w-full items-center justify-between py-1">
					<span class="text-lg font-semibold">RNG + NPC Coins</span>
					<CoinsBreakdown
						coins={result.npcCoins + Object.values(rngItems).reduce((a, b) => a + b.coins, 0)}
						breakdown={{
							...Object.fromEntries(
								Object.entries(rngItems).map(([name, { coins }]) => [name, Math.floor(coins)])
							),
							...result.coinSources,
						}}
					/>
				</div>
			{/await}
		{/if}
	</div>
{/if}

<div class="my-2 rounded-md border p-2">
	<div class="mb-2 flex flex-row items-center justify-between">
		<div class="flex flex-row items-center gap-2">
			<span class="text-xl font-semibold">Bazaar</span>
			<Select.Simple
				class="mt-1 h-8 md:w-32"
				value={$ratesData.bzMode}
				change={(value) => {
					$ratesData.bzMode = value ?? $ratesData.bzMode;
				}}
				options={[
					{
						value: 'insta',
						label: 'Instant Sell',
					},
					{
						value: 'order',
						label: 'Sell Order',
					},
				]}
			/>
		</div>
		{#if result.rngItems}
			<div class="flex flex-row items-center gap-2">
				<span>Include RNG</span>
				<Switch bind:checked={includeRng} />
			</div>
		{/if}
	</div>

	<hr class="my-1" />
	{#if bzPromise}
		{#await bzPromise}
			{#each Object.entries(results) as [id] (id)}
				{#if id !== crop}
					<div class="flex w-full items-center justify-between gap-4 py-1">
						<Skeleton class="my-1.5 h-4 w-full" />
						<Skeleton class="h-4 w-20" />
					</div>
				{/if}
			{/each}
		{:then bz}
			{#each Object.entries(results) as [id, result], i (i)}
				{@const bzData = bz?.[id]?.bazaar}
				{#if bzData && id !== crop}
					{@render bzItem(bzData, result)}
				{/if}
			{/each}
		{/await}
	{/if}
</div>

{#snippet bzItem(bzData: NonNullable<RatesItemPriceData[string]['bazaar']>, profits: (typeof results)[string])}
	{@const sell = $ratesData.bzMode === 'insta' ? bzData?.averageSell : bzData?.averageSellOrder}
	{@const profit = sell * profits.fractionalItems - profits.fractionalCost + otherCoins}
	<div class="flex w-full items-center justify-between py-1">
		<span class="text-lg">{bzData.name}</span>
		{#if includeRng}
			{#await bzPromise then allItems}
				{@const rngItems = Object.fromEntries(
					Object.entries(result.rngItems ?? {}).map(([item, amount], i) => {
						const bzItem = allItems?.[item]?.bazaar;
						return [bzItem?.name ?? 'RNG Item ' + i, price(allItems, item, amount)];
					})
				)}
				<CoinsBreakdown
					coins={profit + Object.values(rngItems).reduce((a, b) => a + b, 0)}
					breakdown={{
						[bzData.name ?? 'Selling Items']: Math.floor(sell * profits.fractionalItems),
						'Craft Cost': Math.floor(-profits.fractionalCost),
						'NPC selling other items': Math.floor(otherCoins),
						...rngItems,
					}}
				/>
			{:catch}
				<CoinsBreakdown coins={profit} />
			{/await}
		{:else}
			<CoinsBreakdown
				coins={profit}
				breakdown={{
					[bzData.name ?? 'Selling Items']: Math.floor(sell * profits.fractionalItems),
					'Craft Cost': Math.floor(-profits.fractionalCost),
					'NPC selling other items': Math.floor(otherCoins),
				}}
			/>
		{/if}
	</div>
{/snippet}
