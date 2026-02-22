<script lang="ts">
	import FortuneBreakdown from '$comp/items/tools/fortune-breakdown.svelte';
	import CoinsBreakdown from '$comp/rates/coins-breakdown.svelte';
	import BazaarRates from '$comp/tools/fortune/bazaar-rates.svelte';
	import type { Crop, DetailedDropsResult } from 'farming-weight';

	interface FortuneResultContext {
		cropFortune: {
			fortune: number;
			breakdown: unknown;
		};
		effectiveFortune: number;
		result: DetailedDropsResult | null;
		coinBreakdown: [string, number][];
		collectionBreakdown: [string, number][];
	}

	interface Props {
		title: string;
		context: FortuneResultContext;
		selectedCropKey: Crop;
		showFortuneBreakdown: boolean;
	}

	let { title, context, selectedCropKey, showFortuneBreakdown }: Props = $props();
	const selectedCrop = $derived(String(selectedCropKey));
</script>

<section class="bg-card flex flex-col items-center gap-4 rounded-lg border p-6">
	<h2 class="text-2xl font-bold">{title}</h2>

	<div class="bg-muted/20 flex w-full items-center justify-around gap-4 rounded-lg py-4">
		<div class="flex flex-col items-center">
			<span class="text-muted-foreground text-xs font-bold tracking-wider uppercase">Fortune</span>
			<span class="text-primary text-4xl font-black">{context.effectiveFortune.toFixed(0)}</span>
		</div>
		{#if showFortuneBreakdown}
			<FortuneBreakdown breakdown={context.cropFortune.breakdown as any} />
		{/if}
	</div>

	<hr class="w-full" />

	<div class="flex w-full flex-col gap-4">
		<h3 class="text-lg font-bold">Expected Rates</h3>
		{#if context.result}
			<div class="flex flex-col gap-3">
				<div class="bg-muted/30 flex items-center justify-between rounded-md p-3">
					<span class="font-semibold">NPC Profit</span>
					<CoinsBreakdown coins={context.result.npcCoins} />
				</div>
				<BazaarRates
					result={context.result}
					crop={selectedCropKey}
					amount={context.result.items[selectedCropKey] ?? context.result.collection}
					otherCoins={context.result.npcCoins - (context.result.items[selectedCropKey] ?? context.result.collection) * context.result.npcPrice}
				/>
				<div class="bg-muted/30 flex items-center justify-between rounded-md p-3">
					<span class="font-semibold">Collection</span>
					<span class="text-xl font-bold">{context.result.collection.toLocaleString()}</span>
				</div>

				<div class="bg-muted/20 rounded-md p-3">
					<p class="mb-2 text-sm font-semibold">Coin Sources</p>
					<div class="flex flex-col gap-1 text-sm">
						{#each context.coinBreakdown as [name, value] (name)}
							<div class="flex items-center justify-between">
								<span>{name === 'Collection' ? selectedCrop : name}</span>
								<CoinsBreakdown coins={value} />
							</div>
						{/each}
					</div>
				</div>

				<div class="bg-muted/20 rounded-md p-3">
					<p class="mb-2 text-sm font-semibold">Collection Sources</p>
					<div class="flex flex-col gap-1 text-sm">
						{#each context.collectionBreakdown as [name, value] (name)}
							<div class="flex items-center justify-between">
								<span>{name === 'Normal' ? selectedCrop : name}</span>
								<span>{value.toLocaleString()}</span>
							</div>
						{/each}
					</div>
				</div>

				{#if context.result.specialCropBonus > 0}
					<div class="text-progress text-center text-xs">
						+{(context.result.specialCropBonus * 100).toFixed(1)}% Special Crop Bonus Active
					</div>
				{/if}
				{#if context.result.rareItemBonus > 0}
					<div class="text-completed text-center text-xs">
						+{(context.result.rareItemBonus * 100).toFixed(1)}% Rare Drop Bonus Active
					</div>
				{/if}
			</div>
		{:else}
			<p class="text-muted-foreground py-8 text-center italic">Select a crop to see rates</p>
		{/if}
	</div>
</section>
