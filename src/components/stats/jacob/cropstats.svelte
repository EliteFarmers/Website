<script lang="ts">
	import type { components } from '$lib/api/api';
	import { PROPER_CROP_TO_IMG } from '$lib/constants/crops';
	import { Popover } from 'flowbite-svelte';

	export let jacob: components['schemas']['JacobDataDto'] | undefined | null;

	$: highest = Object.entries(
		jacob?.contests?.reduce((acc, contest) => {
			if (!contest?.crop) return acc;

			if (contest.crop in acc) {
				acc[contest.crop]++;
			} else {
				acc[contest.crop] = 1;
			}
			return acc;
		}, {} as Record<string, number>) ?? {}
	).sort();

	function pb(crop: string) {
		const amount = jacob?.stats?.personalBests?.[crop.replace(' ', '')];
		return amount ? +amount : undefined;
	}

	const medals = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];

	function medal(crop: string) {
		const medal = jacob?.stats?.brackets?.[crop.replace(' ', '')];
		return medal ? medals[+medal - 1] : undefined;
	}

	$: console.log(jacob?.stats?.brackets);
</script>

<div class="flex flex-wrap gap-4 items-center justify-center max-w-5xl">
	{#each highest as [crop, amount] (crop)}
		{@const unique = medal(crop)}

		<div
			class="flex-1 basis-48 flex flex-row justify-between bg-gray-100 dark:bg-zinc-800 rounded-md p-2 items-center"
		>
			<div class="flex flex-row gap-2 items-center">
				<img src={PROPER_CROP_TO_IMG[crop]} alt="Crop" class="w-12 h-12 pixelated p-1" />

				<div class="flex flex-col gap-1">
					<div class="">
						<p class="text-lg leading-none">
							{pb(crop)?.toLocaleString() ?? 'Not Set!'}
						</p>
					</div>

					<p class="text-lg leading-none participation-count">
						x{amount.toLocaleString()}
					</p>
				</div>
			</div>

			{#if unique}
				<img
					src="/images/medals/{unique}.webp"
					alt="{unique} Medal"
					class="w-10 h-10 p-1 pixelated highest-bracket"
				/>
			{/if}
		</div>
	{/each}
	<Popover triggeredBy=".participation-count" placement="bottom">
		<p>The amount of participations for this crop!</p>
	</Popover>
	<Popover triggeredBy=".highest-bracket" placement="bottom">
		<p>The highest placement earned for this crop!</p>
	</Popover>
</div>
