<script lang="ts">
	import type { MedalInventory } from '$lib/skyblock';

	export let total: MedalInventory;
	export let earned: MedalInventory;

	total.bronze = total.bronze ?? 0;
	total.silver = total.silver ?? 0;
	total.gold = total.gold ?? 0;

	earned.bronze = earned.bronze ?? 0;
	earned.silver = earned.silver ?? 0;
	earned.gold = earned.gold ?? 0;
</script>

<div id="Medals">
	<h3 class="text-2xl my-2">Medal Inventory <span class="text-lg ml-1 font-light">(Owned / Earned)</span></h3>
	<div class="flex flex-col md:flex-row gap-2 md:gap-4 justify-evenly w-full">
		<div class="flex items-baseline w-full justify-center gap-2 rounded-md p-2 md:p-4 bg-gray-200 dark:bg-zinc-700">
			<h1 class="text-2xl font-semibold text-yellow-500">
				<span class="font-normal">{total.gold.toLocaleString()} /</span>
				{earned.gold.toLocaleString()}
			</h1>
			<h2>Gold</h2>
		</div>
		<div class="flex items-baseline w-full justify-center gap-2 rounded-md p-2 md:p-4 bg-gray-200 dark:bg-zinc-700">
			<h1 class="text-2xl font-semibold text-stone-600 dark:text-zinc-300">
				<span class="font-normal">{total.silver.toLocaleString()} /</span>
				{earned.silver.toLocaleString()}
			</h1>
			<h2>Silver</h2>
		</div>
		<div class="flex items-baseline w-full justify-center gap-2 rounded-md p-2 md:p-4 bg-gray-200 dark:bg-zinc-700">
			<h1 class="text-2xl font-semibold text-orange-700">
				<span class="font-normal">{total.bronze.toLocaleString()} /</span>
				{earned.bronze.toLocaleString()}
			</h1>
			<h2>Bronze</h2>
		</div>
	</div>
</div>
