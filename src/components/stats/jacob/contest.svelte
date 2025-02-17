<script lang="ts">
	import type { components } from '$lib/api/api';
	import { getReadableSkyblockDate } from '$lib/format';
	import { cn } from '$lib/utils';

	interface Props {
		contest: components['schemas']['ContestParticipationDto'];
		irlTime?: boolean;
		class?: string;
	}

	let { contest, irlTime = false, class: classes = '' }: Props = $props();

	let { crop, position, participants, collected, timestamp, medal } = $derived(contest);

	let cropName = $derived(crop ?? 'Not Found');
	let ranking = $derived((position ?? 0) > -1);
</script>

<a
	href="/contest/{timestamp}"
	data-sveltekit-preload-data="off"
	class={cn(
		`flex min-w-52 flex-col gap-1 rounded-md border-l-4 bg-card p-2 hover:bg-muted hover:shadow-lg ${crop?.replace(
			' ',
			''
		)}`,
		classes
	)}
>
	<p class="text-sm first-letter:uppercase">
		<span class="rounded-md bg-card p-0.5 px-1.5">{cropName}</span>
		<span class="text-sm font-semibold">{ranking ? `#${(position ?? -2) + 1}` : 'Unclaimed'}</span>
		<span class="text-xs">{ranking ? `/ ${participants}` : ''}</span>
	</p>
	<p class="flex flex-row items-center gap-1 text-lg font-semibold">
		{#if medal && medal !== 'none'}
			<img class="pixelated inline-block h-6 w-6 p-0.5" src="/images/medals/{medal}.webp" alt="Earned Medal" />
		{/if}
		<span>{(collected ?? 0).toLocaleString()}</span>
	</p>
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
