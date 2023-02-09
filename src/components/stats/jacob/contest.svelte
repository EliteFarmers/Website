<script lang="ts">
	import { PROPER_CROP_NAME } from '$lib/constants/crops';
	import { getReadableSkyblockDate } from '$lib/format';
	import type { JacobContest } from '$lib/skyblock';
	type JacobContestCrop = JacobContest & { crop?: string };

	export let contest: JacobContestCrop;
	const { crop, position, participants, collected, timestamp } = contest;

	const cropName = (crop ? PROPER_CROP_NAME[crop] : undefined) ?? 'Not Found';
	const ranking = position !== undefined;

	let medal = '';
	if (position !== undefined && participants) {
		if (position <= participants * 0.05 + 1) {
			medal = 'Gold';
		} else if (position <= participants * 0.25 + 1) {
			medal = 'Silver';
		} else if (position <= participants * 0.6 + 1) {
			medal = 'Bronze';
		}
	}
</script>

<div class="p-2 flex flex-col gap-0.5 rounded-md bg-gray-200 dark:bg-zinc-700 border-l-4 {crop}">
	<h3 class="first-letter:uppercase text-sm">
		<span class="p-0.5 px-1.5 bg-gray-100 dark:bg-zinc-800 rounded-md">{cropName}</span>
		<span class="text-sm font-semibold">{ranking ? `#${position + 1}` : 'Unclaimed'}</span>
		<span class="text-xs">{ranking ? `/ ${participants}` : ''}</span>
	</h3>
	<h3 class="text-lg font-semibold">
		{#if medal === 'Gold'}
			<img class="inline-block w-5 h-5" src="/images/medals/gold.png" alt="Earned Medal" />
		{:else if medal === 'Silver'}
			<img class="inline-block w-5 h-5" src="/images/medals/silver.png" alt="Earned Medal" />
		{:else if medal === 'Bronze'}
			<img class="inline-block w-5 h-5" src="/images/medals/bronze.png" alt="Earned Medal" />
		{/if}
		{collected.toLocaleString()}
	</h3>
	<h6 class="text-xs font-mono font-semibold">{getReadableSkyblockDate(timestamp)}</h6>
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
