<script lang="ts">
	import type { WeightInfo } from '$db/models/users';
	import { PROPER_CROP_NAME, PROPER_CROP_TO_MINION } from '$lib/constants/crops';
	import type { ProfileMember } from '$lib/skyblock';
	import CollectionBar from './collectionbar.svelte';

	export let member: ProfileMember;
	export let weight: WeightInfo;

	const collections = Object.entries(member.collection ?? {})
		.filter(([key]) => PROPER_CROP_NAME[key])
		.map(([key, value]) => ({ name: PROPER_CROP_NAME[key], value, minionTierField: 0 }))
		.sort((a, b) => a.name?.localeCompare(b.name ?? '') ?? 0);

	for (const collection of collections) {
		if (!collection.name) continue;
		const minion = PROPER_CROP_TO_MINION[collection.name] ?? 'no';
		collection.minionTierField = member.minions[minion] ?? 0;
	}
</script>

<section class="py-4">
	<div class="flex justify-center align-middle">
		<div class="w-[90%] md:w-[70%]">
			{#each collections as item}
				<CollectionBar {...item} weight={weight?.farming?.sources?.[item.name ?? ''] ?? 0} />
			{/each}
		</div>
	</div>
</section>
