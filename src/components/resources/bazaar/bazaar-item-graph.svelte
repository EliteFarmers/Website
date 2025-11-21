<script lang="ts">
	import type { GetBazaarProductHistoryResponse } from '$lib/api';
	import { curveBumpX } from 'd3-shape';
	import { BarChart, Spline, Tooltip } from 'layerchart';

	interface Props {
		history: GetBazaarProductHistoryResponse;
	}

	let { history }: Props = $props();

	const data = $derived(history.history ?? []);
</script>

<div class="grid-stack grid h-[300px] rounded-sm p-4">
	<BarChart
		{data}
		x="timestamp"
		y={['buyOrderPrice', 'sellOrderPrice', 'instaBuyPrice', 'instaSellPrice']}
		padding={{ left: 16, bottom: 16 }}
		yDomain={null}
		props={{
			xAxis: { ticks: 10, rule: true },
			tooltip: { context: { mode: 'band' } },
		}}
		renderContext="svg"
	>
		{#snippet marks()}
			<Spline y="buyOrderPrice" class="stroke-primary/70 stroke-3" curve={curveBumpX} />
			<Spline y="sellOrderPrice" class="stroke-link/70 stroke-3" curve={curveBumpX} />
			<Spline y="instaBuyPrice" class="stroke-accent/70 stroke-3" curve={curveBumpX} />
			<Spline y="instaSellPrice" class="stroke-completed/70 stroke-3" curve={curveBumpX} />
		{/snippet}

		{#snippet tooltip({ context })}
			<Tooltip.Root {context}>
				{#snippet children({ data })}
					<Tooltip.Header value={data.timestamp} format="hour" />
					<Tooltip.List>
						<Tooltip.Item label="Buy Order" value={data.buyOrderPrice} format="currency" />
						<Tooltip.Item label="Sell Order" value={data.sellOrderPrice} format="currency" />
						<Tooltip.Item label="Insta Buy" value={data.instaBuyPrice} format="currency" />
						<Tooltip.Item label="Insta Sell" value={data.instaSellPrice} format="currency" />
					</Tooltip.List>
				{/snippet}
			</Tooltip.Root>
		{/snippet}
	</BarChart>
</div>
