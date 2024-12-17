<script lang="ts">
	import { page } from '$app/state';
	import { toReadable } from '$lib/format';
	import { Crop, getCropDisplayName, getCropFromName, type LevelingStats } from 'farming-weight';
	import ProgressBar from '../progress-bar.svelte';

	interface Props {
		crop: string;
		key: string;
		leveling: LevelingStats;
		rank?: number;
	}

	let { crop, key, leveling, rank = -1 }: Props = $props();

	let displayName = $derived(getCropDisplayName(getCropFromName(crop) ?? Crop.Wheat));

	let percent = $derived(Math.round(leveling.ratio * 100));
	let readable = $state('');
	let expanded = $state('');
	let maxed = $derived(leveling.goal === undefined);

	$effect(() => {
		const lang = navigator.language;

		readable =
			leveling.goal !== undefined
				? toReadable(leveling.progress, lang) + ' / ' + toReadable(leveling.goal, lang)
				: toReadable(leveling.progress, lang);

		expanded =
			leveling.goal !== undefined
				? Math.floor(leveling.progress).toLocaleString() + ' / ' + Math.floor(leveling.goal).toLocaleString()
				: Math.floor(leveling.progress).toLocaleString();
	});
</script>

<div class="flex w-full flex-row items-center gap-2 align-middle">
	<div
		class="max-h-30 flex w-full flex-1 items-center justify-start gap-2 rounded-lg bg-primary-foreground p-1 align-middle"
	>
		<div class="crop-container pixelated flex aspect-square h-10 w-10 sm:h-14 sm:w-14 md:h-20 md:w-20">
			<img
				src="/images/crops/{key}.png"
				class="pixelated aspect-square rounded-lg object-contain p-[16%]"
				alt={displayName}
			/>
		</div>
		<div class="flex flex-grow flex-col justify-center gap-1">
			<div class="flex flex-row items-end justify-between gap-2">
				<div class="flex flex-row items-center gap-1">
					{#if rank > 0}
						<a
							href="/leaderboard/{key}-milestone/{page.params.id}-{page.params.profile}"
							class="rounded-md bg-card px-1.5 hover:bg-muted"
						>
							<span class="xs:text-md text-sm sm:text-lg">#</span><span
								class="text-md xs:text-lg sm:text-xl">{rank}</span
							>
						</a>
					{/if}
					<p class="text-md whitespace-nowrap font-semibold sm:text-lg">{displayName}</p>
				</div>
				<p class="pr-1 text-right text-xl font-semibold md:ml-2 lg:text-2xl">
					{leveling.level.toLocaleString()}
				</p>
			</div>
			<div class="flex flex-row items-center justify-between gap-4 pr-1">
				<p class="text-normal -pr-1 basis-1/3 whitespace-nowrap leading-none sm:text-lg md:text-xl lg:text-2xl">
					{leveling.total.toLocaleString()}
				</p>
				<ProgressBar {percent} {readable} {expanded} {maxed} class="text-sm font-semibold" />
			</div>
		</div>
	</div>
</div>

<style lang="postcss">
	.crop-container {
		@apply aspect-square justify-center object-contain align-middle;
		aspect-ratio: 1 / 1;
		background-repeat: no-repeat;
		background-size: 85%;
		background-position: center;
		background-blend-mode: color;
	}
</style>
