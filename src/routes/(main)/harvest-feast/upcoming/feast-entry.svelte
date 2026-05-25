<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { PROPER_CROP_TO_IMG } from '$lib/constants/crops';
	import { getReadableSkyblockDate, getRelativeTimeString } from '$lib/format';
	import * as Popover from '$ui/popover';

	interface Props {
		current?: boolean;
		unknown?: boolean;
		cropsUnknown?: boolean;
		timestamp?: number;
		crops: string[];
		currentSeconds: number;
	}

	let { current = false, unknown = false, cropsUnknown = false, timestamp, crops, currentSeconds }: Props = $props();

	let time = $derived(timestamp ?? 0);
	let hasStarted = $derived(timestamp !== undefined && timestamp <= currentSeconds);
	let lang = $derived.by(() => {
		if (browser) return navigator.language ?? 'en';
		return 'en';
	});
	let selected = $derived(timestamp ? page.url.hash === `#${timestamp}` : false);
</script>

<div
	class="flex w-full max-w-464 scroll-mt-32 flex-col items-center justify-between gap-4 rounded-md border-2 p-4 md:flex-row {current
		? 'bg-active'
		: 'bg-card'} {selected ? 'border-link' : 'border-border'}"
	id={timestamp?.toString()}
>
	<div class="flex min-w-0 flex-col items-center gap-2 text-center md:items-start md:text-left">
		<h4 class="text-2xl font-semibold whitespace-nowrap">
			{#if current}
				Active Crops
			{:else if unknown}
				Unknown Next Time
			{:else if timestamp}
				{getReadableSkyblockDate(timestamp)}
			{/if}
		</h4>
		{#if timestamp}
			<h4 class="font-mono text-xl font-semibold whitespace-nowrap">
				{new Date(timestamp * 1000).toLocaleString(undefined, {
					timeStyle: 'short',
					dateStyle: 'medium',
				})}
			</h4>
			<h4 class="bg-card max-w-fit rounded-md px-2 text-center text-xl font-semibold whitespace-nowrap">
				{hasStarted ? 'Started' : 'Starts'}
				{getRelativeTimeString(new Date(time * 1000), lang)}
			</h4>
		{:else if current}
			<h4 class="bg-card max-w-fit rounded-md px-2 text-center text-xl font-semibold whitespace-nowrap">
				Active now
			</h4>
		{:else}
			<h4 class="bg-card max-w-fit rounded-md px-2 text-center text-xl font-semibold whitespace-nowrap">
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
