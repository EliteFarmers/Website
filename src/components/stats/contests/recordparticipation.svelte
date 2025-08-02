<script lang="ts">
	import type { components } from '$lib/api/api';
	import { getReadableSkyblockMonthDay } from '$lib/format';
	import * as Accordion from '$ui/accordion';
	import { Button } from '$ui/button';
	import * as Popover from '$ui/popover';
	import CircleAlert from '@lucide/svelte/icons/circle-alert';

	interface Props {
		rank?: number;
		entry: components['schemas']['ContestParticipationWithTimestampDto'];
	}

	let { rank = 0, entry }: Props = $props();
</script>

<Accordion.Item value={entry.timestamp + '' + entry.collected} class="mx-4">
	<Accordion.Trigger class="flex w-full justify-between gap-0 py-1 md:gap-2">
		<div
			class="mx-2 flex grow items-center justify-start gap-1 overflow-hidden align-middle text-ellipsis whitespace-nowrap sm:gap-2"
		>
			<div class="text-progress">
				<span class="xs:text-md text-sm sm:text-xl">#</span><span class="xs:text-xl text-lg sm:text-2xl"
					>{(rank ?? 0) + 1}</span
				>
			</div>
			{#if entry.removed}
				<Popover.Mobile>
					{#snippet trigger()}
						<div class="mt-2">
							<CircleAlert class="text-destructive" />
						</div>
					{/snippet}
					<div>
						<p class="text-lg font-semibold">This participation no longer exists!</p>
						<p class="max-w-xs break-words whitespace-normal">
							{entry.playerName} may have been banned or deleted their profile.
						</p>
					</div>
				</Popover.Mobile>
			{/if}
			<!-- <Face {ign} base={face?.base} overlay={face?.overlay} /> -->
			<div class="flex grow flex-col overflow-hidden text-ellipsis whitespace-nowrap">
				<p class="xs:text-lg inline-block text-start text-sm font-semibold sm:text-xl">{entry.playerName}</p>
			</div>
		</div>
		<div class="mr-2 flex items-center justify-end gap-2 p-1 align-middle md:mx-2">
			<div class="xs:text-lg font-mono text-sm sm:text-xl">
				{entry.collected?.toLocaleString()}
			</div>
		</div>
	</Accordion.Trigger>
	<Accordion.Content>
		<div class="flex flex-row items-center justify-between px-2">
			<div class="flex flex-col text-lg">
				<p class="p-1 text-lg">
					{#if entry.position !== -1}
						<span class="xs:text-md text-progress text-sm sm:text-xl">#</span><span
							class=" xs:text-xl text-progress text-lg sm:text-2xl">{(entry.position ?? 0) + 1}</span
						>
					{:else}
						<span class="xs:text-md text-progress text-sm sm:text-xl">???</span>
					{/if}
					<span class="xs:text-md text-sm sm:text-xl">
						/ {entry.participants?.toLocaleString() ?? '???'}</span
					>
				</p>
				<p class="text-center font-mono text-sm font-light">
					<span class="bg-card rounded-md p-1 whitespace-nowrap">
						{new Date((entry.timestamp ?? 0) * 1000).toLocaleString(undefined, {
							timeStyle: 'short',
							dateStyle: 'short',
							timeZone: 'UTC',
						})}
					</span>
					<span class="bg-card rounded-md p-1 whitespace-nowrap">
						{getReadableSkyblockMonthDay(entry.timestamp ?? 0)}
					</span>
				</p>
			</div>
			<div class="flex flex-col gap-1 sm:flex-row">
				<Button href="/contest/{entry.timestamp}" color="alternative" size="sm">Contest</Button>
				<Button href="/@{entry.playerUuid}/{entry.profileUuid}" color="alternative" size="sm">Stats</Button>
			</div>
		</div>
	</Accordion.Content>
</Accordion.Item>
