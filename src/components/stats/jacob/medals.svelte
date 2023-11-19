<script lang="ts">
	import { page } from '$app/stores';
	import type { components } from '$lib/api/api';
	import { Popover } from 'flowbite-svelte';

	export let total: components['schemas']['MedalInventoryDto'] | undefined;
	export let earned: components['schemas']['EarnedMedalInventoryDto'] | undefined;
	export let ranks: {
		bronze: number;
		silver: number;
		gold: number;
		platinum: number;
		diamond: number;
	} = {
		bronze: -1,
		silver: -1,
		gold: -1,
		platinum: -1,
		diamond: -1,
	};

	$: medals = {
		'gold': total?.gold ?? 0,
		'silver': total?.silver ?? 0,
		'bronze': total?.bronze ?? 0
	} as Record<keyof typeof ranks, number>;

	$: earnedMedals = [
		['diamond', earned?.diamond ?? 0],
		['platinum', earned?.platinum ?? 0],
		['gold', earned?.gold ?? 0],
		['silver', earned?.silver ?? 0],
		['bronze', earned?.bronze ?? 0],
	] as [keyof typeof ranks, number][];

	$: profile = $page.params.profile;
</script>

<div id="Medals">
	<h3 class="text-2xl my-2">Jacob Contest Rankings</h3>
	<div class="flex flex-wrap md:flex-row gap-2 md:gap-4 justify-evenly w-full">
		{#each earnedMedals.slice(0, 2) as [medal, count] (medal)}
			{#if ranks[medal] > -1}
				<a
					href="/leaderboard/{medal}medals/+{$page.params.id}-{profile}"
					class="flex-1 basis-48 flex flex-row gap-3 items-center justify-center p-2 bg-gray-100 dark:bg-zinc-800 rounded-md hover:bg-gray-200 hover:dark:bg-zinc-700"
				>
					<img src="/images/medals/{medal}.webp" alt="Medal" class="w-12 h-12 pixelated" />

					<span class="text-2xl">{count.toLocaleString()}</span>

					<span class="bg-gray-300 dark:bg-zinc-900 px-1 py-0.5 rounded-md">
						<span class="text-sm">#</span><span class="text-md xs:text-lg sm:text-xl">{ranks[medal]}</span>
					</span>
				</a>
			{:else}
				<div
					class="flex-1 basis-48 flex flex-row gap-3 items-center justify-center p-2 bg-gray-100 dark:bg-zinc-800 rounded-md"
				>
					<img src="/images/medals/{medal}.webp" alt="Medal" class="w-12 h-12 pixelated" />

					<span class="text-2xl">{count.toLocaleString()}</span>
				</div>
			{/if}
			<Popover>
				<p>Placed in <span class="first-letter:capitalize inline-block">{medal}</span> Bracket {count.toLocaleString()} times!</p>
			</Popover>
		{/each}
	</div>
	<div class="flex flex-wrap md:flex-row gap-2 md:gap-4 justify-evenly w-full my-4">
		{#each earnedMedals.slice(2) as [medal, count] (medal)}
			{#if ranks[medal] > -1}
				<a
					href="/leaderboard/{medal}medals/+{$page.params.id}-{profile}"
					class="flex-1 basis-48 flex flex-row gap-3 items-center justify-center p-2 bg-gray-100 dark:bg-zinc-800 rounded-md hover:bg-gray-200 hover:dark:bg-zinc-700"
				>
					<img src="/images/medals/{medal}.webp" alt="Medal" class="w-12 h-12 pixelated" />

					<div class="flex flex-col">
						<span class="text-xl leading-none">{medals[medal].toLocaleString()}</span>
						<span class="text-2xl leading-none">{count.toLocaleString()}</span>
					</div>

					<span class="bg-gray-700 dark:bg-zinc-900 px-1 py-0.5 rounded-md">
						<span class="text-sm">#</span><span class="text-md xs:text-lg sm:text-xl">{ranks[medal]}</span>
					</span>
				</a>
			{:else}
				<div
					class="flex-1 basis-48 flex flex-row gap-3 items-center justify-center p-2 bg-gray-100 dark:bg-zinc-800 rounded-md"
				>
					<img src="/images/medals/{medal}.webp" alt="Medal" class="w-12 h-12 pixelated" />

					<div class="flex flex-col">
						<span class="text-xl leading-none">{medals[medal].toLocaleString()}</span>
						<span class="text-2xl leading-none">{count.toLocaleString()}</span>
					</div>
				</div>
			{/if}
			<Popover>
				<div class="flex flex-col">
					<span>{medals[medal].toLocaleString()} - Medals in Inventory</span>
					<span>{count.toLocaleString()} - Placements in {medal} bracket</span>
				</div>
			</Popover>
		{/each}
	</div>
</div>
