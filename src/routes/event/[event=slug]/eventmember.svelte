<script lang="ts">
	import type { components } from '$lib/api/api';
	import { AccordionItem, Button, Popover } from 'flowbite-svelte';

	export let member: components['schemas']['EventMemberDetailsDto'];
	export let rank: number;
</script>

<AccordionItem
	defaultClass="flex flex-row items-center justify-center gap-4 w-full"
	textFlushDefault="text-black dark:text-white"
>
	<div slot="header" class="flex flex-row justify-between align-middle w-full">
		<div class="flex flex-row gap-2 align-middle">
			<div class="text-green-800 dark:text-green-300">
				<h1>
					<span class="text-sm sm:text-xl">#</span><span class="text-lg sm:text-2xl">{rank}</span>
				</h1>
			</div>
			<img
				src="https://mc-heads.net/avatar/{member.playerUuid}"
				alt="Player Head"
				class="w-8 h-8 pixelated aspect-square rounded-sm"
			/>
			<p class="text-lg">{member.playerName}</p>
			<!-- Active/inactive dot -->
			<div class="flex flex-col items-center justify-center status-{rank}">
				{#if member.status === 0}
					<div class="w-2 h-2 rounded-full bg-gray-300 dark:bg-zinc-700" />
					<Popover triggeredBy=".status-{rank}">
						<p slot="title" class="text-black dark:text-white">Inactive Farmer</p>
						<p class="max-w-xs">{member.playerName} has not increased their score since last checked.</p>
					</Popover>
				{/if}
				{#if member.status === 1}
					<div class="w-2 h-2 rounded-full bg-green-500 dark:bg-green-300" />
					<Popover triggeredBy=".status-{rank}">
						<p slot="title" class="text-black dark:text-white">Actively Farming!</p>
						<p class="max-w-xs">{member.playerName} has increased their score since last checked!</p>
					</Popover>
				{/if}
			</div>
		</div>
		<p class="text-lg block">
			{#if member.amountGained && +member.amountGained > 0}
				{(+(member.amountGained ?? 0)).toLocaleString()}
			{:else}
				<span class="text-red-800 dark:text-red-500">Hasn't Farmed Yet</span>
			{/if}
		</p>
	</div>
	<div class="flex flex-row justify-between items-center">
		<div class="text-lg">
			<p class="text-gray-500">Last Updated</p>
			<p>
				{member.lastUpdated
					? new Date(+(member.lastUpdated ?? 0) * 1000).toLocaleDateString() +
					  ' ' +
					  new Date(+(member.lastUpdated ?? 0) * 1000).toLocaleTimeString()
					: 'Never Updated!'}
			</p>
		</div>
		<Button href="/@{member.playerUuid}">View Stats</Button>
	</div>
</AccordionItem>
