<script lang="ts">
	import { onMount } from 'svelte';
	import type ApexCharts from 'apexcharts';
	import Loader from 'lucide-svelte/icons/loader';

	interface Props {
		options: ApexCharts.ApexOptions;
		animate?: boolean;
	}

	let { options, animate = true }: Props = $props();

	let charts: typeof ApexCharts | null = null;
	let loaded = $state(false);

	const apex = (node: HTMLElement, options: ApexCharts.ApexOptions) => {
		if (!charts || !loaded) return;

		if (!animate) {
			options.chart = {
				...options.chart,
				animations: {
					...(options.chart?.animations ?? {}),
					enabled: false,
				},
			};
		}

		const chart = new charts(node, options);
		chart.render();

		return {
			update: (newOptions: ApexCharts.ApexOptions) => {
				chart.updateOptions(newOptions, animate, animate);
			},
			destroy: () => {
				chart.destroy();
			},
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
		<div class="w-full chart" use:apex={options}></div>
	{:else}
		<Loader class="animate-spin my-4" />
	{/if}
</div>
