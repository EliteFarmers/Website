<script lang="ts">
	import type { LeaderboardEntry } from '$db/database';

	export let entry: LeaderboardEntry;
	export let jump: string | undefined;

	const highlight = entry.ign === jump;

	const { ign, farming, uuid } = entry;
</script>

<div
	class="flex gap-2 justify-between align-middle py-1 sm:p-1 bg-gray-200 dark:bg-zinc-700 border-2 {highlight
		? 'border-yellow-400'
		: 'border-transparent'} rounded-md"
>
	<div class="flex gap-2 justify-start align-middle">
		<div class="text-green-800 dark:text-green-300 text-end w-8 sm:w-10">
			<h1 class="text-md xs:text-lg sm:text-2xl">#{entry.rank}</h1>
		</div>
		<div>
			<h1 class="text-sm xs:text-xl sm:text-2xl font-semibold text-start">{ign}</h1>
		</div>
	</div>
	<div class="flex gap-2 p-1 justify-end align-middle">
		<div class="text-sm sm:text-xl">
			{farming.weight.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
		</div>
		<div>
			<a
				href="/stats/{uuid}/{farming.profile}"
				class="text-blue-600 bg-gray-300 dark:bg-zinc-800 p-1 sm:p-2 ml-1 rounded-md text-md sm:text-lg"
			>
				Stats
			</a>
		</div>
	</div>
</div>
