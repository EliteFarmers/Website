<script lang="ts">
	import Loader from '@lucide/svelte/icons/loader';
	import { onMount } from 'svelte';

	interface Props {
		options: unknown;
		animate?: boolean;
	}

	let { options, animate = true }: Props = $props();

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let charts: any = null;
	let loaded = $state(false);

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const apex = (node: HTMLElement, options: any) => {
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
			update: (newOptions: unknown) => {
				chart.updateOptions(newOptions, animate, animate);
			},
			destroy: () => {
				chart.destroy();
			},
		};
	};

	onMount(render);

	async function render() {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		charts = (window as any).ApexCharts;
		loaded = true;
	}
</script>

<svelte:head>
	<script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>
</svelte:head>

<div class="flex w-full max-w-6xl items-center justify-center">
	{#if loaded}
		<div class="chart w-full" use:apex={options}></div>
	{:else}
		<Loader class="my-4 animate-spin" />
	{/if}
</div>
