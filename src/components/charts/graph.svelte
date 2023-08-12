<script lang="ts">
	import type { components } from "$lib/api/api";
	import { onMount } from "svelte";
	import type { LineChart } from '@carbon/charts-svelte';

	export let points: components['schemas']['CropCollectionsDataPointDto'][];

	let chart: typeof LineChart;

	$: errored = false;
	$: data = points.map(p => {
		const crops = Object.entries(p.crops ?? {});
		const date = new Date((p.timestamp ?? 0) * 1000).toUTCString();

		console.log(date);

		return crops.map(([crop, value]) => ({
			group: crop,
			value: value ?? 0,
			date,
		}));
	}).flat();

	onMount(async () => {
		const charts = await import('@carbon/charts-svelte');
		chart = charts.LineChart;
	});
</script>

{#if errored}
	<p>Failed to load graph data.</p>
{/if}
<div class="graph mx-4">
	<svelte:component
		this={chart}
		{data}
		options={{
			theme: 'g90',
			title: 'Crop Collections',
			height: '400px',
			axes: {
				left: { 
					mapsTo: 'value',
					scaleType: 'linear',
					title: 'Amount',
				},
				bottom: { 
					mapsTo: 'date', 
					scaleType: 'time',
					title: 'Date',
				}
			}
		}} />
</div>

<style global>
    @layer chart;
    @import "@carbon/styles/css/styles.css" layer(chart);
    @import "@carbon/charts/styles.css" layer(chart);    
</style>