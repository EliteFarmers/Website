<script lang="ts">
	import {
		API_COMPOSTER_UPGRADE_TO_UPGRADE,
		getCropDisplayName,
		getComposterUpgradeDisplayName,
		getSpecialCropDisplayName,
	} from 'farming-weight';
	import { PROPER_CROP_TO_IMG, SPECIAL_CROP_TO_IMG } from '$lib/constants/crops';
	import { COMPOSTER_UPGRADE_TO_IMG } from '$lib/constants/composter';
	import * as Popover from '$ui/popover';
	import { getComposterUpgradeCost } from '$lib/calc/garden';
	import { getStatsContext } from '$lib/stores/stats.svelte';

	const garden = getStatsContext().garden;

	const maxLevel = 25;

	let composterUpgrades = $derived(
		garden?.composter?.upgrades || {
			speed: 0,
			multi_drop: 0,
			fuel_cap: 0,
			organic_matter_cap: 0,
			cost_reduction: 0,
		}
	);

	let upgrades = $derived(
		Object.entries(composterUpgrades).map(([key, level]) => {
			const upgradeType = API_COMPOSTER_UPGRADE_TO_UPGRADE[key as keyof typeof API_COMPOSTER_UPGRADE_TO_UPGRADE];
			const isMaxed = level >= maxLevel;

			const nextCost = !isMaxed ? getComposterUpgradeCost(upgradeType, level + 1) : null;

			return {
				type: upgradeType,
				img: COMPOSTER_UPGRADE_TO_IMG[upgradeType as keyof typeof COMPOSTER_UPGRADE_TO_IMG],
				level,
				nextCost,
			};
		})
	);
</script>

<div class="-mt-0.5 flex flex-col">
	<h3 class="mt-2 mb-4 text-lg leading-none font-semibold">Composter Upgrades</h3>
	<div class="flex flex-col gap-2">
		{#each upgrades as { type, img, level, nextCost } (type)}
			<Popover.Mobile>
				{#snippet trigger()}
					<div class="flex items-center gap-1 p-1">
						<img src={img} class="pixelated h-6 w-6" alt={getComposterUpgradeDisplayName(type)} />
						<div class="flex items-center gap-1">
							<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
							{#each Array(maxLevel) as _, i (i)}
								<div
									class="h-5 w-4 rounded-sm md:block md:h-6 {i < level
										? level === maxLevel
											? 'bg-completed'
											: 'bg-progress'
										: 'bg-card'}"
								></div>
							{/each}
							<span class="ml-2 font-semibold">{level}</span>
						</div>
					</div>
				{/snippet}
				<div class="flex flex-col gap-1 p-1">
					<p class="text-lg font-semibold">{name}</p>
					<p class="mb-2 text-sm">Level {level} / {maxLevel}</p>

					{#if nextCost}
						<div class="border-t pt-2">
							<p class="font-semibold">Next Level Cost:</p>
							<p><span class="font-medium">{nextCost.copper.toLocaleString()}</span> Copper</p>

							{#if nextCost.specialCrop}
								<p>
									{#if SPECIAL_CROP_TO_IMG[nextCost.specialCrop as keyof typeof SPECIAL_CROP_TO_IMG]}
										<img
											src={SPECIAL_CROP_TO_IMG[
												nextCost.specialCrop as keyof typeof SPECIAL_CROP_TO_IMG
											]}
											class="pixelated mr-1 inline-block h-4 w-4"
											alt={getSpecialCropDisplayName(nextCost.specialCrop)}
										/>
									{/if}
									<span class="font-medium">{nextCost.specialCropAmount.toLocaleString()}</span>
									{getSpecialCropDisplayName(nextCost.specialCrop)}
								</p>
							{/if}

							{#if nextCost.crop}
								<p>
									{#if PROPER_CROP_TO_IMG[getCropDisplayName(nextCost.crop)]}
										<img
											src={PROPER_CROP_TO_IMG[getCropDisplayName(nextCost.crop)]}
											class="pixelated mr-1 inline-block h-4 w-4"
											alt={getCropDisplayName(nextCost.crop)}
										/>
									{/if}
									<span class="font-medium">{nextCost.cropAmount.toLocaleString()}</span>
									{getCropDisplayName(nextCost.crop)}
								</p>
							{/if}
						</div>
					{:else}
						<p class="text-completed font-medium">Max Level Reached</p>
					{/if}
				</div>
			</Popover.Mobile>
		{/each}
	</div>
</div>
