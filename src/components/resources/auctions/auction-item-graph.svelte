<script lang="ts">
	import type { GetAuctionPriceHistoryResponse } from '$lib/api';
	import { scalePow } from 'd3-scale';
	import { curveBumpX } from 'd3-shape';
	import { BarChart, Spline, Tooltip } from 'layerchart';

	interface Props {
		histories: Record<string, GetAuctionPriceHistoryResponse | undefined>;
	}

	let { histories }: Props = $props();

	const data = $derived.by(() => {
		return histories['default']?.history ?? histories[Object.keys(histories)[0]]?.history ?? [];
	});
</script>

<!-- <div class="h-[300px] rounded-sm border p-4">
	<LineChart
		data={histories['default']?.history ?? []}
		x="timestamp"
		series={[
			{ key: 'lowestBinPrice', color: 'var(--color-link)' },
			{ key: 'averageBinPrice', color: 'var(--color-link)' },
			{ key: 'lowestSalePrice', color: 'var(--color-link)' },
		]}
		onPointClick={(e, detail) => {
			console.log(e, detail);
			alert(JSON.stringify(detail));
		}}
		brush
	/>
</div> -->

<div class="grid-stack grid h-[300px] rounded-sm p-4">
	<!-- First chart (bar), with different domain scale for volume -->
	<BarChart
		{data}
		x="timestamp"
		y="binListings"
		yScale={scalePow([0, Math.max(...data.map((d) => d.binListings || 0))], [0, 1])}
		axis={false}
		grid={false}
		padding={{ left: 16, bottom: 16 }}
		props={{
			bars: { radius: 1, class: 'stroke-none fill-muted' },
		}}
		renderContext="svg"
	/>

	<!-- Second chart (line), responsible for tooltip -->
	<BarChart
		{data}
		x="timestamp"
		y={['lowestBinPrice', 'averageBinPrice', 'lowestSalePrice', 'averageSalePrice']}
		padding={{ left: 16, bottom: 16 }}
		yDomain={null}
		props={{
			xAxis: { ticks: 10, rule: true },
			tooltip: { context: { mode: 'band' } },
		}}
		renderContext="svg"
	>
		{#snippet marks()}
			<Spline y="lowestBinPrice" class="stroke-primary/70 stroke-3" curve={curveBumpX} />
			<Spline y="averageBinPrice" class="stroke-link/70 stroke-3" curve={curveBumpX} />
			<Spline y="lowestSalePrice" class="stroke-accent/70 stroke-3" curve={curveBumpX} />
			<Spline y="averageSalePrice" class="stroke-completed/70 stroke-3" curve={curveBumpX} />
		{/snippet}

		{#snippet tooltip({ context })}
			<Tooltip.Root {context}>
				{#snippet children({ data })}
					<Tooltip.Header value={data.timestamp} format="hour" />
					<Tooltip.List>
						<Tooltip.Item label="Lowest BIN" value={data.lowestBinPrice} format="currency" />
						<Tooltip.Item label="Average BIN" value={data.averageBinPrice} format="currency" />
						<Tooltip.Item label="Lowest Sale" value={data.lowestSalePrice} format="currency" />
						<Tooltip.Item label="Average Sale" value={data.averageSalePrice} format="currency" />
						<Tooltip.Item label="Volume" value={data.binListings} format="integer" />
					</Tooltip.List>
				{/snippet}
			</Tooltip.Root>
		{/snippet}
	</BarChart>
</div>
