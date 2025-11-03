<script lang="ts">
	import { getBadges } from '$lib/remote';

	const badges = getBadges();
</script>

<div class="flex flex-col gap-4">
	{#each badges.current ?? [] as badge, i (i)}
		<div class="flex flex-row items-center gap-4">
			{#if badge.image?.url}
				<img src={badge.image.url} alt={badge.name} class="h-6 w-18 rounded-sm object-cover md:h-8 md:w-24" />
			{/if}
			<div class="flex max-w-md flex-1 flex-col gap-1">
				<p class="text-lg font-semibold">{badge.name}</p>
				<p>{badge.description}</p>
			</div>
			<div class="flex max-w-md flex-1 flex-col gap-1">
				<p class="mt-1 font-semibold">Requirements</p>
				<p>{badge.requirements}</p>
			</div>
		</div>
	{/each}
</div>
