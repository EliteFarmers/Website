<script lang="ts">
	import { getStatsContext } from '$lib/stores/stats.svelte';
	import CropStats from './crop-stats.svelte';
	import Cropstats from './cropstats.svelte';
	import Medals from './medals.svelte';
	import Stats from './stats.svelte';

	const ctx = getStatsContext();
	const name = $derived(ctx.ignMeta);
</script>

<section
	class="mx-2 mb-8 flex w-full flex-col items-center justify-center gap-4 py-4 align-middle"
	aria-labelledby="Jacob"
>
	<h1
		id="Jacob"
		class="w-fit max-w-full rounded-md bg-background px-3 py-2 text-center font-emoji text-4xl text-foreground"
	>
		{name} &nbsp;-&nbsp; Jacob Stats
	</h1>

	<Cropstats class="my-8" />
	<Medals />
	<Stats />

	<CropStats />
</section>
