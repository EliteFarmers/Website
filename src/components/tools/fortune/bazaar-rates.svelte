<script lang="ts">
	import { browser } from '$app/environment';
	import CoinsBreakdown from '$comp/rates/coins-breakdown.svelte';
	import type { RatesItemPriceData } from '$lib/api/elite';
	import { getItems } from '$lib/remote/items.remote';
	import { getRatesData } from '$lib/stores/ratesData';
	import * as Accordion from '$ui/accordion';
	import * as Select from '$ui/select';
	import { Skeleton } from '$ui/skeleton';
	import Switch from '$ui/switch/switch.svelte';
	import { Crop, getPossibleResultsFromCrops, type DetailedDropsResult } from 'farming-weight';
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

	function getSellPrice(bzData: RatesItemPriceData[string]['bazaar'] | undefined) {
		if (!bzData) return 0;
		return $ratesData.bzMode === 'insta' ? (bzData.averageSell ?? 0) : (bzData.averageSellOrder ?? 0);
	}

	async function getBazaarData(items: string[]) {
		if (!browser) return undefined;
		if (items.length === 0) return undefined;
		return await getItems(items);
	}

	let bzPromise = $state<ReturnType<typeof getBazaarData> | undefined>(undefined);

	watch(
		() => crop,
		() => {
			const craftItems = Object.keys(getPossibleResultsFromCrops(crop, 1));
			const dropItems = Object.keys(result.items ?? {});
			const rngItems = Object.keys(result.rngItems ?? {});
			bzPromise = getBazaarData([...new Set([...craftItems, ...dropItems, ...rngItems])]);
		}
	);

	function price(items: RatesItemPriceData | undefined, item: string, amount: number) {
		const itemCost = items?.[item];
		if (!itemCost) return 0;
		const lowestPrice = itemCost.auctions?.filter((a) => a.lowest > 0)?.length
			? Math.min(...itemCost.auctions.filter((a) => a.lowest > 0).map((a) => a.lowest))
			: (($ratesData.bzMode === 'insta' ? itemCost.bazaar?.averageSell : itemCost.bazaar?.averageSellOrder) ?? 0);
		return Math.round(lowestPrice * amount);
	}
</script>

