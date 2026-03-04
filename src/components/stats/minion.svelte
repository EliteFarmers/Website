<script lang="ts" module>
	import { Crop } from 'farming-weight';

	export const MinionIds: Record<Crop, string> = {
		[Crop.Cactus]: 'CACTUS_GENERATOR_',
		[Crop.Carrot]: 'CARROT_GENERATOR_',
		[Crop.CocoaBeans]: 'COCOA_GENERATOR_',
		[Crop.Melon]: 'MELON_GENERATOR_',
		[Crop.Mushroom]: 'MUSHROOM_GENERATOR_',
		[Crop.NetherWart]: 'NETHER_WARTS_GENERATOR_',
		[Crop.Potato]: 'POTATO_GENERATOR_',
		[Crop.Pumpkin]: 'PUMPKIN_GENERATOR_',
		[Crop.SugarCane]: 'SUGAR_CANE_GENERATOR_',
		[Crop.Wheat]: 'WHEAT_GENERATOR_',
		[Crop.Sunflower]: 'SUNFLOWER_GENERATOR_',
		[Crop.Moonflower]: 'SUNFLOWER_GENERATOR_',
		[Crop.WildRose]: 'FLOWER_GENERATOR_',
		[Crop.Seeds]: 'WHEAT_GENERATOR_',
	};

	export const MinionNames: Partial<Record<Crop, string>> = {
		[Crop.Sunflower]: 'Sunflower',
		[Crop.Moonflower]: 'Sunflower',
		[Crop.WildRose]: 'Flower',
	};
</script>

<script lang="ts">
	import * as Popover from '$ui/popover';

	interface Props {
		name: string;
		crop: Crop;
		tierField: number;
		size?: 'sm' | 'md';
	}

	let { name, crop, tierField, size = 'md' }: Props = $props();

	let minionName = $derived(MinionIds[crop]);

	// Turn tierField into its binary representation
	let tiersString = $derived(tierField?.toString(2).substring(0, 12) ?? '');
	let tiers = $derived(tiersString.split('') ?? []);
	let maxed = $derived(tiers.every((t) => t === '1'));
	// Add 0s to the end of the array if it's less than 12 in length
	$effect(() => {
		while (tiers.length < 12) tiers.push('0');
	});

	let highestTier = $derived.by(() => {
		for (let i = tiers.length - 1; i >= 0; i--) {
			if (tiers[i] === '1') {
				return i + 1;
			}
		}
		return 1;
	});
</script>

<Popover.Mobile>
	{#snippet trigger()}
		<div
			class="image-container bg-muted p-1 md:p-2 lg:p-3 {size === 'md'
				? 'size-12 sm:size-16 md:size-20'
				: 'size-10 sm:size-12 md:size-16'}"
		>
			<div class="image" style="background-image: url(/api/item/{minionName}{highestTier});"></div>
			<div class="tier-border">
				{#each tiers as tier, i (i)}
					<div
						class="tier {tier === '1' ? (maxed ? 'bg-completed' : 'bg-progress') : ''}"
						style="grid-area: a{i};"
					></div>
				{/each}
			</div>
			<div class="tier-cover bg-card absolute"></div>
		</div>
	{/snippet}

	<div class="flex max-w-lg flex-col items-center justify-center">
		<div class="mx-4 my-2 text-center text-lg">Unlocked {MinionNames[crop] ?? name} Minion Tiers</div>
		<div class="grid max-w-52 grid-cols-6 items-center justify-center gap-1">
			{#each tiers as tier, i (i)}
				<div
					class="flex flex-row justify-center rounded-sm px-1 text-lg {tier === '1'
						? maxed
							? 'bg-completed'
							: 'bg-progress'
						: 'bg-card'}"
				>
					<p>{i + 1}</p>
				</div>
			{/each}
		</div>
	</div>
</Popover.Mobile>

<style lang="postcss">
	@reference '$css';

	.image-container {
		@apply flex justify-center rounded-lg object-cover align-middle;
		aspect-ratio: 1 / 1 !important;
		position: relative;
	}

	.tier-border {
		@apply absolute top-0 left-0 grid h-full w-full rounded-lg;
		grid-template-areas:
			'a10 a11 a0 a1'
			'a9 . . a2'
			'a8 . . a3'
			'a7 a6 a5 a4';
		z-index: 1;
		overflow: hidden;
	}

	.tier-cover {
		border-radius: 0.25rem;
		width: 86%;
		height: 86%;
		top: 7%;
		left: 7%;
		z-index: 2;
	}

	.image {
		@apply inline-block aspect-square w-16 rounded-lg;
		background-size: cover;
		z-index: 3;
	}
</style>
