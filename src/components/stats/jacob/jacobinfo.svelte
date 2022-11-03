<script lang="ts">
	import type { JacobData } from '$lib/skyblock';
	import Medals from './medals.svelte';
	import Recents from './recents.svelte';
	import Stats from './stats.svelte';

	export let jacob: JacobData;
	export let ign: string;
</script>

<section class="py-4 flex justify-center align-middle" aria-labelledby="Jacob">
	<div class="w-[90%] md:w-[70%] bg-gray-100 dark:bg-zinc-800 rounded-lg p-4">
		<h1 id="Jacob" class="text-3xl text-center pt-2">{ign} | Jacob Stats</h1>

		<Medals total={jacob.medals} earned={jacob.earned_medals} />

		<Stats {jacob} />

		<Recents contests={jacob.contests} />
	</div>
</section>
