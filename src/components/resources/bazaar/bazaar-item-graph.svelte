<script lang="ts">
	import RangeStripe from '$comp/resources/charts/range-stripe.svelte';
	import type { GetBazaarProductHistoryResponse } from '$lib/api';
	import { curveBumpX } from 'd3-shape';
	import { Area, AreaChart, Spline, Tooltip } from 'layerchart';
	import { watch } from 'runed';

	interface Props {
		history: GetBazaarProductHistoryResponse;
	}

	let { history }: Props = $props();

	const data = $derived(history.history ?? []);
	const hasData = $derived.by(() => data.length > 0);
	const rangeSignature = $derived.by(
		() => `${data.length}:${data[0]?.timestamp ?? ''}:${data[data.length - 1]?.timestamp ?? ''}`
	);
	const minWindow = $derived.by(() => {
		if (data.length <= 0) return 0;
		return Math.max(8, Math.min(96, Math.floor(data.length * 0.08)));
	});
	let rangeStart = $state(0);
	let rangeEnd = $state(0);
	let rangeDebouncedStart = $state(0);
	let rangeDebouncedEnd = $state(0);
	const visibleData = $derived.by(() => {
		if (data.length === 0) return [];
		const start = Math.max(0, Math.min(rangeDebouncedStart, data.length - 1));
		const end = Math.max(start + 1, Math.min(rangeDebouncedEnd || data.length, data.length));
		return data.slice(start, end);
	});

	watch(
		() => rangeSignature,
		() => {
			rangeStart = 0;
			rangeEnd = data.length;
			rangeDebouncedStart = 0;
			rangeDebouncedEnd = data.length;
		}
	);

	function coinsFormatter(value: number | null | undefined): string {
		if (value === null || value === undefined || Number.isNaN(value)) {
			return 'N/A';
		}

		const amount = value;
		return (
			(Math.floor(amount * 100) / 100).toLocaleString(undefined, {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2,
			}) + ' coins'
		);
	}
</script>

{#if hasData}
	<div class="w-full rounded-sm border p-4">
		<AreaChart
			data={visibleData}
			x="timestamp"
			y={['buyOrderPrice', 'sellOrderPrice', 'instaBuyPrice', 'instaSellPrice']}
			yDomain={null}
			height={360}
			padding={{ left: 16, bottom: 16 }}
			props={{
				xAxis: { ticks: 10, rule: true },
				yAxis: { format: coinsFormatter },
				grid: { x: true, y: true },
				highlight: { area: false, lines: true },
				tooltip: { context: { mode: 'band' } },
			}}
		>
			{#snippet marks()}
				<Spline y="buyOrderPrice" class="stroke-primary stroke-2" curve={curveBumpX} />
				<Area y0={0} y1="buyOrderPrice" class="fill-primary/10 stroke-none" curve={curveBumpX} />

				<Spline y="sellOrderPrice" class="stroke-link stroke-2" curve={curveBumpX} />
				<Area y0={0} y1="sellOrderPrice" class="fill-link/10 stroke-none" curve={curveBumpX} />

				<Spline y="instaBuyPrice" class="stroke-accent stroke-2" curve={curveBumpX} />
				<Spline y="instaSellPrice" class="stroke-completed stroke-2" curve={curveBumpX} />
			{/snippet}

			{#snippet tooltip({ context })}
				<Tooltip.Root {context} x="data" y="pointer">
					{#snippet children({ data })}
						<Tooltip.Header value={data?.timestamp} format="daytime" />
						<Tooltip.List>
							<Tooltip.Item
								label="Buy Order"
								value={data?.buyOrderPrice}
								format={coinsFormatter}
								color="var(--color-primary)"
							/>
							<Tooltip.Item
								label="Sell Order"
								value={data?.sellOrderPrice}
								format={coinsFormatter}
								color="var(--color-link)"
							/>
							<Tooltip.Item
								label="Insta Buy"
								value={data?.instaBuyPrice}
								format={coinsFormatter}
								color="var(--color-accent)"
							/>
							<Tooltip.Item
								label="Insta Sell"
								value={data?.instaSellPrice}
								format={coinsFormatter}
								color="var(--color-completed)"
							/>
						</Tooltip.List>
					{/snippet}
				</Tooltip.Root>
			{/snippet}
		</AreaChart>
		<RangeStripe
			points={data.length}
			bind:start={rangeStart}
			bind:end={rangeEnd}
			bind:debouncedStart={rangeDebouncedStart}
			bind:debouncedEnd={rangeDebouncedEnd}
			{minWindow}
		/>
	</div>
{:else}
	<div class="text-muted-foreground flex h-100 w-full items-center justify-center rounded-sm border border-dashed">
		No bazaar history available.
	</div>
{/if}
