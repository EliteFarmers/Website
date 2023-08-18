<script lang="ts">
	import type { ApexOptions } from 'apexcharts';
	import { onMount } from 'svelte';

	export let options: ApexOptions;

	onMount(async () => {
		const { default: ApexCharts } = await import('apexcharts');
		const chart = new ApexCharts(document.querySelector('.graph'), options);
		chart.render();
	});
</script>

<div class="mx-4 dark:!text-white">
	<div class="graph" />
</div>
