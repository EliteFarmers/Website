<script lang="ts">
	import { page } from '$app/stores';
	import { PROPER_CROP_NAMES } from '$lib/constants/crops';
	import Minion from './minion.svelte';

	export let name: string | undefined;
	export let value: number;
	export let weight: number;
	export let tier: number;
	export let maxTier: number;
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
						class="rounded-lg pixelated aspect-square w-full p-[16%]"
						alt={name}
					/>
				</div>
			{/key}
			<div class="flex flex-col align-middle justify-center w-full">
				<div class="flex flex-row items-center gap-1">
					{#if rank > 0}
						<a
							href="/leaderboard/crops/{key}/{$page.params.id}-{$page.params.profile}"
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

		<div class="flex flex-col justify-center align-middle w-full p-1">
			<p class="md:ml-2 text-right font-semibold sm:text-lg md:text-xl lg:text-2xl">{weight.toLocaleString()}</p>
			<p class="md:ml-2 text-right sm:text-md md:text-lg text-gray-500">{tier} / {maxTier}</p>
		</div>
	</div>
	<Minion name={name ?? ''} {index} tierField={minionTierField} />
</div>

<style lang="postcss">
	.crop-container {
		@apply align-middle justify-center aspect-square object-contain;
		aspect-ratio: 1 / 1;
		background-repeat: no-repeat;
		background-size: 85% 85%;
		background-position: center;
		background-blend-mode: color;
	}
</style>
