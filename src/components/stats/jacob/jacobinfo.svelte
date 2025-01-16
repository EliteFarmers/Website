<script lang="ts">
	import type { components } from '$lib/api/api';
	import Cropstats from './cropstats.svelte';
	import Medals from './medals.svelte';
	import Recents from './recents.svelte';
	import Stats from './stats.svelte';

	interface Props {
		jacob: components['schemas']['JacobDataDto'] | undefined;
		ign: string;
		ranks?: {
			bronze: number;
			silver: number;
			gold: number;
			platinum: number;
			diamond: number;
			participations: number;
			firstPlaces: number;
		};
	}

	let {
		jacob,
		ign,
		ranks = {
			bronze: -1,
			silver: -1,
			gold: -1,
			platinum: -1,
			diamond: -1,
			participations: -1,
			firstPlaces: -1,
		},
	}: Props = $props();
</script>

<section class="mx-2 mb-8 flex-col justify-center gap-4 py-4 align-middle" aria-labelledby="Jacob">
	<h1 id="Jacob" class="pt-2 text-center text-4xl">{ign} &nbsp;-&nbsp; Jacob Stats</h1>

	<div class="my-8 flex flex-row items-center justify-center">
		<Cropstats {jacob} />
	</div>

	<div class="flex flex-col items-center justify-center gap-4 md:gap-8 lg:flex-row lg:items-start">
		<div class="flex-1 lg:max-w-2xl">
			<Medals total={jacob?.medals} earned={jacob?.earnedMedals} {ranks} />

			<Stats {jacob} participationsRank={ranks.participations} firstPlacesRank={ranks.firstPlaces} />
		</div>
		<div class="flex-1 lg:max-w-2xl">
			<Recents contests={jacob?.contests} />
		</div>
	</div>
</section>
