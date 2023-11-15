<script lang="ts">
	import type { components } from '$lib/api/api';

	export let entry: components['schemas']['StrippedContestParticipationDto'];
</script>

<a
	href="/@{entry.playerName}"
	data-sveltekit-preload-data="tap"
	class="bg-gray-200 hover:bg-gray-100 dark:bg-zinc-800 hover:dark:bg-zinc-900 rounded-md"
>
	<div class="flex gap-0 md:gap-2 justify-between">
		<div
			class="flex gap-1 sm:gap-2 justify-start align-middle items-center flex-grow mx-2 overflow-hidden whitespace-nowrap text-ellipsis"
		>
			<div class="text-green-800 dark:text-green-300">
				<h1>
					{#if entry.position !== -1}
						<span class="text-sm xs:text-md sm:text-2xl">#</span><span
							class="text-lg xs:text-xl sm:text-3xl">{(entry.position ?? 0) + 1}</span
						>
					{:else}
						<span class="text-sm xs:text-md sm:text-2xl">???</span>
					{/if}
				</h1>
			</div>
			<!-- <Face {ign} base={face?.base} overlay={face?.overlay} /> -->
			<div class="flex flex-col flex-grow overflow-hidden whitespace-nowrap text-ellipsis">
				<h1 class="inline-block text-sm xs:text-xl sm:text-2xl font-semibold text-start">{entry.playerName}</h1>
			</div>
		</div>
		<div class="flex gap-2 p-1 justify-end align-middle items-center mr-2 md:mx-2">
			<div class="text-sm xs:text-xl sm:text-2xl font-mono">
				{entry.collected?.toLocaleString()}
			</div>
			{#if entry.medal && entry.medal !== 'none'}
				<img
					class="inline-block w-6 h-6 pixelated"
					src="/images/medals/{entry.medal}.webp"
					alt="Earned Medal"
				/>
			{/if}
		</div>
	</div>
</a>
