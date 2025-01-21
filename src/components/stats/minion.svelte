<script lang="ts">
	import * as Popover from '$ui/popover';

	interface Props {
		name: string;
		index: number;
		tierField: number;
		size?: 'sm' | 'md';
	}

	let { name, index, tierField, size = 'md' }: Props = $props();

	// Turn tierField into its binary representation
	let tiersString = $derived(tierField?.toString(2).substring(0, 12) ?? '');
	let tiers = $derived(tiersString.split('') ?? []);
	let maxed = $derived(tiers.every((t) => t === '1'));
	// Add 0s to the end of the array if it's less than 12 in length
	$effect(() => {
		while (tiers.length < 12) tiers.push('0');
	});
</script>

<Popover.Mobile>
	{#snippet trigger()}
		<div
			class="image-container bg-muted p-1 md:p-2 lg:p-3 {size === 'md'
				? 'size-12 sm:size-16 md:size-20'
				: 'size-10 sm:size-12 md:size-16'}"
		>
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
			<div class="tier-cover absolute bg-primary-foreground"></div>
		</div>
	{/snippet}

	<div class="flex max-w-lg flex-col items-center justify-center">
		<div class="mx-4 my-2 text-center text-lg">Unlocked {name} Minion Tiers</div>
		<div class="grid max-w-52 grid-cols-6 items-center justify-center gap-1">
			{#each tiers as tier, i}
				<div
					class="flex flex-row justify-center rounded-sm px-1 text-lg {tier === '1'
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
		@apply flex justify-center rounded-lg object-cover align-middle;
		aspect-ratio: 1 / 1 !important;
		position: relative;
	}

	.tier-border {
		@apply absolute left-0 top-0 grid h-full w-full rounded-lg;
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
		background-image: url(/images/cropatlas.webp);
		background-size: 200% 1000%;
		z-index: 3;
	}
</style>
