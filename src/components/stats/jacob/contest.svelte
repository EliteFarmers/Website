<script lang="ts" module>
	const borderColors: Record<string, string> = {
		Cactus: 'border-cactus',
		Carrot: 'border-carrot',
		'Cocoa Beans': 'border-cocoa',
		Melon: 'border-melon',
		Mushroom: 'border-mushroom',
		'Nether Wart': 'border-netherwart',
		Potato: 'border-potato',
		Pumpkin: 'border-pumpkin',
		'Sugar Cane': 'border-sugarcane',
		Wheat: 'border-wheat',
	};

	const ghostColors: Record<string, string> = {
		Cactus: 'border-cactus/50',
		Carrot: 'border-carrot/50',
		'Cocoa Beans': 'border-cocoa/50',
		Melon: 'border-melon/50',
		Mushroom: 'border-mushroom/50',
		'Nether Wart': 'border-netherwart/50',
		Potato: 'border-potato/50',
		Pumpkin: 'border-pumpkin/50',
		'Sugar Cane': 'border-sugarcane/50',
		Wheat: 'border-wheat/50',
	};
</script>

<script lang="ts">
	import type { ContestParticipationDto } from '$lib/api';
	import { getReadableSkyblockDate } from '$lib/format';
	import { cn } from '$lib/utils';
	import Ghost from '@lucide/svelte/icons/ghost';

	interface Props {
		contest: ContestParticipationDto;
		irlTime?: boolean;
		class?: string;
	}

	let { contest, irlTime = false, class: classes = '' }: Props = $props();

	let { crop, position, participants, collected, timestamp, medal } = $derived(contest);

	let cropName = $derived(crop ?? 'Not Found');
	let ranking = $derived((position ?? 0) > -1);
	let ghost = $derived(medal === 'ghost');
	let borderColor = $derived(
		(ghost ? ghostColors[crop ?? 'Wheat'] : borderColors[crop ?? 'Wheat']) || 'var(--color-border)'
	);
</script>

<a
	href="/contest/{timestamp}"
	data-sveltekit-preload-data="off"
	class={cn(
		`bg-card hover:bg-muted flex min-w-52 flex-col gap-1 rounded-md border-l-4 p-2 hover:shadow-lg ${borderColor}`,
		classes
	)}
>
	<p class="text-sm first-letter:uppercase">
		<span class="bg-card rounded-md p-0.5 px-1.5">{cropName}</span>
		{#if ghost}
			<span class="text-sm font-semibold">Not Claimable</span>
		{:else}
			<span class="text-sm font-semibold">{ranking ? `#${(position ?? -2) + 1}` : 'Unclaimed'}</span>
			<span class="text-xs">{ranking ? `/ ${participants}` : ''}</span>
		{/if}
	</p>
	<p class="flex flex-row items-center gap-1 text-lg font-semibold">
		{#if medal && medal !== 'none'}
			{#if ghost}
				<Ghost class="text-muted-foreground p-0.5" />
			{:else}
				<img
					class="pixelated inline-block h-6 w-6 p-0.5"
					src="/images/medals/{medal}.webp"
					alt="Earned Medal"
				/>
			{/if}
		{/if}
		<span>{(collected ?? 0).toLocaleString()}</span>
	</p>
	{#if irlTime}
		<span class="font-mono text-xs font-semibold {irlTime ? 'block' : 'hidden'}">
			{new Date(Number(timestamp ?? 0) * 1000).toLocaleString(undefined, {
				timeStyle: 'short',
				dateStyle: 'medium',
			})}
		</span>
	{:else}
		<span class="font-mono text-xs font-semibold {irlTime ? 'hidden' : 'block'}"
			>{getReadableSkyblockDate(timestamp ?? 0)}</span
		>
	{/if}
</a>
