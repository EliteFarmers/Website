<script lang="ts">
	import type { components } from '$lib/api/api';
	import Cropstats from './cropstats.svelte';
	import Medals from './medals.svelte';
	import Recents from './recents.svelte';
	import Stats from './stats.svelte';

	export let jacob: components['schemas']['JacobDataDto'] | undefined;
	export let ign: string;
	export let ranks: {
		bronze: number;
		silver: number;
		gold: number;
		platinum: number;
		diamond: number;
		participations: number;
		firstPlaces: number;
	} = {
		bronze: -1,
		silver: -1,
		gold: -1,
		platinum: -1,
		diamond: -1,
		participations: -1,
		firstPlaces: -1,
	};
</script>

<section class="py-4 flex-col gap-4 justify-center align-middle mx-2 mb-8" aria-labelledby="Jacob">
	<h1 id="Jacob" class="text-3xl text-center pt-2">{ign} &nbsp;-&nbsp; Jacob Stats</h1>

	<div class="flex flex-row justify-center my-8 items-center">
		<Cropstats {jacob} />
	</div>

	<div class="flex flex-col lg:flex-row gap-4 md:gap-8 justify-center items-center">
		<div class="flex-1 lg:max-w-2xl">
			<Medals total={jacob?.medals} earned={jacob?.earnedMedals} {ranks} />

			<Stats {jacob} participationsRank={ranks.participations} firstPlacesRank={ranks.firstPlaces} />
		</div>
		<div class="flex-1 lg:max-w-2xl">
			<Recents contests={jacob?.contests} />
		</div>
	</div>
</section>
