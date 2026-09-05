<script lang="ts">
	import FortuneBreakdown from '$comp/items/tools/fortune-breakdown.svelte';
	import CoinsBreakdown from '$comp/rates/coins-breakdown.svelte';
	import BazaarRates from '$comp/tools/fortune/bazaar-rates.svelte';
	import { Crop, CROP_INFO, getCropDisplayName, Stat, type DetailedDropsFromEffectsResult } from 'farming-weight';

	interface FortuneResultContext {
		cropFortune: {
			breakdown: unknown;
		};
		effectiveFortune: number;
		result: DetailedDropsFromEffectsResult | null;
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

	type BreakdownEntry = number | { value: number; stat: Stat };
	type BreakdownRecord = Record<string, BreakdownEntry>;

	const totalFortuneBreakdown = $derived.by(() => {
		const raw = context.cropFortune.breakdown;
		if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
		return raw as BreakdownRecord;
	});

	const cropSpecificStat = $derived.by(() => CROP_INFO[selectedCropKey]?.fortuneType ?? Stat.FarmingFortune);

	const cropFortuneBreakdown = $derived.by(() => {
		const filtered = Object.entries(totalFortuneBreakdown).filter(([, entry]) => {
			if (typeof entry === 'number') return false;
			return entry.stat === cropSpecificStat;
		});
		return Object.fromEntries(filtered) as BreakdownRecord;
	});

	const cropSpecificFortune = $derived.by(() =>
		Object.values(cropFortuneBreakdown).reduce<number>((sum, entry) => {
			return sum + (typeof entry === 'number' ? entry : entry.value);
		}, 0)
	);
</script>

<section class="flex flex-col items-center gap-4 rounded-lg border bg-card p-6">
	<h2 class="text-2xl font-bold">{title}</h2>

	<div
		class="grid w-full gap-4 rounded-lg bg-muted/20 py-4 {showFortuneBreakdown
			? 'grid-cols-1 md:grid-cols-2'
			: 'grid-cols-1'}"
	>
		<div class="flex flex-col items-center gap-2">
			<span class="text-xs font-bold text-muted-foreground">Total Fortune</span>
			{#if showFortuneBreakdown}
				<FortuneBreakdown
					title="Total Fortune Breakdown"
					total={context.effectiveFortune}
					breakdown={totalFortuneBreakdown}
				/>
			{:else}
				<span class="text-4xl font-black text-primary">{context.effectiveFortune.toFixed(0)}</span>
			{/if}
		</div>
		{#if showFortuneBreakdown}
			<div class="flex flex-col items-center gap-2">
				<span class="text-xs font-bold text-muted-foreground"
					>{getCropDisplayName(selectedCropKey ?? Crop.Wheat)} Fortune</span
				>
				<FortuneBreakdown
					title="{getCropDisplayName(selectedCropKey ?? Crop.Wheat)} Fortune Breakdown"
					total={cropSpecificFortune}
					breakdown={cropFortuneBreakdown}
				/>
			</div>
		{/if}
	</div>

	<hr class="w-full" />

	<div class="flex w-full flex-col gap-4">
		<h3 class="text-lg font-bold">Expected Rates</h3>
		{#if context.result}
			<div class="flex flex-col gap-3">
				<div class="flex items-center justify-between rounded-md bg-muted/30 p-3">
					<span class="font-semibold">NPC Profit</span>
					<CoinsBreakdown coins={context.result.npcCoins} />
				</div>
				<BazaarRates
					result={context.result}
					crop={selectedCropKey}
					amount={context.result.items[selectedCropKey] ?? context.result.collection}
					otherCoins={context.result.npcCoins -
						(context.result.items[selectedCropKey] ?? context.result.collection) * context.result.npcPrice}
				/>
				<div class="flex items-center justify-between rounded-md bg-muted/30 p-3">
					<span class="font-semibold">Collection</span>
					<span class="text-xl font-bold">{context.result.collection.toLocaleString()}</span>
				</div>

				<div class="rounded-md bg-muted/20 p-3">
					<p class="mb-2 text-sm font-semibold">Coin Sources</p>
					<div class="flex flex-col gap-1 text-sm">
						{#each context.coinBreakdown as [name, value] (name)}
							<div class="flex items-center justify-between">
								<span
									>{name === 'Collection'
										? getCropDisplayName(selectedCropKey ?? Crop.Wheat)
										: name}</span
								>
								<CoinsBreakdown coins={value} />
							</div>
						{/each}
					</div>
				</div>

				<div class="rounded-md bg-muted/20 p-3">
					<p class="mb-2 text-sm font-semibold">Collection Sources</p>
					<div class="flex flex-col gap-1 text-sm">
						{#each context.collectionBreakdown as [name, value] (name)}
							<div class="flex items-center justify-between">
								<span
									>{name === 'Normal'
										? getCropDisplayName(selectedCropKey ?? Crop.Wheat)
										: name}</span
								>
								<span>{value.toLocaleString()}</span>
							</div>
						{/each}
					</div>
				</div>

				{#if context.result.specialCropBonus > 0}
					<div class="text-center text-xs text-progress">
						+{(context.result.specialCropBonus * 100).toFixed(1)}% Special Crop Bonus Active
					</div>
				{/if}
			</div>
		{:else}
			<p class="py-8 text-center text-muted-foreground italic">Select a crop to see rates</p>
		{/if}
	</div>
</section>
