<script lang="ts">
	import type { WeightInfo } from '$db/models/users';
	import { PROPER_CROP_NAME, PROPER_CROP_TO_MINION } from '$lib/constants/crops';
	import type { ProfileMember } from '$lib/skyblock';
	import CollectionBar from './collectionbar.svelte';

	export let member: ProfileMember;
	export let weight: WeightInfo;

	const collections = Object.entries(member.collection ?? {})
		.filter(([key]) => PROPER_CROP_NAME[key])
		.map(([key, value]) => ({ name: PROPER_CROP_NAME[key], value, minionTierField: 0, weight: 0 }));

	for (const collection of collections) {
		if (!collection.name) continue;

		const minion = PROPER_CROP_TO_MINION[collection.name] ?? 'no';
		collection.minionTierField = member.minions[minion] ?? 0;
		collection.weight = weight?.farming?.sources?.[collection.name] ?? 0;
	}

	let list = collections.sort((a, b) => b.weight - a.weight);

	let weightSort = true;
	function swap() {
		weightSort = !weightSort;
		list = [];
		setTimeout(() => {
			list = weightSort
				? collections.sort((a, b) => b.weight - a.weight)
				: collections.sort((a, b) => a.name?.localeCompare(b.name ?? '') ?? 0);
		}, 0);
	}
</script>

<section class="py-4">
	<div class="flex justify-center align-middle">
		<div class="w-[90%] md:w-[70%]">
			<button
				class="ml-2 -mt-4 py-1 rounded-md w-20 bg-gray-100 dark:bg-zinc-800 whitespace-nowrap text-sm hover:font-semibold"
				on:click={swap}>{weightSort ? 'Weight ↓' : 'A-Z ↓'}</button
			>
			{#each list as item}
				<CollectionBar {...item} />
			{/each}
		</div>
	</div>
</section>
