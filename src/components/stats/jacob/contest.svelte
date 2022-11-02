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
			medal = '🥇 ';
		} else if (position <= participants * 0.25 + 1) {
			medal = '🥈 ';
		} else if (position <= participants * 0.6 + 1) {
			medal = '🥉 ';
		}
	}
</script>

<div class="p-2 flex flex-col gap-0.5 rounded-md bg-gray-200 dark:bg-zinc-700 border-l-4 {crop}">
	<h3 class="first-letter:uppercase text-sm">
		<span class="p-0.5 px-1.5 bg-gray-100 dark:bg-zinc-800 rounded-md">{cropName}</span>
		<span class="text-sm font-semibold">{ranking ? `#${position + 1}` : ''}</span>
		<span class="text-xs">{ranking ? `/ ${participants}` : ''}</span>
	</h3>
	<h3 class="text-lg font-semibold">{medal}{collected.toLocaleString()}</h3>
	<h6 class="text-xs font-mono font-semibold">{getReadableSkyblockDate(timestamp)}</h6>
</div>

<style lang="postcss">
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
