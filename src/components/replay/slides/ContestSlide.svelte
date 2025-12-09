<script lang="ts">
	import ItemIcon from '$comp/items/item-icon.svelte';
	import { PROPER_CROP_TO_IMG } from '$lib/constants/crops';
	import { getRecapContext } from '$lib/stores/recap.svelte';
	import * as Item from '$ui/item/index.js';
	import { Crop, getCropDisplayName, getCropFromName } from 'farming-weight';

	const context = getRecapContext();
	let data = $derived(context.data.contests);

	// Sort crops by participation
	let sortedCrops = $derived(Object.entries(data.perCrop).sort(([, a], [, b]) => b - a));

	const getCropUrl = (crop: string) =>
		PROPER_CROP_TO_IMG[getCropDisplayName(getCropFromName(crop) ?? Crop.Wheat)] || '';
</script>

<div
	class="flex h-full w-full flex-col items-center justify-center overflow-auto bg-linear-to-b from-yellow-950 to-orange-950 p-4 text-white md:p-8"
>
	<h2
		class="animate-slide-in-left mb-6 bg-linear-to-r from-yellow-300 to-orange-400 bg-clip-text text-center text-3xl font-bold text-transparent md:mb-12 md:text-5xl"
	>
		Jacob's Contests
	</h2>

	<div class="grid w-full max-w-5xl grid-cols-1 gap-4 md:gap-12 lg:grid-cols-2">
		<Item.Root
			variant="outline"
			class="animate-fade-in flex-col items-center justify-center border-white/10 bg-white/5 p-4 backdrop-blur-md delay-200 md:p-8"
		>
			<Item.Content class="w-full">
				<Item.Title class="mb-1 text-center text-2xl font-bold text-white md:mb-2 md:text-3xl"
					>{data.total.toLocaleString()}</Item.Title
				>
				<Item.Description class="mb-4 text-xs text-orange-200/70 md:mb-6 md:text-base"
					>Total Contests Joined</Item.Description
				>

				<div class="w-full space-y-2 text-left md:space-y-4">
					{#each sortedCrops.slice(0, 5) as [crop, count] (crop)}
						<div class="flex items-center gap-2 md:gap-4">
							<span class="flex min-w-24 items-center gap-2 text-xs font-medium md:min-w-32 md:text-base">
								<ItemIcon
									url={getCropUrl(crop)}
									class="size-4 border-0 bg-transparent shadow-none md:size-6"
								/>
								<span class="truncate">{getCropDisplayName(getCropFromName(crop) ?? Crop.Wheat)}</span>
							</span>
							<div class="flex flex-1 items-center gap-2">
								<div class="h-1.5 grow rounded-full bg-white/10 md:h-2">
									<div
										class="h-full rounded-full bg-yellow-500"
										style:width="{(count / data.total) * 100}%"
									></div>
								</div>
								<span class="min-w-6 text-right text-[10px] text-zinc-400 md:min-w-8 md:text-sm"
									>{count}</span
								>
							</div>
						</div>
					{/each}
				</div>
			</Item.Content>
		</Item.Root>

		<div
			class="animate-fade-in grid max-h-[40vh] grid-cols-2 gap-2 overflow-y-auto delay-500 md:max-h-none md:grid-cols-1 md:gap-4 md:overflow-visible"
		>
			<h3 class="col-span-2 mb-1 w-full text-center text-sm font-bold text-white md:mb-6 md:text-2xl">
				Best Placements
			</h3>
			{#each data.highestPlacements.sort((a, b) => a.rank - b.rank).slice(0, 6) as placement (placement.crop)}
				<Item.Root variant="outline" class="border-white/10 bg-white/5 p-2 backdrop-blur-sm md:p-4">
					<Item.Media class="hidden md:block">
						<ItemIcon
							url={getCropUrl(placement.crop)}
							class="size-6 rounded-md border-0 bg-transparent shadow-none md:size-10"
						/>
					</Item.Media>
					<Item.Content>
						<Item.Title class="text-xs text-white md:text-base"
							>{getCropDisplayName(getCropFromName(placement.crop) ?? Crop.Wheat)}</Item.Title
						>
						<Item.Description
							class="text-[10px] {placement.medal === 'Diamond'
								? 'text-cyan-300'
								: placement.medal === 'Platinum'
									? 'text-emerald-300'
									: 'text-yellow-300'} md:text-sm"
						>
							{placement.medal === 'None' ? 'No Medal' : placement.medal}
						</Item.Description>
					</Item.Content>
					<Item.Actions>
						<span class="text-sm font-bold text-white md:text-lg">#{placement.rank + 1}</span>
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
