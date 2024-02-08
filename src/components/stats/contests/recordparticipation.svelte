<script lang="ts">
	import type { components } from '$lib/api/api';
	import { getReadableSkyblockMonthDay } from '$lib/format';
	import { Button } from '$ui/button';
	import * as Accordion from '$ui/accordion';
	import * as Popover from '$ui/popover';
	import { AlertCircle } from 'lucide-svelte/icons';

	export let rank = 0;
	export let entry: components['schemas']['ContestParticipationWithTimestampDto'];
</script>

<Accordion.Item value={entry.timestamp + '' + entry.collected} class="mx-4">
	<Accordion.Trigger class="flex gap-0 md:gap-2 justify-between w-full py-1">
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
			{#if entry.removed}
				<Popover.Mobile>
					<div slot="trigger">
						<AlertCircle class="text-destructive" />
					</div>
					<div>
						<p class="text-lg font-semibold">This participation no longer exists!</p>
						<p class="max-w-xs break-words whitespace-normal">
							{entry.playerName} may have been banned or deleted their profile.
						</p>
					</div>
				</Popover.Mobile>
			{/if}
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
	</Accordion.Trigger>
	<Accordion.Content>
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
					<span class="text-sm xs:text-md sm:text-2xl">
						/ {entry.participants?.toLocaleString() ?? '???'}</span
					>
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
						{getReadableSkyblockMonthDay(entry.timestamp ?? 0)}
					</span>
				</p>
			</div>
			<div class="flex flex-col sm:flex-row gap-1">
				<Button href="/contest/{entry.timestamp}" color="alternative" size="sm">Contest</Button>
				<Button href="/@{entry.playerUuid}/{entry.profileUuid}" color="alternative" size="sm">Stats</Button>
			</div>
		</div>
	</Accordion.Content>
</Accordion.Item>