{#if bzPromise}
	{#await bzPromise}
		<div class="rounded-md border p-2">
			<div class="flex w-full flex-col gap-2">
				<Skeleton class="my-1.5 h-5 w-40" />
				<Skeleton class="my-1.5 h-4 w-full" />
				<Skeleton class="my-1.5 h-4 w-full" />
			</div>
		</div>
	{:then bz}
		{@const otherCoinsNpc = otherCoins}
		{@const otherItems = Object.entries(result.items ?? {}).filter(
			([id, count]) => id !== crop && id !== Crop.Seeds && (count ?? 0) > 0
		)}
		{@const sellToBazaar = otherItems
			.map(([itemId, items]) => {
				const bzData = bz?.[itemId]?.bazaar;
				if (!bzData) return null;
				const npc = bzData.npc ?? 0;
				const per = getSellPrice(bzData);
				if (per <= npc || per <= 0) return null;
				const gain = items * (per - npc);
				return {
					itemId,
					name: bz?.[itemId]?.item?.name ?? bzData.name ?? itemId,
					items,
					npc,
					per,
					gain,
				};
			})
			.filter((x): x is NonNullable<typeof x> => !!x)
			.sort((a, b) => b.gain - a.gain)}
		{@const sellToBazaarCoins = sellToBazaar.reduce((sum, x) => sum + x.items * x.per, 0)}
		{@const sellToBazaarDelta = sellToBazaar.reduce((sum, x) => sum + x.gain, 0)}
		{@const otherCoinsTotal = otherCoinsNpc + sellToBazaarDelta}
		{@const otherCoinsNpcRemaining = Math.max(0, otherCoinsTotal - sellToBazaarCoins)}
		{@const craftList = Object.entries(results)
			.map(([id, craft]) => {
				const bzData = bz?.[id]?.bazaar;
				if (!bzData || id === crop) return null;
				const per = getSellPrice(bzData);
				const profit = per * craft.fractionalItems - craft.fractionalCost;
				return {
					id,
					name: bzData.name ?? id,
					per,
					items: craft.fractionalItems,
					cost: craft.fractionalCost,
					profit,
					total: profit + otherCoinsTotal,
				};
			})
			.filter((x): x is NonNullable<typeof x> => !!x)
			.sort((a, b) => b.total - a.total)}
		{@const best = craftList[0]}

		<Accordion.Root type="single" class="w-full" value="bazaar">
			<Accordion.Item value="bazaar" class="outline-border w-full rounded-md px-2 outline">
				<Accordion.Trigger class="py-2 hover:no-underline">
					<div class="flex w-full items-center justify-between gap-2 pr-2">
						<span class="text-xl font-semibold">Bazaar Profit</span>
						<CoinsBreakdown coins={Math.floor(best?.total ?? otherCoinsTotal)} />
					</div>
				</Accordion.Trigger>
				<Accordion.Content class="pb-2">
					<div class="mt-2 flex flex-col gap-3">
						<div class="flex flex-row items-center justify-between gap-2">
							<Select.Simple
								class="mt-1 h-8 md:w-32"
								value={$ratesData.bzMode}
								change={(value) => {
									$ratesData.bzMode = value ?? $ratesData.bzMode;
								}}
								options={[
									{ value: 'insta', label: 'Instant Sell' },
									{ value: 'order', label: 'Sell Order' },
								]}
							/>
							{#if result.rngItems}
								<div class="flex flex-row items-center gap-2">
									<span class="text-muted-foreground text-sm">Include RNG</span>
									<Switch bind:checked={includeRng} />
								</div>
							{/if}
						</div>

						{#if craftList.length === 0}
							<p class="text-muted-foreground text-sm">No bazaar conversions available.</p>
						{:else}
							{#each craftList as craft, i (craft.id)}
								{@const isBest = i === 0}
								<div class="flex flex-col gap-1 rounded-md border p-2">
									<div class="flex items-center justify-between gap-2">
										<span class="text-lg font-semibold">{isBest ? 'Best: ' : ''}{craft.name}</span>
										{#if includeRng}
											{@const rng = Object.fromEntries(
												Object.entries(result.rngItems ?? {}).map(([item, amount], idx) => {
													const name =
														bz?.[item]?.bazaar?.name ??
														bz?.[item]?.item?.name ??
														`RNG Item ${idx}`;
													return [name, price(bz, item, amount)];
												})
											)}
											<CoinsBreakdown
												coins={Math.floor(
													craft.total + Object.values(rng).reduce((a, b) => a + b, 0)
												)}
												breakdown={{
													[craft.name]: Math.floor(craft.per * craft.items),
													'Craft Cost': Math.floor(-craft.cost),
													'Other items (NPC/BZ)': Math.floor(otherCoinsTotal),
													...rng,
												}}
											/>
										{:else}
											<CoinsBreakdown
												coins={Math.floor(craft.total)}
												breakdown={{
													[craft.name]: Math.floor(craft.per * craft.items),
													'Craft Cost': Math.floor(-craft.cost),
													'Other items (NPC/BZ)': Math.floor(otherCoinsTotal),
												}}
											/>
										{/if}
									</div>
								</div>
							{/each}
						{/if}

						{#if sellToBazaar.length > 0}
							<p class="text-muted-foreground text-xs">
								Other items = {Math.floor(otherCoinsTotal).toLocaleString()} ({Math.floor(
									otherCoinsNpcRemaining
								).toLocaleString()} to NPC, {Math.floor(sellToBazaarCoins).toLocaleString()} to BZ)
							</p>
						{/if}
					</div>
				</Accordion.Content>
			</Accordion.Item>
		</Accordion.Root>
	{/await}
{/if}
