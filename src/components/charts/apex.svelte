<script lang="ts">
	import { onMount } from 'svelte';
	import type ApexCharts from 'apexcharts';
	import { Spinner } from 'flowbite-svelte';

	export let options: ApexCharts.ApexOptions;

	let charts: typeof ApexCharts | null = null;
	let loaded = false;

	const apex = (node: HTMLElement, options: ApexCharts.ApexOptions) => {
		if (!charts || !loaded) return;

		const chart = new charts(node, options);
		chart.render();

		return {
			update: (newOptions: ApexCharts.ApexOptions) => {
				chart.updateOptions(newOptions, true);
			},
			destroy: chart.destroy,
		};
	};

	onMount(render);

	async function render() {
		const { default: ApexCharts } = await import('apexcharts');

		charts = ApexCharts;
		loaded = true;
	}
</script>

<div class="flex max-w-6xl w-full justify-center items-center">
	{#if loaded}
		<div class="w-full chart" use:apex={options} />
	{:else}
		<Spinner />
	{/if}
</div>
