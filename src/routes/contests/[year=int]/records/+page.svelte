<script lang="ts">
	import type { PageData } from './$types';
	import Croprecords from '$comp/stats/contests/croprecords.svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

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

	let crops = $derived(
		Object.entries(data.crops ?? {}).map(([crop, entries]) => ({
			crop: cropNames[crop as keyof typeof cropNames] as string,
			entries,
		}))
	);
</script>

{#if crops.length === 0}
	<div class="mb-16 flex flex-col items-center justify-center space-y-2 p-4">
		<h2 class="text-center text-3xl font-semibold">No Contests Found</h2>
		<h4>Try a different timestamp!</h4>
		<p>Data will be loaded once a player has participated in one of these contests!</p>
	</div>
{/if}

{#each crops as { crop, entries } (`${data.year}${crop}`)}
	<Croprecords {crop} {entries} />
{/each}
