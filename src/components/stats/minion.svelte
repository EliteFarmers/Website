<script lang="ts">
	import { Popover } from 'flowbite-svelte';

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

<div>
	<div class="image-container bg-gray-100 dark:bg-zinc-800 p-1 md:p-2 lg:p-3 w-16 h-16 md:w-20 md:h-20">
		<div class="image" style="background-position: 100% {1000 - 100 * index}%;" />
		<div class="tier-border">
			{#each tiers as tier, i}
				<div
					class="tier {tier === '1' ? 'bg-green-500' : 'bg-gray-200 dark:bg-zinc-700'}"
					style="grid-area: a{i};"
				/>
			{/each}
		</div>
		<div class="bg-gray-100 dark:bg-zinc-800 absolute tier-cover" />
	</div>
	<Popover placement="left">
		<div slot="title" class="text-lg text-center">Unlocked {name} Minion Tiers</div>
		<div class="flex gap-1 justify-center items-center text-black dark:text-white">
			{#each tiers as tier, i}
				<div
					class="block flex-1 px-1 text-center text-lg rounded-sm {tier === '1'
						? 'bg-green-500'
						: 'bg-gray-200 dark:bg-zinc-700'}"
				>
					<p>{i + 1}</p>
				</div>
			{/each}
		</div>
	</Popover>
</div>

<style lang="postcss">
	.image-container {
		@apply flex align-middle justify-center rounded-lg object-cover;
		aspect-ratio: 1 / 1 !important;
		position: relative;
	}

	.tier-border {
		@apply grid absolute rounded-lg w-full h-full top-0 left-0;
		gap: 0.25vw;
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
