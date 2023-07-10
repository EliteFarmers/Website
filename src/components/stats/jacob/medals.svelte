<script lang="ts">
	import type { components } from '$lib/eliteapi/api';

	export let total: components['schemas']['MedalInventoryDto'] | undefined;
	export let earned: components['schemas']['MedalInventoryDto'] | undefined;

	$: totalBronze = total?.bronze ?? 0;
	$: totalSilver = total?.silver ?? 0;
	$: totalGold = total?.gold ?? 0;

	$: earnedBronze = earned?.bronze ?? 0;
	$: earnedSilver = earned?.silver ?? 0;
	$: earnedGold = earned?.gold ?? 0;
</script>

<div id="Medals">
	<h3 class="text-2xl my-2">Medal Inventory <span class="text-lg ml-1 font-light">(Owned / Earned)</span></h3>
	<div class="flex flex-col md:flex-row gap-2 md:gap-4 justify-evenly w-full">
		<div class="flex items-baseline w-full justify-center gap-2 rounded-md p-2 md:p-4 bg-gray-200 dark:bg-zinc-700">
			<h1 class="text-2xl font-semibold text-yellow-500">
				<span class="font-normal">{totalGold.toLocaleString()} /</span>
				{earnedGold.toLocaleString()}
			</h1>
			<h2>Gold</h2>
		</div>
		<div class="flex items-baseline w-full justify-center gap-2 rounded-md p-2 md:p-4 bg-gray-200 dark:bg-zinc-700">
			<h1 class="text-2xl font-semibold text-stone-600 dark:text-zinc-300">
				<span class="font-normal">{totalSilver.toLocaleString()} /</span>
				{earnedSilver.toLocaleString()}
			</h1>
			<h2>Silver</h2>
		</div>
		<div class="flex items-baseline w-full justify-center gap-2 rounded-md p-2 md:p-4 bg-gray-200 dark:bg-zinc-700">
			<h1 class="text-2xl font-semibold text-orange-700">
				<span class="font-normal">{totalBronze.toLocaleString()} /</span>
				{earnedBronze.toLocaleString()}
			</h1>
			<h2>Bronze</h2>
		</div>
	</div>
</div>
