<script lang="ts">
	import { PROPER_CROP_NAME } from '$lib/constants/crops';
	import { getReadableSkyblockDate } from '$lib/format';
	import type { JacobContest } from '$lib/skyblock';
	type JacobContestCrop = JacobContest & { crop?: string };

	export let contest: JacobContestCrop;

	const cropName = (contest.crop ? PROPER_CROP_NAME[contest.crop] : undefined) ?? 'Not Found';
	const ranking = contest.position !== undefined ? `#${contest.position + 1} / ${contest.participants}` : `Unclaimed`;
</script>

<div class="p-2 flex flex-col gap-0.5 rounded-md bg-gray-200 dark:bg-zinc-700 border-l-4 {contest.crop}">
	<h3 class="first-letter:uppercase text-sm">
		<span class="p-0.5 px-1.5 bg-gray-100 dark:bg-zinc-800 rounded-md">{cropName}</span>
		<span class="text-sm font-semibold">{ranking}</span>
	</h3>
	<h3 class="text-lg font-semibold">{contest.collected.toLocaleString()}</h3>
	<h6 class="text-xs font-mono font-semibold">{getReadableSkyblockDate(contest.timestamp)}</h6>
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
