<script lang="ts">
	import { page } from '$app/state';
	import Countdown from '$comp/countdown.svelte';
	import { PROPER_CROP_TO_IMG } from '$lib/constants/crops';
	import { getReadableSkyblockDate } from '$lib/format';
	import * as Popover from '$ui/popover';

	interface Props {
		current?: boolean;
		cropsUnknown?: boolean;
		start?: number;
		end?: number;
		crops: string[];
		currentSeconds: number;
	}

	let { current = false, cropsUnknown = false, start, end, crops, currentSeconds }: Props = $props();

	let hasStarted = $derived(start !== undefined && start <= currentSeconds);
	let selected = $derived(start ? page.url.hash === `#${start}` : false);

	const startDate = $derived(start !== undefined ? new Date(start * 1000) : null);
	const endDate = $derived(end !== undefined ? new Date(end * 1000) : null);
</script>

<div
	class="bg-card flex w-full max-w-464 scroll-mt-32 flex-col items-center justify-between gap-4 rounded-md border-2 p-4 md:flex-row {selected
		? 'border-link'
		: current
			? 'border-active'
			: 'border-border'}"
	id={start?.toString()}
>
	<div class="flex min-w-0 flex-col items-center gap-2 text-center md:items-start md:text-left">
		<h4 class="text-2xl font-semibold whitespace-nowrap">
			{#if current}
				Active Crops
			{:else if start}
				{getReadableSkyblockDate(start)}
			{/if}
		</h4>
		<div class="flex flex-row items-center gap-2">
			{#if startDate}
				<p class="text-muted-foreground text-sm whitespace-nowrap">
					{startDate.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
					{startDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
				</p>
			{/if}
			{#if startDate && endDate}
				<p class="text-muted-foreground text-sm whitespace-nowrap">-</p>
			{/if}
			{#if end}
				<p class="text-muted-foreground text-sm whitespace-nowrap">
					{endDate?.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
					{endDate?.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
				</p>
			{/if}
		</div>

		{#if start && end && end > currentSeconds}
			<div class="flex h-8 flex-row items-center gap-2">
				<Countdown start={start * 1000} end={end * 1000} class="gap-2 text-sm md:text-base">
					{#snippet starting()}
						<p class="text-muted-foreground mb-0.5 text-sm leading-none whitespace-nowrap md:text-base">
							Starts in
						</p>
					{/snippet}
					{#snippet ending()}
						<p class="text-muted-foreground mb-0.5 text-sm leading-none whitespace-nowrap md:text-base">
							Ends in
						</p>
					{/snippet}
				</Countdown>
			</div>
		{:else if start && end}
			<p class="text-muted-foreground text-sm font-semibold whitespace-nowrap">Rotation ended</p>
		{:else}
			<h4 class="bg-card max-w-fit rounded-md px-2 text-center text-sm font-semibold whitespace-nowrap">
				Waiting for report
			</h4>
		{/if}
	</div>
	<div class="flex flex-wrap items-center justify-center gap-3 md:justify-end">
		{#if cropsUnknown}
			<div class="bg-card text-muted-foreground rounded-md border border-dashed px-4 py-3 text-center text-sm">
				{hasStarted ? 'Crops not reported yet' : 'Crops unknown!'}
			</div>
		{:else}
			{#each crops as name (name)}
				<Popover.Mobile>
					{#snippet trigger()}
						<div class="bg-card flex aspect-square w-16 items-center justify-center rounded-md text-center">
							{#if PROPER_CROP_TO_IMG[name]}
								<img class="pixelated w-12" src={PROPER_CROP_TO_IMG[name]} alt={name} />
							{:else}
								<span class="text-muted-foreground px-2 text-xs">{name}</span>
							{/if}
						</div>
					{/snippet}
					<div class="mx-8 text-center">
						{name}
					</div>
				</Popover.Mobile>
			{/each}
		{/if}
	</div>
</div>
