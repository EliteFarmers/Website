<script lang="ts">
	import type { components } from '$lib/api/api';
	import { onMount } from 'svelte';
	import type { LineChart } from '@carbon/charts-svelte';

	export let points: components['schemas']['SkillsDataPointDto'][];

	let chart: typeof LineChart;

	$: errored = false;
	$: data = points
		.map((p) => {
			const crops = Object.entries(p.skills ?? {});
			const date = new Date((p.timestamp ?? 0) * 1000).toUTCString();

			return crops.map(([crop, value]) => ({
				group: crop,
				value: value ?? 0,
				date,
			}));
		})
		.flat();

	onMount(async () => {
		const charts = await import('@carbon/charts-svelte');
		chart = charts.LineChart;
	});

	let options = {
		theme: 'g90',
		title: 'Skill Experience',
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
			},
		},
	} as LineChart['options'];
</script>

{#if errored}
	<p>Failed to load graph data.</p>
{/if}
<div class="graph mx-4">
	<svelte:component this={chart} {data} {options} />
</div>

<style global lang="postcss">
	@layer chart;
	@import '@carbon/styles/css/styles.css' layer(chart);
	@import '@carbon/charts/styles.css' layer(chart);
</style>
