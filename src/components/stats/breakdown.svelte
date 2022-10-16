<script lang="ts">
	import type { WeightBreakdown } from "$db/models/users";
	import { PROPER_BONUS_NAME } from "$lib/constants/weights";

	export let weight: WeightBreakdown;

	const sources = Object.entries(weight.sources ?? {})
		.sort((a, b) => b[1] - a[1]);

	const bonuses = Object.entries(weight.bonuses ?? {})
		.sort((a, b) => a[0].localeCompare(b[0]));
</script>

<section class="py-4 flex justify-center align-middle" aria-labelledby="Breakdown">
	<div class="w-[90%] md:w-[70%] bg-gray-100 rounded-lg p-4">
		<h1 id="Breakdown" class="text-3xl text-center pt-2">Weight Breakdown</h1>
		<div class="block md:flex justify-evenly py-4">
			<div class="w-full md:w-1/3">
				<h3>
					<span class="font-semibold text-2xl">Crops</span>
					<span class="text-gray-500 pl-2">({(weight.total - weight.bonus).toLocaleString()})</span>
				</h3>
				{#each sources as [source, value]}
					<div class="item">
						<div class="name">{source}</div>
						<div class="flex-none">{value.toLocaleString()}</div>
					</div>
				{/each}
			</div>
			<div class="w-full md:w-1/3">
				<h3>
					<span class="font-semibold text-2xl">Bonus</span>
					<span class="text-gray-500 pl-2">({weight.bonus.toLocaleString()})</span>
				</h3>
				{#each bonuses as [bonus, value]}
					<div class="item">
						<div class="name capitalize">{PROPER_BONUS_NAME[bonus]}</div>
						<div class="flex-none">{value.toLocaleString()}</div>
					</div>
				{/each}
				<br>
				<h3>
					<span class="font-semibold text-2xl">Questions?</span>
				</h3>
				<div class="text-md pt-1">
					View all calculations on the <a href="/info" class="text-blue-600 hover:underline">info page</a>.
				</div>
			</div>
		</div>
	</div>
</section>

<style lang="postcss">
	.item {
		@apply flex flex-row items-center p-1;
	}

	.name {
		@apply flex-grow;
	}

	/* Alternate background colors */
	.item:nth-child(odd) {
		@apply bg-gray-200;
	}
</style>