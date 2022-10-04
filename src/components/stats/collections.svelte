<script lang="ts">
	import type { WeightInfo } from '$db/models/users';
	import { PROPER_CROP_NAME } from '$lib/constants/crops';
	import type { ProfileMember } from '$lib/skyblock';
	import CollectionBar from './collectionbar.svelte';

	export let member: ProfileMember;
	export let weight: WeightInfo;

	const collections = Object.entries(member.collection ?? {})
		.filter(([key]) => PROPER_CROP_NAME[key])
		.map(([key, value]) => ({ name: PROPER_CROP_NAME[key], value, tier: member.collection_tiers?.[key] ?? 0 }));
</script>

<section class="py-4">
	<div class="flex justify-center align-middle">
		<div class="w-[90%]">
			{#each collections as item}
				<CollectionBar {...item} weight={weight?.farming?.sources?.[item.name ?? ''] ?? 0} />
			{/each}
		</div>
	</div>
</section>
