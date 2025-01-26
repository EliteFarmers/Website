<script lang="ts">
	import { Crop, getCropDisplayName, getCropFromName, getCropUpgrades } from 'farming-weight';
	import type { components } from '$lib/api/api';
	import { PROPER_CROP_TO_IMG } from '$lib/constants/crops';

	interface Props {
		garden?: components['schemas']['GardenDto'] | undefined;
	}

	let { garden = undefined }: Props = $props();

	const upgradesList = [...Array(9).keys()];

	let upgrades = $derived(getCropUpgrades((garden?.cropUpgrades ?? {}) as Record<string, number>));
	let crops = $derived(
		Object.entries(upgrades)
			.map(([c, level]) => {
				const crop = getCropFromName(c) ?? Crop.Wheat;
				const name = getCropDisplayName(crop);
				const img = PROPER_CROP_TO_IMG[name as keyof typeof PROPER_CROP_TO_IMG];

				return { name, img, level };
			})
			.sort((a, b) => a.name.localeCompare(b.name))
	);
</script>

<div class="-mt-0.5 flex flex-wrap justify-start">
	{#each crops as { name, img, level } (name)}
		{@const maxed = level === upgradesList.length}
		<div class="my-1.5 flex basis-16 flex-row items-center justify-start gap-[0.1rem] md:basis-48 md:gap-1">
			<img src={img} class="pixelated h-6 w-6" alt={name} />
			{#each upgradesList as tier, i (i)}
				<div
					class="hidden h-5 w-3 rounded-sm md:block md:h-6 {tier + 1 > level
						? 'bg-primary-foreground'
						: maxed
							? 'bg-completed'
							: 'bg-progress'}"
				></div>
			{/each}
			<span
				class="-my-1 pl-1 pr-2 font-semibold leading-none md:text-lg {maxed ? 'text-completed' : ''} bg-primary"
			>
				{level}
			</span>
		</div>
	{/each}
</div>
