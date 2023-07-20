<script lang="ts">
	import type { components } from '$lib/api/api';
	import Medals from './medals.svelte';
	import Recents from './recents.svelte';
	import Stats from './stats.svelte';

	export let jacob: components['schemas']['JacobDataDto'] | undefined;
	export let ign: string;
	export let ranks: {
		bronze: number;
		silver: number;
		gold: number;
		participations: number;
		firstPlaces: number;
	} = {
		bronze: -1,
		silver: -1,
		gold: -1,
		participations: -1,
		firstPlaces: -1,
	};
</script>

<section class="py-4 flex justify-center align-middle" aria-labelledby="Jacob">
	<div class="w-[90%] md:w-[70%] bg-gray-100 dark:bg-zinc-800 rounded-lg p-4">
		<h1 id="Jacob" class="text-3xl text-center pt-2">{ign} | Jacob Stats</h1>

		<Medals total={jacob?.medals} earned={jacob?.earnedMedals} {ranks} />

		<Stats {jacob} participationsRank={ranks.participations} firstPlacesRank={ranks.firstPlaces} />

		<Recents contests={jacob?.contests} />
	</div>
</section>
