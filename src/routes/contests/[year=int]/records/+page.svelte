<script lang="ts">
	import type { PageData } from './$types';
	import Croprecords from '$comp/stats/contests/croprecords.svelte';

	export let data: PageData;

	const cropNames = {
		wheat: 'Wheat',
		carrot: 'Carrot',
		potato: 'Potato',
		pumpkin: 'Pumpkin',
		melon: 'Melon',
		cocoa: 'Cocoa Beans',
		cactus: 'Cactus',
		cane: 'Sugar Cane',
		mushroom: 'Mushroom',
		wart: 'Nether Wart',
	};

	$: crops = Object.entries(data.crops).map(([crop, entries]) => ({
		crop: cropNames[crop as keyof typeof cropNames] as string,
		entries,
	}));
</script>

{#if crops.length === 0}
	<div class="flex flex-col items-center justify-center p-4 space-y-2">
		<h2 class="text-3xl font-semibold text-center">No Contests Found</h2>
		<h4>Try a different timestamp!</h4>
		<p>Data will be loaded once a player has participated in one of these contests!</p>
	</div>
{/if}

{#each crops as { crop, entries } (`${data.year}${crop}`)}
	<Croprecords {crop} {entries} />
{/each}
