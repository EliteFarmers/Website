<script lang="ts">
	import { compact, type breakdown } from '$lib/tools/global-stats';
	import * as Card from '$ui/card';

	let {
		title,
		rows,
		unit,
		crops = false,
		pests = false,
	}: {
		title: string;
		rows: ReturnType<typeof breakdown>;
		unit: string;
		crops?: boolean;
		pests?: boolean;
	} = $props();
	const cropTokens: Record<string, string> = { cane: 'sugarcane', wart: 'netherwart', seeds: 'wheat' };
	const cropImages: Record<string, string> = { cane: 'sugarcane', wart: 'netherwart' };
	const pestImages: Record<string, string> = { worm: 'earthworm', lunarmoth: 'lunar_moth' };
	let total = $derived(rows.reduce((sum, row) => sum + row.value, 0));
</script>

<Card.Root class="@container min-w-0 gap-4 rounded-md border-2 p-4 shadow-none md:p-5">
	<div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b pb-3">
		<h2 class="text-lg">{title}</h2>
		<p class="text-sm tabular-nums" title={`${total.toLocaleString('en')} ${unit}`}>
			<span class="text-xs text-muted-foreground">Total</span>
			<span class="font-semibold">{compact(total)}</span>
			<span class="text-xs text-muted-foreground">{unit}</span>
		</p>
	</div>
	{#if rows.some((row) => row.value > 0)}
		<ol class="grid grid-cols-1 gap-x-6 gap-y-4 @min-[28rem]:grid-cols-2" aria-label={`${title}, ${unit}`}>
			{#each rows.filter((row) => row.value > 0) as row (row.key)}
				<li class="min-w-0 space-y-1.5">
					<div class="flex min-h-6 items-center gap-2 text-sm">
						{#if crops || pests}
							<img
								src={crops
									? `/images/crops/${cropImages[row.key] ?? row.key}.png`
									: `/images/pests/${pestImages[row.key] ?? row.key}.png`}
								alt=""
								width="24"
								height="24"
								class="pixelated size-6 shrink-0 object-contain"
								loading="lazy"
							/>
						{/if}
						<span>{row.label}</span>
					</div>
					<div class="flex items-baseline justify-between gap-3 text-sm tabular-nums">
						<span title={`${row.value.toLocaleString('en')} ${unit}`}>
							{compact(row.value)}
						</span>
						<span class="text-xs text-muted-foreground">{row.share.toFixed(1)}%</span>
					</div>
					<div class="h-1.5 overflow-hidden rounded-xs bg-muted" aria-hidden="true">
						<div
							class="h-full rounded-xs"
							style:width={`${row.share}%`}
							style:background={crops
								? `var(--color-${cropTokens[row.key] ?? row.key}, var(--progress))`
								: 'var(--progress)'}
						></div>
					</div>
				</li>
			{/each}
		</ol>
	{:else}
		<p class="py-8 text-sm text-muted-foreground">No recorded {unit.toLowerCase()} for this period.</p>
	{/if}
</Card.Root>
