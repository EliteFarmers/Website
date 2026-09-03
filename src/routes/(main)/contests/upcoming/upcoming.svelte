<script lang="ts">
	import { page } from '$app/state';
	import Countdown from '$comp/countdown.svelte';
	import { PROPER_CROP_TO_IMG } from '$lib/constants/crops';
	import { getReadableSkyblockDate } from '$lib/format';
	import * as Popover from '$ui/popover';

	const CONTEST_DURATION_SECONDS = 20 * 60;

	interface Props {
		current?: boolean;
		timestamp: number;
		crops: string[];
		currentSeconds: number;
	}

	let { current = false, timestamp, crops, currentSeconds }: Props = $props();

	let selected = $derived(page.url.hash === `#${timestamp}`);
	let startDate = $derived(new Date(timestamp * 1000));
	let end = $derived(timestamp + CONTEST_DURATION_SECONDS);
	let endDate = $derived(new Date(end * 1000));
</script>

<div
	class="flex w-full max-w-464 scroll-mt-32 flex-col items-center justify-between gap-4 rounded-md border-2 bg-card p-4 md:flex-row {selected
		? 'border-link'
		: current
			? 'border-active'
			: 'border-border'}"
	id={timestamp.toString()}
>
	<div class="flex min-w-0 flex-col items-center gap-2 text-center md:items-start md:text-left">
		<h4 class="text-2xl font-semibold whitespace-nowrap">
			{#if current}
				Active Contest
			{:else}
				{getReadableSkyblockDate(timestamp)}
			{/if}
		</h4>
		<div class="flex flex-wrap items-center justify-center gap-2 md:justify-start">
			<p class="text-sm whitespace-nowrap text-muted-foreground">
				{startDate.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
				{startDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
			</p>
			<p class="text-sm whitespace-nowrap text-muted-foreground">-</p>
			<p class="text-sm whitespace-nowrap text-muted-foreground">
				{endDate.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
				{endDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
			</p>
		</div>

		{#if end > currentSeconds}
			<div class="flex h-8 flex-row items-center gap-2">
				<Countdown start={timestamp * 1000} end={end * 1000} class="gap-2 text-sm md:text-base">
					{#snippet starting()}
						<p class="mb-0.5 text-sm leading-none whitespace-nowrap text-muted-foreground md:text-base">
							Starts in
						</p>
					{/snippet}
					{#snippet ending()}
						<p class="mb-0.5 text-sm leading-none whitespace-nowrap text-muted-foreground md:text-base">
							Ends in
						</p>
					{/snippet}
				</Countdown>
			</div>
		{/if}
	</div>
	<div class="flex flex-wrap items-center justify-center gap-3 md:justify-end">
		{#each crops as name (name)}
			<Popover.Mobile>
				{#snippet trigger()}
					<div class="flex aspect-square w-16 items-center justify-center rounded-md bg-card text-center">
						{#if PROPER_CROP_TO_IMG[name]}
							<img class="pixelated w-12" src={PROPER_CROP_TO_IMG[name]} alt={name} />
						{:else}
							<span class="px-2 text-xs text-muted-foreground">{name}</span>
						{/if}
					</div>
				{/snippet}
				<div class="mx-8 text-center">
					{name}
				</div>
			</Popover.Mobile>
		{/each}
	</div>
</div>
