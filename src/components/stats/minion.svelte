<script lang="ts">
	import * as Popover from '$ui/popover';

	export let name: string;
	export let index: number;
	export let tierField: number;

	// Turn tierField into its binary representation
	$: tiers = tierField?.toString(2).substring(0, 12).split('') ?? [];
	// Add 0s to the end of the array if it's less than 12 in length
	$: {
		while (tiers.length < 12) tiers.push('0');
	}
</script>

<Popover.Mobile>
	<div
		slot="trigger"
		class="image-container bg-muted p-1 md:p-2 lg:p-3 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20"
	>
		<div class="image" style="background-position: 100% {1000 - 100 * index}%;" />
		<div class="tier-border">
			{#each tiers as tier, i}
				<div class="tier {tier === '1' ? 'bg-green-500' : ''}" style="grid-area: a{i};" />
			{/each}
		</div>
		<div class="bg-primary-foreground absolute tier-cover" />
	</div>

	<div class="text-lg text-center">Unlocked {name} Minion Tiers</div>
	<div class="flex gap-1 justify-center items-center text-black dark:text-white">
		{#each tiers as tier, i}
			<div
				class="block flex-1 px-1 text-center text-lg rounded-sm {tier === '1'
					? 'bg-muted'
					: 'bg-primary-foreground'}"
			>
				<p>{i + 1}</p>
			</div>
		{/each}
	</div>
</Popover.Mobile>

<style lang="postcss">
	.image-container {
		@apply flex align-middle justify-center rounded-lg object-cover;
		aspect-ratio: 1 / 1 !important;
		position: relative;
	}

	.tier-border {
		@apply grid absolute rounded-lg w-full h-full top-0 left-0;
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
		@apply rounded-lg inline-block w-16 aspect-square;
		background-image: url(/images/cropatlas.webp);
		background-size: 200% 1000%;
		z-index: 3;
	}
</style>
