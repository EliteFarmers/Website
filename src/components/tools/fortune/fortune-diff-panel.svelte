<script lang="ts">
	import type { FortuneCompareDiffMode } from '$lib/calc/fortune-compare';
	import * as Tabs from '$ui/tabs';

	interface CompareSummaryRow {
		label: string;
		a: number;
		b: number;
		delta: number;
		percent: string;
		format: (value: number) => string;
	}

	interface BreakdownDiffRow {
		key: string;
		valueA: number;
		valueB: number;
		delta: number;
	}

	interface Props {
		selectedCrop: string;
		sideNameA?: string;
		sideNameB?: string;
		diffMode: FortuneCompareDiffMode;
		compareSummaryRows: CompareSummaryRow[];
		compareCoinSourceDiff: BreakdownDiffRow[];
		compareCollectionSourceDiff: BreakdownDiffRow[];
		formatSigned: (value: number, decimals?: number) => string;
	}

	let {
		selectedCrop,
		sideNameA = 'Side A',
		sideNameB = 'Side B',
		diffMode = $bindable(),
		compareSummaryRows,
		compareCoinSourceDiff,
		compareCollectionSourceDiff,
		formatSigned,
	}: Props = $props();
</script>

<section class="bg-card flex flex-col gap-4 rounded-lg border p-5">
	<div>
		<h2 class="text-xl font-semibold">Comparison</h2>
		<p class="text-muted-foreground text-sm">
			See how {sideNameA} and {sideNameB} differ, or find the value needed to match a metric.
		</p>
	</div>
	<Tabs.Root bind:value={diffMode} class="w-full">
		<Tabs.List class="w-full">
			<Tabs.Trigger value="summary" class="flex-1">Summary</Tabs.Trigger>
			<Tabs.Trigger value="sources" class="flex-1">Sources</Tabs.Trigger>
		</Tabs.List>

		<Tabs.Content value="summary" class="mt-4">
			<div class="grid grid-cols-1 gap-2">
				{#each compareSummaryRows as row (row.label)}
					<div
						class="bg-muted/20 grid grid-cols-[1fr_auto_auto_auto] items-center gap-2 rounded-md border px-3 py-2 text-sm"
					>
						<span class="font-medium">{row.label}</span>
						<span class="text-muted-foreground">{sideNameA}: {row.format(row.a)}</span>
						<span class="text-muted-foreground">{sideNameB}: {row.format(row.b)}</span>
						<span class={row.delta >= 0 ? 'text-progress font-semibold' : 'text-destructive font-semibold'}>
							{formatSigned(row.delta)} ({row.percent})
						</span>
					</div>
				{/each}
			</div>
			<p class="text-muted-foreground mt-2 text-xs">
				Delta values are calculated as {sideNameB} minus {sideNameA}.
			</p>
		</Tabs.Content>

		<Tabs.Content value="sources" class="mt-4">
			<div class="grid gap-4">
				<section class="rounded-md border p-3">
					<h3 class="mb-2 text-sm font-semibold">Coin Source Deltas ({sideNameB} - {sideNameA})</h3>
					{#if compareCoinSourceDiff.length === 0}
						<p class="text-muted-foreground text-sm">No coin source differences.</p>
					{:else}
						<div class="flex flex-col gap-1 text-sm">
							{#each compareCoinSourceDiff.slice(0, 14) as entry (entry.key)}
								<div class="flex items-center justify-between">
									<span>{entry.key === 'Collection' ? selectedCrop : entry.key}</span>
									<span class={entry.delta >= 0 ? 'text-progress' : 'text-destructive'}>
										{formatSigned(entry.delta)}
									</span>
								</div>
							{/each}
						</div>
					{/if}
				</section>
				<section class="rounded-md border p-3">
					<h3 class="mb-2 text-sm font-semibold">Collection Source Deltas ({sideNameB} - {sideNameA})</h3>
					{#if compareCollectionSourceDiff.length === 0}
						<p class="text-muted-foreground text-sm">No collection source differences.</p>
					{:else}
						<div class="flex flex-col gap-1 text-sm">
							{#each compareCollectionSourceDiff.slice(0, 14) as entry (entry.key)}
								<div class="flex items-center justify-between">
									<span>{entry.key === 'Normal' ? selectedCrop : entry.key}</span>
									<span class={entry.delta >= 0 ? 'text-progress' : 'text-destructive'}>
										{formatSigned(entry.delta)}
									</span>
								</div>
							{/each}
						</div>
					{/if}
				</section>
			</div>
		</Tabs.Content>
	</Tabs.Root>
</section>
