<script lang="ts">
	import type { RatesItemPriceData } from '$lib/api/elite';
	import { Button } from '$ui/button';
	import Settings from '@lucide/svelte/icons/settings';
	import type { PestFarmingRateResult, PestRatePriceBook } from 'farming-weight';
	import PestRateBreakdownDialog from './pest-rate-breakdown-dialog.svelte';
	import { buildPestRateBreakdown } from './pest-rate-breakdown-model';

	interface Props {
		result: PestFarmingRateResult;
		priceBook: PestRatePriceBook;
		items: RatesItemPriceData;
		openSettings: () => void;
		referenceOnlyPrices?: boolean;
	}

	let { result, priceBook, items, openSettings, referenceOnlyPrices = false }: Props = $props();

	function formatNumber(value: number, maximumFractionDigits = 0) {
		return value.toLocaleString(undefined, { maximumFractionDigits });
	}

	function formatRate(value: number) {
		return `${formatNumber(value)}/hr`;
	}

	function formatSignedRate(value: number) {
		return `${value > 0 ? '+' : ''}${formatRate(value)}`;
	}

	function formatDuration(seconds: number) {
		const totalSeconds = Math.max(0, Math.round(seconds));
		const minutes = Math.floor(totalSeconds / 60);
		const remainingSeconds = totalSeconds % 60;
		return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`;
	}

	function getRateShare(value: number, total: number) {
		if (!Number.isFinite(value) || !Number.isFinite(total) || total === 0) return 0;
		return Math.min(100, (Math.abs(value) / Math.abs(total)) * 100);
	}

	const model = $derived(
		buildPestRateBreakdown({
			result,
			priceBook,
			items,
			formatNumber,
			formatDuration,
		})
	);
</script>

<section class="flex flex-col gap-4">
	<header class="flex flex-col justify-between gap-3 border-b pb-3 md:flex-row md:items-end">
		<div class="flex flex-col gap-1">
			<h2 class="text-xl leading-tight font-semibold">Rate Breakdown</h2>
			<p class="text-muted-foreground text-sm tabular-nums">
				{formatNumber(result.breakdown.pestSpawning.pestsPerInterval * result.debug.intervalsPerHour, 1)} pests/hr
				<span class="px-1">·</span>
				{formatNumber((result.debug.farmBlocks + result.debug.spawnBlocks) * result.debug.cyclesPerHour)} crop blocks/hr
			</p>
		</div>
		<Button variant="outline" size="sm" onclick={openSettings} class="self-start md:self-auto">
			<Settings class="size-4" />
			Settings
		</Button>
	</header>

	<div class="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
		<div class="flex flex-col gap-3">
			<div class="bg-card rounded-lg border px-4 py-3 {referenceOnlyPrices ? 'opacity-60' : ''}">
				<p class="text-muted-foreground text-xs font-medium">Total Coins</p>
				<p class="font-mono text-2xl leading-tight font-semibold tabular-nums">
					{formatRate(result.valuation.coinsPerHour)}
				</p>
			</div>

			<div class="bg-card h-fit overflow-hidden rounded-lg border">
				<div
					class="bg-muted/30 text-muted-foreground grid grid-cols-[minmax(0,1fr)_8rem] gap-3 border-b px-4 py-3 text-xs font-semibold uppercase sm:grid-cols-[minmax(0,1fr)_8rem_5rem]"
				>
					<span>Source</span>
					<span class="text-right">Coins/hr</span>
					<span class="hidden text-right sm:block"></span>
				</div>
				<div class="divide-y">
					{#each model.rows as row (row.key)}
						{@const share = getRateShare(row.value, result.valuation.coinsPerHour)}
						<div
							class="hover:bg-muted/30 grid gap-3 px-4 py-3 transition-colors sm:grid-cols-[minmax(0,1fr)_8rem_5rem] sm:items-center"
						>
							<div class="min-w-0">
								<div class="flex items-center justify-between gap-3">
									<p class="font-medium">{row.label}</p>
									<p class="text-muted-foreground shrink-0 text-xs tabular-nums sm:hidden">
										{formatNumber(share, 1)}%
									</p>
								</div>
								<p class="text-muted-foreground mt-0.5 text-xs">{row.detail}</p>
								<div class="bg-muted mt-2 h-1.5 overflow-hidden rounded-full">
									<div
										class="{row.value < 0 ? 'bg-destructive' : 'bg-primary'} h-full rounded-full"
										style:width="{share}%"
									></div>
								</div>
							</div>
							<div class="text-left sm:text-right">
								<p
									class="{row.value < 0
										? 'text-destructive'
										: referenceOnlyPrices
											? 'text-muted-foreground'
											: 'text-foreground'} font-mono text-sm font-semibold tabular-nums"
								>
									{formatRate(row.value)}
								</p>
								<p class="text-muted-foreground hidden text-xs tabular-nums sm:block">
									{formatNumber(share, 1)}%
								</p>
							</div>
							<PestRateBreakdownDialog {row} />
						</div>
					{/each}

					{#if model.displayedDelta !== 0}
						<div
							class="bg-muted/30 grid gap-2 px-4 py-3 text-sm sm:grid-cols-[minmax(0,1fr)_8rem_5rem] sm:items-center"
						>
							<span class="text-muted-foreground">Rounding / Unshown Sources</span>
							<span class="font-mono tabular-nums sm:text-right">
								{formatSignedRate(model.displayedDelta)}
							</span>
							<span></span>
						</div>
					{/if}
				</div>
			</div>

			<div class="bg-card rounded-lg border px-4 py-3">
				<p class="text-muted-foreground text-sm">
					Change
					<button
						type="button"
						class="text-link font-medium underline underline-offset-2 hover:no-underline"
						onclick={openSettings}
					>
						settings
					</button>
					to match your blocks per second, swap time, search time, and pest repellent use.
				</p>
			</div>
		</div>

		<div class="bg-card h-fit rounded-lg border p-4">
			<h3 class="text-sm leading-tight font-semibold">Assumptions</h3>
			<div class="mt-3 divide-y">
				{#each model.summary as metric (metric.label)}
					<div class="flex items-start justify-between gap-3 py-2 first:pt-0 last:pb-0">
						<div class="min-w-0">
							<p class="text-sm font-medium">{metric.label}</p>
							<p class="text-muted-foreground text-xs">{metric.detail}</p>
						</div>
						<p class="font-mono text-sm font-semibold whitespace-nowrap tabular-nums">
							{metric.value}
						</p>
					</div>
				{/each}
				{#each model.cycleAssumptions as metric (metric.label)}
					<div class="flex items-start justify-between gap-3 py-2 first:pt-0 last:pb-0">
						<div class="min-w-0">
							<p class="text-sm font-medium">{metric.label}</p>
							<p class="text-muted-foreground text-xs">{metric.detail}</p>
						</div>
						<p class="font-mono text-sm font-semibold whitespace-nowrap tabular-nums">
							{metric.value}
						</p>
					</div>
				{/each}
			</div>
		</div>
	</div>
</section>
