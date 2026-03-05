<script lang="ts">
	import RangeStripe from '$comp/resources/charts/range-stripe.svelte';
	import type { GetAuctionPriceHistoryResponse } from '$lib/api';
	import { scalePow } from 'd3-scale';
	import { curveBumpX } from 'd3-shape';
	import { Area, AreaChart, Bars, Spline, Tooltip } from 'layerchart';

	interface Props {
		histories: Record<string, GetAuctionPriceHistoryResponse | undefined>;
		variant?: string;
	}

	let { histories, variant }: Props = $props();

	const data = $derived.by(() => {
		const key = variant ?? 'default';
		return histories[key]?.history ?? histories[Object.keys(histories)[0]]?.history ?? [];
	});

	const hasData = $derived.by(() => data.length > 0);
	const rangeSignature = $derived.by(
		() => `${variant ?? 'default'}:${data.length}:${data[0]?.timestamp ?? ''}:${data[data.length - 1]?.timestamp ?? ''}`
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
	const maxVolume = $derived.by(() => {
		if (visibleData.length === 0) return 1;
		return Math.max(1, ...visibleData.map((d) => d.binListings ?? 0));
	});

	$effect(() => {
		rangeSignature;
		rangeStart = 0;
		rangeEnd = data.length;
		rangeDebouncedStart = 0;
		rangeDebouncedEnd = data.length;
	});

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

	function integerFormatter(value: number | null | undefined): string {
		if (value === null || value === undefined || Number.isNaN(value)) {
			return 'N/A';
		}
		return Math.round(value).toLocaleString();
	}
</script>

{#if hasData}
	<div class="w-full rounded-sm border p-4">
		<AreaChart
			data={visibleData}
			x="timestamp"
			y={['lowestBinPrice', 'averageBinPrice', 'lowestSalePrice', 'averageSalePrice']}
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
				<Bars
					y="binListings"
					yScale={scalePow([0, maxVolume], [0, 0.22])}
					class="fill-muted stroke-none opacity-30"
					radius={2}
				/>

				<Spline y="lowestBinPrice" class="stroke-primary stroke-2" curve={curveBumpX} />
				<Area y0={0} y1="lowestBinPrice" class="fill-primary/10 stroke-none" curve={curveBumpX} />

				<Spline y="averageBinPrice" class="stroke-link stroke-2" curve={curveBumpX} />
				<Area y0={0} y1="averageBinPrice" class="fill-link/10 stroke-none" curve={curveBumpX} />

				<Spline y="lowestSalePrice" class="stroke-accent stroke-2" curve={curveBumpX} />
				<Spline y="averageSalePrice" class="stroke-completed stroke-2" curve={curveBumpX} />
			{/snippet}

			{#snippet tooltip({ context })}
				<Tooltip.Root {context} x="data" y="pointer">
					{#snippet children({ data })}
						<Tooltip.Header value={data?.timestamp} format="daytime" />
						<Tooltip.List>
							<Tooltip.Item
								label="Lowest BIN"
								value={data?.lowestBinPrice}
								format={coinsFormatter}
								color="var(--color-primary)"
							/>
							<Tooltip.Item
								label="Average BIN"
								value={data?.averageBinPrice}
								format={coinsFormatter}
								color="var(--color-link)"
							/>
							<Tooltip.Item
								label="Lowest Sale"
								value={data?.lowestSalePrice}
								format={coinsFormatter}
								color="var(--color-accent)"
							/>
							<Tooltip.Item
								label="Average Sale"
								value={data?.averageSalePrice}
								format={coinsFormatter}
								color="var(--color-completed)"
							/>
							<Tooltip.Item
								label="BIN Listings"
								value={data?.binListings}
								format={integerFormatter}
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
	<div class="text-muted-foreground flex h-[400px] w-full items-center justify-center rounded-sm border border-dashed">
		No auction history available.
	</div>
{/if}
