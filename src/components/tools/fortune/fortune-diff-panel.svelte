<script lang="ts">
	import type {
		FortuneBreakEvenScanResult,
		FortuneCompareDiffMode,
		FortuneCompareFieldRange,
		FortuneCompareMetric,
	} from '$lib/calc/fortune-compare';
	import { Button } from '$ui/button';
	import { Input } from '$ui/input';
	import { Label } from '$ui/label';
	import * as Select from '$ui/select';
	import * as Tabs from '$ui/tabs';

	type SideKey = 'A' | 'B';

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
		diffMetric: FortuneCompareMetric;
		diffScanSide: SideKey;
		diffFieldId: string;
		diffRange: FortuneCompareFieldRange;
		diffResult: FortuneBreakEvenScanResult | null;
		diffMessage: string;
		compareSummaryRows: CompareSummaryRow[];
		compareCoinSourceDiff: BreakdownDiffRow[];
		compareCollectionSourceDiff: BreakdownDiffRow[];
		compareMetricOptions: { value: string; label: string }[];
		compareSideOptions: { value: string; label: string }[];
		breakEvenFieldOptions: { value: string; label: string }[];
		currentBreakEvenFieldSectionLabel: string | null;
		onMetricChange: (value?: string) => void;
		onScanSideChange: (value?: string) => void;
		onFieldChange: (value?: string) => void;
		onRangeInput: () => void;
		onRunBreakEven: () => void;
		onApplyBreakEven: () => void;
		formatSigned: (value: number, decimals?: number) => string;
	}

	let {
		selectedCrop,
		sideNameA = 'Side A',
		sideNameB = 'Side B',
		diffMode = $bindable(),
		diffMetric,
		diffScanSide,
		diffFieldId,
		diffRange = $bindable(),
		diffResult,
		diffMessage,
		compareSummaryRows,
		compareCoinSourceDiff,
		compareCollectionSourceDiff,
		compareMetricOptions,
		compareSideOptions,
		breakEvenFieldOptions,
		currentBreakEvenFieldSectionLabel,
		onMetricChange,
		onScanSideChange,
		onFieldChange,
		onRangeInput,
		onRunBreakEven,
		onApplyBreakEven,
		formatSigned,
	}: Props = $props();

	const scanSideName = $derived.by(() => (diffScanSide === 'A' ? sideNameA : sideNameB));
	const staticSideName = $derived.by(() => (diffScanSide === 'A' ? sideNameB : sideNameA));
</script>

<section class="bg-card flex flex-col gap-4 rounded-lg border p-5">
	<div>
		<h2 class="text-xl font-semibold">Diff Panel</h2>
		<p class="text-muted-foreground text-sm">
			Compare {sideNameA} against {sideNameB}, then find a value that makes one metric equal on both sides.
		</p>
	</div>
	<Tabs.Root bind:value={diffMode} class="w-full">
		<Tabs.List class="w-full">
			<Tabs.Trigger value="summary" class="flex-1">Summary</Tabs.Trigger>
			<Tabs.Trigger value="sources" class="flex-1">Sources</Tabs.Trigger>
			<Tabs.Trigger value="break-even" class="flex-1">Break-even</Tabs.Trigger>
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

		<Tabs.Content value="break-even" class="mt-4">
			<div class="grid gap-4">
				<section class="bg-muted/20 grid gap-1 rounded-md border p-3 text-sm">
					<p class="font-medium">How break-even works</p>
					<p class="text-muted-foreground">
						Pick a metric, pick which side to adjust, then choose a numeric field and scan range.
					</p>
					<p class="text-muted-foreground">
						The scan changes only {scanSideName}. {staticSideName} stays fixed as your reference side.
					</p>
				</section>
				<div class="grid grid-cols-1 gap-3 md:grid-cols-2">
					<div class="flex flex-col gap-1">
						<Label>Metric</Label>
						<Select.Simple options={compareMetricOptions} value={diffMetric} change={onMetricChange} />
					</div>
					<div class="flex flex-col gap-1">
						<Label>Side To Adjust</Label>
						<Select.Simple options={compareSideOptions} value={diffScanSide} change={onScanSideChange} />
					</div>
					<div class="flex flex-col gap-1 md:col-span-2">
						<Label>Numeric Field To Adjust</Label>
						<Select.Simple options={breakEvenFieldOptions} value={diffFieldId} change={onFieldChange} />
					</div>
				</div>

				<div class="grid grid-cols-3 gap-3">
					<div class="flex flex-col gap-1">
						<Label>Start</Label>
						<Input
							type="number"
							bind:value={diffRange.start}
							oninput={() => {
								onRangeInput();
							}}
						/>
					</div>
					<div class="flex flex-col gap-1">
						<Label>End</Label>
						<Input
							type="number"
							bind:value={diffRange.end}
							oninput={() => {
								onRangeInput();
							}}
						/>
					</div>
					<div class="flex flex-col gap-1">
						<Label>Step</Label>
						<Input
							type="number"
							min="0.0001"
							step="0.01"
							bind:value={diffRange.step}
							oninput={() => {
								onRangeInput();
							}}
						/>
					</div>
				</div>

				<div class="flex flex-wrap gap-2">
					<Button onclick={onRunBreakEven}>Find Break-even Value</Button>
					<Button variant="outline" onclick={onApplyBreakEven} disabled={diffResult?.status !== 'found'}>
						Apply Value To {scanSideName}
					</Button>
				</div>

				{#if diffMessage}
					<p
						class={diffResult?.status === 'found'
							? 'text-progress text-sm'
							: 'text-muted-foreground text-sm'}
					>
						{diffMessage}
					</p>
				{/if}

				{#if diffResult?.status === 'found'}
					<div class="rounded-md border p-3 text-sm">
						<p class="font-medium">Break-even value: {diffResult.value.toFixed(2)}</p>
						<p class="text-muted-foreground">
							{sideNameA} metric: {diffResult.metrics.A.toLocaleString()} | {sideNameB} metric:
							{diffResult.metrics.B.toLocaleString()}
						</p>
					</div>
				{:else if diffResult?.status === 'not-found'}
					<div class="rounded-md border p-3 text-sm">
						<p class="font-medium">No break-even in range.</p>
						<p class="text-muted-foreground">
							Last metrics checked: {sideNameA}
							{diffResult.lastMetrics.A.toLocaleString()} | {sideNameB}
							{diffResult.lastMetrics.B.toLocaleString()}
						</p>
					</div>
				{:else if diffResult?.status === 'invalid-range'}
					<div class="rounded-md border p-3 text-sm">
						<p class="font-medium">Invalid scan range.</p>
						<p class="text-muted-foreground">Use numeric start/end values and a positive step.</p>
					</div>
				{/if}

				{#if currentBreakEvenFieldSectionLabel}
					<p class="text-muted-foreground text-xs">
						Field section: {currentBreakEvenFieldSectionLabel}. If this section is linked on {sideNameB},
						the first edit auto-unlinks it from {sideNameA}.
					</p>
				{/if}
			</div>
		</Tabs.Content>
	</Tabs.Root>
</section>
