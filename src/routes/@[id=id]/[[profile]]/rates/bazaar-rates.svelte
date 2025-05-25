<script lang="ts">
	import type { components } from '$lib/api/api';
	import { getRatesData } from '$lib/stores/ratesData';
	import * as Select from '$ui/select';
	import { getPossibleResultsFromCrops, type Crop } from 'farming-weight';
	import { watch } from 'runed';

	interface Props {
		crop: Crop;
		amount: number;
		otherCoins?: number;
	}

	const ratesData = getRatesData();

	let { crop, amount, otherCoins = 0 }: Props = $props();

	const results = $derived(getPossibleResultsFromCrops(crop, amount));

	async function getBazaarData(items: string[]) {
		const response = await fetch('/rates/' + items.join('|'));
		try {
			const jsonData = await response.json();
			return jsonData as Record<string, components['schemas']['BazaarProductSummaryDto']>;
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

<div class="rounded-sm border p-1 px-2">
	<div class="flex flex-row items-center gap-2 px-2">
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
	{#if bzPromise}
		{#await bzPromise}
			<span>Loading...</span>
		{:then bz}
			{#each Object.entries(results) as [id, result], i (i)}
				{@const bzData = bz?.[id]}
				{#if bzData && id !== crop}
					{@const sell = $ratesData.bzMode === 'insta' ? bzData?.averageSell : bzData?.averageSellOrder}
					<div class="flex w-full items-center justify-between p-2">
						<span class="text-lg">{bzData.name}</span>
						<span
							>{Math.floor(
								sell * result.fractionalItems - result.fractionalCost + otherCoins
							).toLocaleString()}</span
						>
					</div>
				{/if}
			{/each}
		{/await}
	{/if}
</div>
