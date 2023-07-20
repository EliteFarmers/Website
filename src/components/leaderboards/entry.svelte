<script lang="ts">
	import type { LeaderboardEntry } from '$lib/api/elite';

	export let entry: LeaderboardEntry;
	export let highlight = false;
	export let rank: number;
	export let formatting: 'number' | 'decimal' = 'number';

	const options: Intl.NumberFormatOptions = {
		maximumFractionDigits: 1,
	};

	$: {
		if (formatting === 'decimal') {
			options.minimumFractionDigits = 1;
		}
	}
	$: ({ ign, amount, profile } = entry);
</script>

<a
	href="/@{encodeURIComponent(ign ?? '')}/{encodeURIComponent(profile ?? '')}"
	class="inline-block w-full hover:shadow-lg hover:bg-gray-200 hover:dark:bg-zinc-700 align-middle py-1 sm:p-1 bg-gray-100 dark:bg-zinc-800 border-2 {highlight
		? 'border-yellow-400'
		: 'border-transparent'} rounded-md"
>
	<div class="flex gap-0 md:gap-2 justify-between">
		<div
			class="flex gap-1 sm:gap-2 justify-start align-middle items-center flex-grow mx-2 overflow-hidden whitespace-nowrap text-ellipsis"
		>
			<div class="text-green-800 dark:text-green-300">
				<h1>
					<span class="text-sm xs:text-md sm:text-2xl">#</span><span class="text-lg xs:text-xl sm:text-3xl"
						>{rank}</span
					>
				</h1>
			</div>
			<!-- <Face {ign} base={face?.base} overlay={face?.overlay} /> -->
			<div class="flex flex-col flex-grow overflow-hidden whitespace-nowrap text-ellipsis">
				<h1 class="inline-block text-sm xs:text-xl sm:text-2xl font-semibold text-start">{ign}</h1>
				<h4
					class="inline text-xs xs:text-sm sm:text-md text-start overflow-hidden whitespace-nowrap text-ellipsis"
				>
					{profile}
				</h4>
			</div>
		</div>
		<div class="flex gap-2 p-1 justify-end align-middle items-center mr-2 md:mx-2">
			<div class="text-sm xs:text-xl sm:text-2xl">
				{amount?.toLocaleString(undefined, options)}
			</div>
		</div>
	</div>
</a>
