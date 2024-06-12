<script lang="ts">
	import { page } from '$app/stores';
	import * as Popover from '$comp/ui/popover';
	import { PROPER_CROP_NAMES } from '$lib/constants/crops';
	import Minion from './minion.svelte';

	export let name: string | undefined;
	export let value: number;
	export let weight: number;
	export let pest: string;
	export let pestKills: number;
	export let pestRank = -1;
	export let uncounted = 0;
	export let minionTierField: number;
	export let key: string;
	export let rank = -1;

	$: crop = name ? name : undefined;
	$: index = 0;

	$: cropArray = PROPER_CROP_NAMES.sort((a, b) => a?.localeCompare(b ?? '') ?? 0);

	function getFrameStyle() {
		if (crop && name) {
			index = cropArray.indexOf(name);
		}

		if (rank <= 0) return '';

		if (rank <= 5) {
			return 'background-image: url(/images/frames/rainbow.webp);';
		} else if (rank <= 10) {
			return 'background-image: url(/images/frames/mithril.webp);';
		} else if (rank <= 50) {
			return 'background-image: url(/images/frames/gold.webp);';
		} else if (rank <= 100) {
			return 'background-image: url(/images/frames/silver.webp);';
		} else if (rank <= 500) {
			return 'background-image: url(/images/frames/bronze.webp);';
		}
	}
</script>

<div class="flex flex-row justify-between gap-2 w-full align-middle items-center">
	<div class="flex flex-1 justify-between align-middle w-full max-h-30 bg-primary-foreground rounded-lg p-1">
		<div class="flex flex-row justify-start items-center gap-2 w-full">
			{#key rank}
				<div
					class="flex crop-container pixelated w-10 h-10 sm:w-14 sm:h-14 md:w-20 md:h-20 aspect-square"
					style={getFrameStyle()}
				>
					<img
						src="/images/crops/{key}.png"
						class="rounded-lg pixelated aspect-square p-[16%] object-contain"
						alt={name}
					/>
				</div>
			{/key}
			<div class="flex flex-col align-middle justify-center w-full">
				<div class="flex flex-row items-center gap-1">
					{#if rank > 0}
						<a
							href="/leaderboard/{key}/{$page.params.id}-{$page.params.profile}"
							class="px-1.5 bg-card rounded-md hover:bg-muted"
						>
							<span class="text-sm xs:text-md sm:text-lg">#</span><span
								class="text-md xs:text-lg sm:text-xl">{rank}</span
							>
						</a>
					{/if}
					<p class="text-md sm:text-lg font-semibold whitespace-nowrap">{name}</p>
				</div>
				<p class="text-normal sm:text-lg md:text-xl lg:text-2xl whitespace-nowrap">{value.toLocaleString()}</p>
			</div>
		</div>

		<div class="flex flex-col justify-center align-middle w-full p-1 gap-1">
			<p class="md:ml-2 text-right font-semibold sm:text-lg md:text-xl lg:text-2xl">{weight.toLocaleString()}</p>
			<div class="md:ml-2 text-right flex flex-row items-center gap-2 justify-end">
				{#if pestRank > 0}
					<a
						href="/leaderboard/{pest}/{$page.params.id}-{$page.params.profile}"
						class="px-1 bg-card rounded-md hover:bg-muted"
					>
						<span class="text-sm xs:text-md sm:text-lg">#</span><span class="text-md xs:text-lg sm:text-xl"
							>{pestRank}</span
						>
					</a>
				{/if}
				<Popover.Mobile>
					<div slot="trigger" class="flex flex-row items-center align-middle justify-center gap-2 h-6">
						<p class="text-md sm:text-lg font-semibold whitespace-nowrap">
							{pestKills.toLocaleString()}
						</p>
						<img
							src="/images/pests/{pest}.png"
							class="pixelated aspect-square object-contain h-full"
							alt={pest}
						/>
					</div>
					<div class="flex flex-col items-center gap-2 max-w-md">
						<p class="text-lg first-letter:capitalize font-semibold">{pest} Kills</p>
						<p>{pestKills.toLocaleString()}</p>
						<a class="text-lg font-semibold text-blue-500 hover:underline" href="/info#Pests"
							>Weight Adjustment</a
						>
						{#if uncounted === 0}
							<p>None!</p>
						{:else}
							<p>-{uncounted.toLocaleString()} {name}</p>
						{/if}
					</div>
				</Popover.Mobile>
			</div>
		</div>
	</div>
	<Minion name={name ?? ''} {index} tierField={minionTierField} />
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
