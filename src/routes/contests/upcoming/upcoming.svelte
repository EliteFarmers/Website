<script lang="ts">
	import { browser } from '$app/environment';
	import { PROPER_CROP_TO_IMG } from '$lib/constants/crops';
	import { getReadableSkyblockDate, getRelativeTimeString } from '$lib/format';
	import * as Tooltip from '$ui/tooltip';

	export let current = false;
	export let timestamp: number;
	export let crops: string[];
	export let currentSeconds: number;

	$: time = timestamp;
	$: lang = 'en';

	$: {
		if (browser) {
			lang = navigator.language;
		}
	}
</script>

<div
	class="flex flex-col md:flex-row flex-1 gap-2 w-full max-w-[116rem] rounded-md justify-between items-center p-4 {current
		? 'bg-yellow-100 dark:bg-yellow-900'
		: 'bg-primary-foreground'}"
>
	<div class="flex flex-col gap-2 items-center md:items-start">
		<h4 class="text-2xl whitespace-nowrap font-semibold">
			{getReadableSkyblockDate(timestamp)}
			{#if current}
				<span class="font-bold"> - Now!</span>
			{/if}
		</h4>
		<!-- Time -->
		<h4 class="text-xl whitespace-nowrap font-mono font-semibold">
			{new Date(timestamp * 1000).toLocaleString(undefined, {
				timeStyle: 'short',
				dateStyle: 'medium',
			})}
		</h4>
		<!-- Countdown/relative time -->
		<h4 class="text-xl text-center whitespace-nowrap font-semibold bg-card max-w-fit px-2 rounded-md">
			{#if current}
				Started
			{:else}
				Starts
			{/if}
			<!-- Tricks Svelte into updating this -->
			{getRelativeTimeString(new Date((time - currentSeconds + currentSeconds) * 1000), lang)}
		</h4>
	</div>
	<div class="flex flex-row gap-4 mx-4 w-[1/1] md:w-[1/2]">
		{#each crops as name (name)}
			<Tooltip.Root>
				<Tooltip.Trigger>
					<div class="flex-col flex-1 items-center text-center max-w-2xl rounded-md bg-card">
						<img class="w-16 pixelated" src={PROPER_CROP_TO_IMG[name]} alt="" />
					</div>
				</Tooltip.Trigger>
				<Tooltip.Content>
					{name}
				</Tooltip.Content>
			</Tooltip.Root>
		{/each}
	</div>
</div>
