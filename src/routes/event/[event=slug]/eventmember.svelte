<script lang="ts">
	import type { components } from '$lib/api/api';
	import { Button } from '$ui/button';
	import * as Accordion from '$ui/accordion';
	import * as Popover from '$ui/popover';

	export let member: components['schemas']['EventMemberDetailsDto'];
	export let rank: number;
	export let running: boolean;
</script>

<Accordion.Trigger class="w-full">
	<div class="flex flex-row justify-between align-middle w-full">
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
			{#if running}
				<Popover.Mobile>
					<div slot="trigger">
						<div class="flex flex-col items-center justify-center">
							{#if member.status === 0}
								<div class="w-2 h-2 rounded-full bg-gray-300 dark:bg-zinc-700" />
							{/if}
							{#if member.status === 1}
								<div class="w-2 h-2 rounded-full bg-green-500 dark:bg-green-300" />
							{/if}
						</div>
					</div>
					<div>
						{#if member.status === 0}
							<p class="text-lg font-semibold">Inactive Farmer</p>
							<p class="max-w-xs">
								{member.playerName} has not increased their score since last checked.
							</p>
						{/if}
						{#if member.status === 1}
							<p class="text-lg font-semibold">Actively Farming!</p>
							<p class="max-w-xs">{member.playerName} has increased their score since last checked!</p>
						{/if}
					</div>
				</Popover.Mobile>
			{/if}
		</div>
		<p class="text-lg block pr-2">
			{#if member.amountGained && +member.amountGained > 0}
				{(+(member.amountGained ?? 0)).toLocaleString()}
			{:else}
				<span class="text-red-800 dark:text-red-500">Hasn't Farmed Yet</span>
			{/if}
		</p>
	</div>
</Accordion.Trigger>
<Accordion.Content>
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
		<Button href="/@{member.playerUuid}/{member.profileId}">View Stats</Button>
	</div>
</Accordion.Content>
