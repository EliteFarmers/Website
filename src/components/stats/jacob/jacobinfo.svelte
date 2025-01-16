<script lang="ts">
	import { getStatsContext } from '$lib/stores/stats.svelte';
	import Cropstats from './cropstats.svelte';
	import Medals from './medals.svelte';
	import Recents from './recents.svelte';
	import Stats from './stats.svelte';

	const ctx = getStatsContext();
</script>

<section class="mx-2 mb-8 flex-col justify-center gap-4 py-4 align-middle" aria-labelledby="Jacob">
	<h1 id="Jacob" class="pt-2 text-center text-4xl">{ctx.ign} &nbsp;-&nbsp; Jacob Stats</h1>

	<div class="my-8 flex flex-row items-center justify-center">
		<Cropstats />
	</div>

	<div class="flex flex-col items-center justify-center gap-4 md:gap-8 lg:flex-row lg:items-start">
		<div class="flex-1 lg:max-w-2xl">
			<Medals />
			<Stats />
		</div>
		<div class="flex-1 lg:max-w-2xl">
			<Recents />
		</div>
	</div>
</section>
