<script lang="ts">
	import * as Popover from '$ui/popover';

	export let name: string;
	export let index: number;
	export let tierField: number;

	// Turn tierField into its binary representation
	$: tiersString = tierField?.toString(2).substring(0, 12) ?? '';
	$: tiers = tiersString.split('') ?? [];
	$: maxed = tiers.every((t) => t === '1');
	// Add 0s to the end of the array if it's less than 12 in length
	$: {
		while (tiers.length < 12) tiers.push('0');
	}
</script>

<Popover.Mobile>
	<div slot="trigger" class="image-container bg-muted p-1 md:p-2 lg:p-3 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20">
		<div class="image" style="background-position: 100% {1000 - 100 * index}%;"></div>
		<div class="tier-border">
			{#each tiers as tier, i}
				<div
					class="tier {tier === '1'
						? maxed
							? 'bg-yellow-400 dark:bg-yellow-600'
							: 'bg-green-400 dark:bg-green-600'
						: ''}"
					style="grid-area: a{i};"
				></div>
			{/each}
		</div>
		<div class="bg-primary-foreground absolute tier-cover"></div>
	</div>

	<div class="flex flex-col justify-center items-center max-w-lg">
		<div class="text-lg text-center my-2 mx-4">Unlocked {name} Minion Tiers</div>
		<div class="grid grid-cols-6 gap-1 justify-center items-center max-w-52">
			{#each tiers as tier, i}
				<div
					class="flex flex-row px-1 justify-center text-lg rounded-sm {tier === '1'
						? maxed
							? 'bg-yellow-400 dark:bg-yellow-600'
							: 'bg-green-400 dark:bg-green-600'
						: 'bg-primary-foreground'}"
				>
					<p>{i + 1}</p>
				</div>
			{/each}
		</div>
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
