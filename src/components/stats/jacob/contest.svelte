<script lang="ts">
	import type { components } from '$lib/api/api';
	import { getReadableSkyblockDate } from '$lib/format';

	interface Props {
		contest: components['schemas']['ContestParticipationDto'];
		irlTime?: boolean;
	}

	let { contest, irlTime = false }: Props = $props();

	let { crop, position, participants, collected, timestamp, medal } = $derived(contest);

	let cropName = $derived(crop ?? 'Not Found');
	let ranking = $derived((position ?? 0) > -1);
</script>

<a
	href="/contest/{timestamp}"
	data-sveltekit-preload-data="off"
	class="flex flex-col gap-0.5 rounded-md border-l-4 bg-primary-foreground p-2 hover:bg-muted hover:shadow-lg {crop?.replace(
		' ',
		''
	)}"
>
	<h3 class="text-sm first-letter:uppercase">
		<span class="rounded-md bg-card p-0.5 px-1.5">{cropName}</span>
		<span class="text-sm font-semibold">{ranking ? `#${(position ?? -2) + 1}` : 'Unclaimed'}</span>
		<span class="text-xs">{ranking ? `/ ${participants}` : ''}</span>
	</h3>
	<h3 class="flex flex-row items-center gap-1 text-lg font-semibold">
		{#if medal && medal !== 'none'}
			<img class="pixelated inline-block h-6 w-6 p-0.5" src="/images/medals/{medal}.webp" alt="Earned Medal" />
		{/if}
		{(collected ?? 0).toLocaleString()}
	</h3>
	{#if irlTime}
		<span class="font-mono text-xs font-semibold">
			{new Date((timestamp ?? 0) * 1000).toLocaleString(undefined, {
				timeStyle: 'short',
				dateStyle: 'medium',
			})}
		</span>
	{:else}
		<span class="font-mono text-xs font-semibold">{getReadableSkyblockDate(timestamp ?? 0)}</span>
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
