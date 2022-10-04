<script lang="ts">
	import crops from '$lib/collections';

	export let name: string | undefined;
	export let value: number;
	export let weight: number;

	const crop = name ? crops.crops[name] : undefined;
	let tier = 0;
	let maxTier = 0;

	if (crop) {
		for (let i = crop.length - 1; i >= 0; i--) {
			if (value >= crop[i]) {
				tier = i + 1;
				break;
			}
		}

		maxTier = crop.length;
	}
</script>

<section class="p-1 m-1 bg-gray-100 rounded-lg">
	<h1 class="text-xl">{name} - {value.toLocaleString()} - {tier} - {weight.toLocaleString()}</h1>
	<div class="segments flex flex-row gap-1 px-1">
		{#each Array.from({ length: maxTier }) as _, i}
			<div class="w-1/6 h-6 bg-gray-300">
				{#if i < tier}
					<div class="w-full h-full bg-green-500" />
				{/if}
			</div>
		{/each}
	</div>
</section>

<style lang="postcss">
	/* Round left corners on first child of .segments */
	.segments > :first-child,
	.segments > :first-child > div {
		border-top-left-radius: 0.25rem;
		border-bottom-left-radius: 0.25rem;
	}

	/* Round right corners on last child of .segments */
	.segments > :last-child,
	.segments > :last-child > div {
		border-top-right-radius: 0.25rem;
		border-bottom-right-radius: 0.25rem;
	}
</style>
