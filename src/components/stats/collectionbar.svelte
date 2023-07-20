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

	$: frameStyle = '';

	$: {
		if (crop && name) {
			index = cropArray.indexOf(name);
		}

		if (rank > 0) {
			if (rank <= 5) {
				frameStyle = 'background-image: url(/images/frames/rainbow.webp);';
			} else if (rank <= 10) {
				frameStyle = 'background-image: url(/images/frames/mithril.webp);';
			} else if (rank <= 50) {
				frameStyle = 'background-image: url(/images/frames/gold.webp);';
			} else if (rank <= 100) {
				frameStyle = 'background-image: url(/images/frames/silver.webp);';
			} else if (rank <= 500) {
				frameStyle = 'background-image: url(/images/frames/bronze.webp);';
			}
		}
	}
</script>

<div class="p-1 m-1 flex gap-4 w-full">
	<div class="bg-gray-100 dark:bg-zinc-800 rounded-lg flex justify-center align-middle w-full max-h-20">
		<div class="hidden md:flex crop-container p-1 md:p-3" style={frameStyle}>
			<img src="/images/crops/{key}.png" class="crop" alt={name} />
		</div>
		<div class="flex flex-col gap-2 w-[100%] px-3 py-1">
			<div class="flex justify-between">
				<span>
					<h1 class="w-1 md:w-fit text-xl md:text-2xl">
						<span class="whitespace-nowrap">
							{#if rank > 0}
								<a
									href="/leaderboard/crops/{key}/+{$page.params.id}-{$page.params.profile}"
									class="pd-0.5 px-1.5 bg-gray-100 dark:bg-zinc-900 rounded-md hover:bg-gray-200 hover:dark:bg-zinc-700"
								>
									<span class="text-sm xs:text-md sm:text-lg">#</span><span
										class="text-md xs:text-lg sm:text-xl">{rank}</span
									>
								</a>
							{/if}
							<span class="hidden md:inline">{value.toLocaleString()}</span>
							<span class="text-lg">{name}</span>
						</span>
						<span class="inline md:hidden">{value.toLocaleString()}</span>
					</h1>
				</span>
				<h1 class="flex flex-col-reverse md:flex-row justify-end">
					<span class="text-lg text-right text-gray-600">{tier} / {maxTier}</span>
					<span class="md:ml-2 text-right font-semibold text-xl">{weight.toLocaleString()}</span>
				</h1>
			</div>
			<div class="hidden md:flex flex-row gap-[0.15rem] md:gap-1 segments h-6">
				{#each Array.from({ length: maxTier }) as _, i}
					<div class="w-1/6 h-[100%] {i < tier ? 'bg-green-500' : 'bg-gray-200 dark:bg-zinc-700'}" />
				{/each}
			</div>
		</div>
	</div>
	<Minion name={name ?? ''} {index} tierField={minionTierField} />
</div>

<style lang="postcss">
	.crop-container {
		@apply align-middle justify-center aspect-square object-contain w-20 h-20;
		aspect-ratio: 1 / 1;
		background-repeat: no-repeat;
		background-size: 85% 85%;
		background-position: center;
		background-blend-mode: color;
		image-rendering: pixelated;
	}
	.crop {
		@apply rounded-lg;
		display: inline-block;
		width: 100%;
		aspect-ratio: 1;
		image-rendering: pixelated;
	}

	/* Mobile styles */
	@media (max-width: 640px) {
		.crop-container {
			width: 8vw;
			height: 8vw;
		}
	}

	/* Round left corners on first child of .segments */
	.segments > :first-child {
		border-top-left-radius: 0.25rem;
		border-bottom-left-radius: 0.25rem;
	}

	/* Round right corners on last child of .segments */
	.segments > :last-child {
		border-top-right-radius: 0.25rem;
		border-bottom-right-radius: 0.25rem;
	}
</style>
