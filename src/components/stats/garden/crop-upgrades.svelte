<script lang="ts">
	import { Crop, getCropDisplayName, getCropFromName, getCropUpgrades } from 'farming-weight';
	import type { components } from '$lib/api/api';
	import { PROPER_CROP_TO_IMG } from '$lib/constants/crops';

	export let garden: components['schemas']['GardenDto'] | undefined = undefined;

	const upgradesList = Array.from({ length: 9 });

	$: upgrades = getCropUpgrades((garden?.cropUpgrades ?? {}) as Record<string, number>);
	$: crops = Object.entries(upgrades)
		.map(([c, level]) => {
			const crop = getCropFromName(c) ?? Crop.Wheat;
			const name = getCropDisplayName(crop);
			const img = PROPER_CROP_TO_IMG[name as keyof typeof PROPER_CROP_TO_IMG];

			return { name, img, level };
		})
		.sort((a, b) => a.name.localeCompare(b.name));
</script>

<div class="flex flex-wrap justify-start">
	{#each crops as { name, img, level } (name)}
		{@const maxed = level === upgradesList.length}
		<div class="flex flex-row basis-16 md:basis-48 my-1.5 items-center justify-start gap-[0.1rem] md:gap-1">
			<img src={img} class="w-6 h-6 pixelated" alt={name} />
			{#each upgradesList as _, i (i)}
				<div
					class="w-3 h-5 hidden md:block md:h-6 rounded-sm {i + 1 > level
						? 'bg-primary-foreground'
						: maxed
						? 'bg-yellow-400 dark:bg-yellow-600'
						: 'bg-green-400 dark:bg-green-600'}"
				/>
			{/each}
			<span
				class="leading-none font-semibold md:text-lg pl-1 pr-2 -my-1 {maxed
					? 'text-yellow-400 dark:text-yellow-500'
					: ''} dark:md:text-white md:text-black"
			>
				{level}
			</span>
		</div>
	{/each}
</div>
