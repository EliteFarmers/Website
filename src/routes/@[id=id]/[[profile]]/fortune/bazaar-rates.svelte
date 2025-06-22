<script lang="ts">
	import type { components } from '$lib/api/api';
	import { getRatesData } from '$lib/stores/ratesData';
	import * as Select from '$ui/select';
	import { Skeleton } from '$ui/skeleton';
	import * as Popover from '$ui/popover';
	import { getPossibleResultsFromCrops, type Crop } from 'farming-weight';
	import { watch } from 'runed';
	import Info from '@lucide/svelte/icons/info';
	import { browser } from '$app/environment';

	interface Props {
		crop: Crop;
		amount: number;
		otherCoins?: number;
	}

	const ratesData = getRatesData();

	let { crop, amount, otherCoins = 0 }: Props = $props();

	const results = $derived(getPossibleResultsFromCrops(crop, amount));

	async function getBazaarData(items: string[]) {
		if (!browser) return undefined;
		const response = await fetch('/rates/' + items.join('|'));
		try {
			const jsonData = await response.json();

			const data = jsonData as components['schemas']['GetSpecifiedSkyblockItemsResponse'];
			return data?.items;
		} catch {
			return undefined;
		}
	}

	let bzPromise = $state<ReturnType<typeof getBazaarData> | undefined>(undefined);

	watch(
		() => crop,
		() => {
			const items = Object.keys(getPossibleResultsFromCrops(crop, 1));
			bzPromise = getBazaarData(items);
		}
	);
</script>

<div class="my-2 rounded-md border p-2">
	<div class="mb-2 flex flex-row items-center gap-2">
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
					{@const sell = $ratesData.bzMode === 'insta' ? bzData?.averageSell : bzData?.averageSellOrder}
					{@const profit = sell * result.fractionalItems - result.fractionalCost + otherCoins}
					<div class="flex w-full items-center justify-between py-1">
						<div class="flex flex-row items-center gap-2">
							<span class="text-lg">{bz?.[id].name}</span>
							<Popover.Mobile>
								{#snippet trigger()}
									<Info size={16} class="text-muted-foreground" />
								{/snippet}
								<div class="flex max-w-xl flex-col gap-1">
									<div>
										<div
											class="even:bg-card flex flex-row items-center justify-between gap-6 rounded-sm p-1"
										>
											<span><strong>Source</strong></span>
											<span><strong>Coins</strong></span>
										</div>
										<hr />
									</div>

									<div
										class="odd:bg-card flex flex-row items-center justify-between gap-6 rounded-sm p-1"
									>
										<span>{bz?.[id].name}</span>
										<span>{Math.floor(sell * result.fractionalItems).toLocaleString()}</span>
									</div>
									{#if result.fractionalCost > 0}
										<div
											class="odd:bg-card flex flex-row items-center justify-between gap-6 rounded-sm p-1"
										>
											<span>Other items affecting craft cost</span>
											<span>{Math.floor(-result.fractionalCost).toLocaleString()}</span>
										</div>
									{/if}
									<div
										class="odd:bg-card flex flex-row items-center justify-between gap-6 rounded-sm p-1"
									>
										<span>NPC selling other items</span>
										<span>{Math.floor(otherCoins).toLocaleString()}</span>
									</div>

									<div>
										<hr />
										<div class="flex flex-row items-center justify-between gap-6 rounded-sm p-1">
											<span><strong>Total</strong></span>
											<span>{Math.floor(profit).toLocaleString()}</span>
										</div>
									</div>
								</div>
							</Popover.Mobile>
						</div>
						<span>{Math.floor(profit).toLocaleString()}</span>
					</div>
				{/if}
			{/each}
		{/await}
	{/if}
</div>
