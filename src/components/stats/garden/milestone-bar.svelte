<script lang="ts">
	import { browser } from '$app/environment';
	import { API_CROP_TO_CROP } from '$lib/constants/crops';
	import { toReadable } from '$lib/format';
	import { Crop, getCropDisplayName, getCropFromName, type LevelingStats } from 'farming-weight';

	export let crop: string;
	export let leveling: LevelingStats;

	let hovering = false;
	$: key = API_CROP_TO_CROP[crop as keyof typeof API_CROP_TO_CROP];
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
					<p class="text-md sm:text-lg font-semibold whitespace-nowrap">{displayName}</p>
				</div>
				<p class="md:ml-2 text-right font-semibold text-xl lg:text-2xl pr-1">
					{leveling.level.toLocaleString()}
				</p>
			</div>
			<div class="flex flex-row justify-between items-center gap-4">
				<p class="basis-1/3 text-normal sm:text-lg md:text-xl lg:text-2xl whitespace-nowrap leading-none">
					{leveling.total.toLocaleString()}
				</p>
				<div class="flex flex-1 flex-row items-center gap-2 pr-1">
					<div
						class="relative block w-full h-6 md:my-1 bg-card rounded-lg"
						on:mouseenter={() => (hovering = true)}
						on:mouseleave={() => (hovering = false)}
						role="none"
					>
						<div
							class="absolute h-6 {maxed
								? 'bg-yellow-400 dark:bg-yellow-600'
								: 'bg-green-400 dark:bg-green-600'} rounded-lg"
							style={`width: ${percent}%`}
						/>
						<div class="absolute flex items-center justify-center w-full h-full">
							<p class="sm:text-lg leading-none font-semibold">{hovering ? expanded : readable}</p>
						</div>
					</div>
				</div>
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
