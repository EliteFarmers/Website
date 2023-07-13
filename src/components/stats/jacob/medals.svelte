<script lang="ts">
	import { page } from '$app/stores';
	import type { components } from '$lib/api/api';

	export let total: components['schemas']['MedalInventoryDto'] | undefined;
	export let earned: components['schemas']['MedalInventoryDto'] | undefined;
	export let ranks: {
		bronze: number;
		silver: number;
		gold: number;
	} = {
		bronze: -1,
		silver: -1,
		gold: -1,
	};

	$: totalBronze = total?.bronze ?? 0;
	$: totalSilver = total?.silver ?? 0;
	$: totalGold = total?.gold ?? 0;

	$: earnedBronze = earned?.bronze ?? 0;
	$: earnedSilver = earned?.silver ?? 0;
	$: earnedGold = earned?.gold ?? 0;

	$: profile = $page.params.profile;
</script>

<div id="Medals">
	<h3 class="text-2xl my-2">Medal Inventory <span class="text-lg ml-1 font-light">(Owned / Earned)</span></h3>
	<div class="flex flex-col md:flex-row gap-2 md:gap-4 justify-evenly w-full">
		<div class="flex items-baseline w-full justify-center gap-2 rounded-md p-2 md:p-4 bg-gray-200 dark:bg-zinc-700">
			{#if ranks.gold > -1}
				<a
					href="/leaderboard/goldmedals/+{$page.params.id}-{profile}"
					class="pd-0.5 px-1.5 bg-gray-100 dark:bg-zinc-800 rounded-md hover:bg-gray-200 hover:dark:bg-zinc-600"
				>
					<span class="text-sm xs:text-md sm:text-lg">#</span><span class="text-md xs:text-lg sm:text-xl"
						>{ranks.gold}</span
					>
				</a>
			{/if}
			<h1 class="text-2xl font-semibold text-yellow-500">
				<span class="font-normal">{totalGold.toLocaleString()} /</span>
				{earnedGold.toLocaleString()}
			</h1>
			<h2>Gold</h2>
		</div>
		<div class="flex items-baseline w-full justify-center gap-2 rounded-md p-2 md:p-4 bg-gray-200 dark:bg-zinc-700">
			{#if ranks.silver > -1}
				<a
					href="/leaderboard/silvermedals/+{$page.params.id}-{profile}"
					class="pd-0.5 px-1.5 bg-gray-100 dark:bg-zinc-800 rounded-md hover:bg-gray-200 hover:dark:bg-zinc-600"
				>
					<span class="text-sm xs:text-md sm:text-lg">#</span><span class="text-md xs:text-lg sm:text-xl"
						>{ranks.silver}</span
					>
				</a>
			{/if}
			<h1 class="text-2xl font-semibold text-stone-600 dark:text-zinc-300">
				<span class="font-normal">{totalSilver.toLocaleString()} /</span>
				{earnedSilver.toLocaleString()}
			</h1>
			<h2>Silver</h2>
		</div>
		<div class="flex items-baseline w-full justify-center gap-2 rounded-md p-2 md:p-4 bg-gray-200 dark:bg-zinc-700">
			{#if ranks.bronze > -1}
				<a
					href="/leaderboard/bronzemedals/+{$page.params.id}-{profile}"
					class="pd-0.5 px-1.5 bg-gray-100 dark:bg-zinc-800 rounded-md hover:bg-gray-200 hover:dark:bg-zinc-600"
				>
					<span class="text-sm xs:text-md sm:text-lg">#</span><span class="text-md xs:text-lg sm:text-xl"
						>{ranks.bronze}</span
					>
				</a>
			{/if}
			<h1 class="text-2xl font-semibold text-orange-700">
				<span class="font-normal">{totalBronze.toLocaleString()} /</span>
				{earnedBronze.toLocaleString()}
			</h1>
			<h2>Bronze</h2>
		</div>
	</div>
</div>
