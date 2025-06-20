<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { PROPER_CROP_TO_IMG } from '$lib/constants/crops';
	import { getReadableSkyblockDate, getRelativeTimeString } from '$lib/format';
	import * as Popover from '$ui/popover';

	interface Props {
		current?: boolean;
		timestamp: number;
		crops: string[];
		currentSeconds: number;
	}

	let { current = false, timestamp, crops, currentSeconds }: Props = $props();

	let time = $derived(timestamp);
	let lang = $derived.by(() => {
		if (browser) return navigator.language ?? 'en';
		return 'en';
	});
	let selected = $derived(page.url.hash === `#${timestamp}`);
</script>

<div
	class="flex w-full max-w-464 flex-1 scroll-mt-32 flex-col items-center justify-between gap-2 rounded-md p-4 md:flex-row {current
		? 'bg-active'
		: 'bg-card'} {selected ? 'border-link border-2' : ''}"
	id={timestamp.toString()}
>
	<div class="flex flex-col items-center gap-2 md:items-start">
		<h4 class="text-2xl font-semibold whitespace-nowrap">
			{getReadableSkyblockDate(timestamp)}
			{#if current}
				<span class="font-bold"> - Now!</span>
			{/if}
		</h4>
		<!-- Time -->
		<h4 class="font-mono text-xl font-semibold whitespace-nowrap">
			{new Date(timestamp * 1000).toLocaleString(undefined, {
				timeStyle: 'short',
				dateStyle: 'medium',
			})}
		</h4>
		<!-- Countdown/relative time -->
		<h4 class="bg-card max-w-fit rounded-md px-2 text-center text-xl font-semibold whitespace-nowrap">
			{#if current}
				Started
			{:else}
				Starts
			{/if}
			<!-- Tricks Svelte into updating this -->
			{getRelativeTimeString(new Date((time - currentSeconds + currentSeconds) * 1000), lang)}
		</h4>
	</div>
	<div class="mx-4 flex w-[1/1] flex-row gap-4 md:w-[1/2]">
		{#each crops as name (name)}
			<Popover.Mobile>
				{#snippet trigger()}
					<div>
						<div class="bg-card flex-1 flex-col items-center rounded-md text-center">
							<img class="pixelated w-16" src={PROPER_CROP_TO_IMG[name]} alt="" />
						</div>
					</div>
				{/snippet}
				<div class="mx-8 text-center">
					{name}
				</div>
			</Popover.Mobile>
		{/each}
	</div>
</div>
