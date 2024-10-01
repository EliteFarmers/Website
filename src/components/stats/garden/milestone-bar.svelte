<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { toReadable } from '$lib/format';
	import { Crop, getCropDisplayName, getCropFromName, type LevelingStats } from 'farming-weight';
	import ProgressBar from '../progress-bar.svelte';

	export let crop: string;
	export let key: string;
	export let leveling: LevelingStats;
	export let rank = -1;

	$: displayName = getCropDisplayName(getCropFromName(crop) ?? Crop.Wheat);

	$: percent = Math.round(leveling.ratio * 100);
	$: readable = '';
	$: expanded = '';
	$: maxed = leveling.goal === undefined;

	$: {
		if (browser) {
			const lang = navigator.language;

			readable =
				leveling.goal !== undefined
					? toReadable(leveling.progress, lang) + ' / ' + toReadable(leveling.goal, lang)
					: toReadable(leveling.progress, lang);

			expanded =
				leveling.goal !== undefined
					? Math.floor(leveling.progress).toLocaleString() +
					  ' / ' +
					  Math.floor(leveling.goal).toLocaleString()
					: Math.floor(leveling.progress).toLocaleString();
		}
	}
</script>

<div class="flex flex-row gap-2 w-full align-middle items-center">
	<div
		class="flex flex-1 gap-2 justify-start align-middle items-center w-full max-h-30 bg-primary-foreground rounded-lg p-1"
	>
		<div class="flex crop-container pixelated w-10 h-10 sm:w-14 sm:h-14 md:w-20 md:h-20 aspect-square">
			<img
				src="/images/crops/{key}.png"
				class="rounded-lg pixelated aspect-square p-[16%] object-contain"
				alt={displayName}
			/>
		</div>
		<div class="flex flex-col gap-1 justify-center flex-grow">
			<div class="flex flex-row justify-between items-end gap-2">
				<div class="flex flex-row items-center gap-1">
					{#if rank > 0}
						<a
							href="/leaderboard/{key}-milestone/{$page.params.id}-{$page.params.profile}"
							class="px-1.5 bg-card rounded-md hover:bg-muted"
						>
							<span class="text-sm xs:text-md sm:text-lg">#</span><span
								class="text-md xs:text-lg sm:text-xl">{rank}</span
							>
						</a>
					{/if}
					<p class="text-md sm:text-lg font-semibold whitespace-nowrap">{displayName}</p>
				</div>
				<p class="md:ml-2 text-right font-semibold text-xl lg:text-2xl pr-1">
					{leveling.level.toLocaleString()}
				</p>
			</div>
			<div class="flex flex-row justify-between items-center gap-4 pr-1">
				<p class="basis-1/3 text-normal sm:text-lg md:text-xl lg:text-2xl whitespace-nowrap leading-none -pr-1">
					{leveling.total.toLocaleString()}
				</p>
				<ProgressBar {percent} {readable} {expanded} {maxed} class="text-sm font-semibold" />
			</div>
		</div>
	</div>
</div>

<style lang="postcss">
	.crop-container {
		@apply align-middle justify-center aspect-square object-contain;
		aspect-ratio: 1 / 1;
		background-repeat: no-repeat;
		background-size: 85%;
		background-position: center;
		background-blend-mode: color;
	}
</style>
