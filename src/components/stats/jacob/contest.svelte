<script lang="ts">
	import type { components } from '$lib/eliteapi/api';
	import { getReadableSkyblockDate } from '$lib/format';

	export let contest: components['schemas']['ContestParticipationDto'];

	const { crop, position, participants, collected, timestamp, medal } = contest;

	const cropName = crop ?? 'Not Found';
	const ranking = position !== undefined;
</script>

<div class="p-2 flex flex-col gap-0.5 rounded-md bg-gray-200 dark:bg-zinc-700 border-l-4 {crop}">
	<h3 class="first-letter:uppercase text-sm">
		<span class="p-0.5 px-1.5 bg-gray-100 dark:bg-zinc-800 rounded-md">{cropName}</span>
		<span class="text-sm font-semibold">{ranking ? `#${position + 1}` : 'Unclaimed'}</span>
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
</div>

<style lang="postcss">
	img {
		image-rendering: pixelated;
		aspect-ratio: 1 / 1;
	}

	.cactus {
		@apply border-cactus;
	}

	.carrot {
		@apply border-carrot;
	}

	.cocoa {
		@apply border-cocoa;
	}

	.melon {
		@apply border-melon;
	}

	.mushroom {
		@apply border-mushroom;
	}

	.netherwart {
		@apply border-netherwart;
	}

	.potato {
		@apply border-potato;
	}

	.pumpkin {
		@apply border-pumpkin;
	}

	.sugarcane {
		@apply border-sugarcane;
	}

	.wheat {
		@apply border-wheat;
	}
</style>
