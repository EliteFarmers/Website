<script lang="ts">
	import type { GardenDto } from '$lib/api';
	import { getCopperSpent, getCopperToMaxUpgrade } from '$lib/calc/garden';
	import { PROPER_CROP_TO_IMG } from '$lib/constants/crops';
	import * as Popover from '$ui/popover';
	import { Crop, getCropDisplayName, getCropUpgrades } from 'farming-weight';

	interface Props {
		garden?: GardenDto | undefined;
	}

	let { garden = undefined }: Props = $props();

	const upgradesList = [...Array(9).keys()];

	let upgrades = $derived(getCropUpgrades((garden?.cropUpgrades ?? {}) as Record<string, number>));
	let crops = $derived(
		Object.entries(upgrades)
			.map(([c, level]) => {
				const name = getCropDisplayName(c as Crop);
				const img = PROPER_CROP_TO_IMG[name as keyof typeof PROPER_CROP_TO_IMG];

				return { name, img, level };
			})
			.sort((a, b) => a.name.localeCompare(b.name))
	);
</script>

<div class="mt-0.5 flex flex-wrap justify-start">
	{#each crops as { name, img, level } (name)}
		{@const maxed = level === upgradesList.length}
		<div class="mt-1.5 flex basis-16 flex-row items-center justify-start gap-[0.1rem] md:basis-48 md:gap-1">
			<Popover.Mobile>
				{#snippet trigger()}
					<div class="flex items-center gap-1">
						<img src={img} class="pixelated h-6 w-6" alt={name} />
						{#each upgradesList as tier, i (i)}
							<div
								class="hidden h-5 w-3 rounded-sm md:block md:h-6 {tier + 1 > level
									? 'bg-card'
									: maxed
										? 'bg-completed'
										: 'bg-progress'}"
							></div>
						{/each}
						<span class="text-foreground -my-1 pr-2 pl-1 leading-none font-semibold md:text-lg">
							{level}
						</span>
					</div>
				{/snippet}
				<div class="flex flex-col gap-1">
					<p class="font-semibold">{name}</p>
					<p class="max-w-xs break-words whitespace-normal">
						<span class="font-semibold">{getCopperSpent(level).toLocaleString()}</span> Copper Spent <br />
					</p>
					<p class="max-w-xs break-words whitespace-normal">
						<span class="font-semibold">{getCopperToMaxUpgrade(level).toLocaleString()}</span> Copper Until Max
					</p>
				</div>
			</Popover.Mobile>
		</div>
	{/each}
</div>
