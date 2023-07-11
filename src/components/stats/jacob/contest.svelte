<script lang="ts">
	import type { components } from '$lib/eliteapi/api';
	import { getReadableSkyblockDate } from '$lib/format';

	export let contest: components['schemas']['ContestParticipationDto'];

	$: ({ crop, position, participants, collected, timestamp, medal } = contest);

	$: cropName = crop ?? 'Not Found';
	$: ranking = position && position !== -1;
</script>

<a href="/contest/{timestamp}" data-sveltekit-preload-data="off" class="p-2 flex flex-col hover:shadow-lg hover:bg-gray-100 dark:hover:bg-zinc-900 gap-0.5 rounded-md bg-gray-200 dark:bg-zinc-700 border-l-4 {crop?.replace(' ', '')}">
	<h3 class="first-letter:uppercase text-sm">
		<span class="p-0.5 px-1.5 bg-gray-100 dark:bg-zinc-800 rounded-md">{cropName}</span>
		<span class="text-sm font-semibold">{ranking ? `#${(position ?? -2) + 1}` : 'Unclaimed'}</span>
		<span class="text-xs">{ranking ? `/ ${participants}` : ''}</span>
	</h3>
	<h3 class="text-lg font-semibold">
		{#if medal === 'gold'}
			<img class="inline-block w-5 h-5" src="/images/medals/gold.webp" alt="Earned Medal" />
		{:else if medal === 'silver'}
			<img class="inline-block w-5 h-5" src="/images/medals/silver.webp" alt="Earned Medal" />
		{:else if medal === 'bronze'}
			<img class="inline-block w-5 h-5" src="/images/medals/bronze.webp" alt="Earned Medal" />
		{/if}
		{(collected ?? 0).toLocaleString()}
	</h3>
	<h6 class="text-xs font-mono font-semibold">{getReadableSkyblockDate(timestamp ?? 0)}</h6>
</a>

<style lang="postcss">
	img {
		image-rendering: pixelated;
		aspect-ratio: 1 / 1;
	}

	.Cactus {
		@apply border-cactus;
	}

	.Carrot {
		@apply border-carrot;
	}

	.CocoaBeans {
		@apply border-cocoa;
	}

	.Melon {
		@apply border-melon;
	}

	.Mushroom {
		@apply border-mushroom;
	}

	.NetherWart {
		@apply border-netherwart;
	}

	.Potato {
		@apply border-potato;
	}

	.Pumpkin {
		@apply border-pumpkin;
	}

	.SugarCane {
		@apply border-sugarcane;
	}

	.Wheat {
		@apply border-wheat;
	}
</style>
