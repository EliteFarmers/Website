<script lang="ts">
	import type { LeaderboardEntry } from '$db/leaderboards';

	export let entry: LeaderboardEntry;
	export let highlight = false;
	export let rank: number;
	export let formatting: 'number' | 'decimal' = 'number';

	const options: Intl.NumberFormatOptions = {
		maximumFractionDigits: 1,
	};

	if (formatting === 'decimal') {
		options.minimumFractionDigits = 1;
	}
	
	const { ign, amount, profile, uuid, cute_name } = entry;
</script>

<a
	data-sveltekit-preload-data="tap"
	href="/stats/{uuid}/{profile}"
	class="flex gap-2 justify-between hover:shadow-lg hover:bg-gray-100 hover:dark:bg-zinc-600 align-middle py-1 sm:p-1 bg-gray-200 dark:bg-zinc-700 border-2 {highlight
		? 'border-yellow-400'
		: 'border-transparent'} rounded-md"
>
	<div class="flex gap-4 justify-start align-middle items-center mx-2">
		<div class="text-green-800 dark:text-green-300">
			<h1>
				<span class="text-sm xs:text-md sm:text-2xl">#</span><span class="text-lg xs:text-xl sm:text-3xl"
					>{rank}</span
				>
			</h1>
		</div>
		<div class="flex flex-col">
			<h1 class="inline text-sm xs:text-xl sm:text-2xl font-semibold text-start">{ign}</h1>
			<h4 class="text-xs xs:text-sm sm:text-md text-start overflow-hidden text-ellipsis whitespace-nowrap">
				{cute_name}
			</h4>
		</div>
	</div>
	<div class="flex gap-2 p-1 justify-end align-middle items-center mx-2">
		<div class="text-sm xs:text-xl sm:text-2xl">
			{amount?.toLocaleString(undefined, options)}
		</div>
	</div>
</a>
