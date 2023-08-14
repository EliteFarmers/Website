<script lang="ts">
	import type { components } from '$lib/api/api';
	import { getReadableSkyblockDate } from '$lib/format';
	import { AccordionItem, Button } from 'flowbite-svelte';

	export let rank = 0;
	export let entry: components['schemas']['ContestParticipationWithTimestampDto'];
</script>

<AccordionItem
	defaultClass="flex flex-row items-center justify-center gap-4 w-full"
	textFlushDefault="text-black dark:text-white py-1"
	paddingFlush="py-1"
>
	<div slot="header" class="flex gap-0 md:gap-2 justify-between w-full">
		<div
			class="flex gap-1 sm:gap-2 justify-start align-middle items-center flex-grow mx-2 overflow-hidden whitespace-nowrap text-ellipsis"
		>
			<div class="text-green-800 dark:text-green-300">
				<h3>
					<span class="text-sm xs:text-md sm:text-2xl">#</span><span class="text-lg xs:text-xl sm:text-3xl"
						>{(rank ?? 0) + 1}</span
					>
				</h3>
			</div>
			<!-- <Face {ign} base={face?.base} overlay={face?.overlay} /> -->
			<div class="flex flex-col flex-grow overflow-hidden whitespace-nowrap text-ellipsis">
				<p class="inline-block text-sm xs:text-xl sm:text-2xl font-semibold text-start">{entry.playerName}</p>
			</div>
		</div>
		<div class="flex gap-2 p-1 justify-end align-middle items-center mr-2 md:mx-2">
			<div class="text-sm xs:text-xl sm:text-2xl font-mono">
				{entry.collected?.toLocaleString()}
			</div>
		</div>
	</div>
	<div class="flex flex-row justify-between items-center px-2">
		<div class="flex flex-col text-lg">
			<p class="text-lg p-1">
				{#if entry.position !== -1}
					<span class="text-sm xs:text-lg sm:text-xl text-green-800 dark:text-green-300">#</span><span
						class="text-lg xs:text-xl sm:text-2xl text-green-800 dark:text-green-300"
						>{(entry.position ?? 0) + 1}</span
					>
				{:else}
					<span class="text-sm xs:text-md sm:text-2xl text-green-800 dark:text-green-300">???</span>
				{/if}
				<span class="text-sm xs:text-md sm:text-2xl"> / {entry.participants?.toLocaleString() ?? '???'}</span>
			</p>
			<p class="text-sm font-light font-mono text-center">
				<span class="bg-gray-200 dark:bg-zinc-900 p-1 rounded-md whitespace-nowrap">
					{new Date((entry.timestamp ?? 0) * 1000).toLocaleString(undefined, {
						timeStyle: 'short',
						dateStyle: 'short',
						timeZone: 'UTC',
					})}
				</span>
				<span class="bg-gray-200 dark:bg-zinc-900 p-1 rounded-md whitespace-nowrap">
					{getReadableSkyblockDate(entry.timestamp ?? 0)}
				</span>
			</p>
		</div>
		<div class="flex flex-col sm:flex-row gap-1">
			<Button href="/contest/{entry.timestamp}" color="alternative" size="sm">Contest</Button>
			<Button href="/@{entry.playerUuid}/{entry.profileUuid}" color="alternative" size="sm">Stats</Button>
		</div>
	</div>
</AccordionItem>
