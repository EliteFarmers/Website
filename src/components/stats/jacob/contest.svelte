<script lang="ts">
	import type { components } from '$lib/api/api';
	import { getReadableSkyblockDate } from '$lib/format';

	export let contest: components['schemas']['ContestParticipationDto'];
	export let irlTime = false;

	$: ({ crop, position, participants, collected, timestamp, medal } = contest);

	$: cropName = crop ?? 'Not Found';
	$: ranking = (position ?? 0) > -1;
</script>

<a
	href="/contest/{timestamp}"
	data-sveltekit-preload-data="off"
	class="p-2 flex flex-col hover:shadow-lg hover:bg-gray-200 dark:hover:bg-zinc-700 gap-0.5 rounded-md bg-gray-100 dark:bg-zinc-800 border-l-4 {crop?.replace(
		' ',
		''
	)}"
>
	<h3 class="first-letter:uppercase text-sm">
		<span class="p-0.5 px-1.5 bg-gray-200 dark:bg-zinc-900 rounded-md">{cropName}</span>
		<span class="text-sm font-semibold">{ranking ? `#${(position ?? -2) + 1}` : 'Unclaimed'}</span>
		<span class="text-xs">{ranking ? `/ ${participants}` : ''}</span>
	</h3>
	<h3 class="text-lg font-semibold flex flex-row items-center gap-1">
		{#if medal && medal !== 'none'}
			<img class="inline-block w-6 h-6 pixelated" src="/images/medals/{medal}.webp" alt="Earned Medal" />
		{/if}
		{(collected ?? 0).toLocaleString()}
	</h3>
	{#if irlTime}
		<h6 class="text-xs font-mono font-semibold">
			{new Date((timestamp ?? 0) * 1000).toLocaleString(undefined, {
				timeStyle: 'short',
				dateStyle: 'medium',
			})}
		</h6>
	{:else}
		<h6 class="text-xs font-mono font-semibold">{getReadableSkyblockDate(timestamp ?? 0)}</h6>
	{/if}
</a>

<style lang="postcss">
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
