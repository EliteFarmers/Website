<script lang="ts">
	import ItemIcon from '$comp/items/item-icon.svelte';
	import type { ContestRecap } from '$lib/api/schemas';
	import { PROPER_CROP_TO_IMG } from '$lib/constants/crops';
	import * as Item from '$ui/item/index.js';
	import { Crop, getCropDisplayName, getCropFromName } from 'farming-weight';

	interface Props {
		data: ContestRecap;
	}

	let { data }: Props = $props();

	// Sort crops by participation
	let sortedCrops = $derived(Object.entries(data.perCrop).sort(([, a], [, b]) => b - a));

	const getCropUrl = (crop: string) =>
		PROPER_CROP_TO_IMG[getCropDisplayName(getCropFromName(crop) ?? Crop.Wheat)] || '';
</script>

<div
	class="flex h-full w-full flex-col items-center justify-center bg-gradient-to-b from-yellow-950 to-orange-950 p-8 text-white"
>
	<h2
		class="animate-slide-in-left mb-12 bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-5xl font-bold text-transparent"
	>
		Jacob's Contests
	</h2>

	<div class="grid w-full max-w-5xl grid-cols-1 gap-12 md:grid-cols-2">
		<!-- Participation Stats -->
		<Item.Root
			variant="outline"
			class="animate-fade-in flex-col items-center justify-center border-white/10 bg-white/5 p-8 backdrop-blur-md delay-200"
		>
			<Item.Content class="w-full">
				<Item.Title class="mb-2 text-3xl font-bold text-white">{data.total}</Item.Title>
				<Item.Description class="mb-6 text-orange-200/70">Total Contests Joined</Item.Description>

				<div class="w-full space-y-4 text-left">
					{#each sortedCrops.slice(0, 5) as [crop, count] (crop)}
						<div class="flex items-center gap-4">
							<span class="flex min-w-32 items-center gap-2 font-medium">
								<ItemIcon url={getCropUrl(crop)} class="size-6 border-0 bg-transparent shadow-none" />
								{getCropDisplayName(getCropFromName(crop) ?? Crop.Wheat)}
							</span>
							<div class="flex flex-1 items-center gap-2">
								<div class="h-2 grow rounded-full bg-white/10">
									<div
										class="h-full rounded-full bg-yellow-500"
										style:width="{(count / data.total) * 100}%"
									></div>
								</div>
								<span class="min-w-8 text-right text-sm text-zinc-400">{count}</span>
							</div>
						</div>
					{/each}
				</div>
			</Item.Content>
		</Item.Root>

		<!-- Highest Placements -->
		<div class="animate-fade-in space-y-4 delay-500">
			<h3 class="mb-6 text-center text-2xl font-bold text-white">Best Performances</h3>
			{#each data.highestPlacements as placement (placement.crop)}
				<Item.Root variant="outline" class="border-white/10 bg-white/5 backdrop-blur-sm">
					<Item.Media>
						<ItemIcon
							url={getCropUrl(placement.crop)}
							class="size-10 rounded-md border-0 bg-transparent shadow-none"
						/>
					</Item.Media>
					<Item.Content>
						<Item.Title class="text-white"
							>{getCropDisplayName(getCropFromName(placement.crop) ?? Crop.Wheat)}</Item.Title
						>
						<Item.Description
							class={placement.medal === 'Diamond'
								? 'text-cyan-300'
								: placement.medal === 'Platinum'
									? 'text-emerald-300'
									: 'text-yellow-300'}
						>
							{placement.medal} Medal
						</Item.Description>
					</Item.Content>
					<Item.Actions>
						<span class="text-lg font-bold text-white">#{placement.rank}</span>
					</Item.Actions>
				</Item.Root>
			{/each}
		</div>
	</div>
</div>

<style>
	@keyframes slide-in-left {
		from {
			opacity: 0;
			transform: translateX(-50px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}
	.animate-slide-in-left {
		animation: slide-in-left 0.8s ease-out forwards;
	}
	.delay-200 {
		animation-delay: 0.2s;
		opacity: 0;
		animation-fill-mode: forwards;
	}
	.delay-500 {
		animation-delay: 0.5s;
		opacity: 0;
		animation-fill-mode: forwards;
	}

	@keyframes fade-in {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	.animate-fade-in {
		animation: fade-in 0.8s ease-out forwards;
	}
</style>
