<script lang="ts">
	import type { components } from '$lib/api/api';
	import { Button } from '$ui/button';
	import * as Accordion from '$ui/accordion';
	import * as Popover from '$ui/popover';
	import { EventType } from '$lib/utils';
	import Crown from 'lucide-svelte/icons/crown';

	export let owner = false;
	export let event: components['schemas']['EventDetailsDto'];
	export let member: components['schemas']['EventMemberDto'];
	export let rank: number | undefined = undefined;
	export let running: boolean;

	const medalWeight = (medal: string) => {
		const data = event.data as { medalWeights?: Record<string, number> } | undefined;
		return data?.medalWeights?.[medal] ?? 0;
	};

	const earnedMedals = () => {
		const data = member.data as { earnedMedals?: Record<string, number> } | undefined;
		return [
			['Diamond', data?.earnedMedals?.['Diamond']],
			['Platinum', data?.earnedMedals?.['Platinum']],
			['Gold', data?.earnedMedals?.['Gold']],
			['Silver', data?.earnedMedals?.['Silver']],
			['Bronze', data?.earnedMedals?.['Bronze']],
		].filter(([, count]) => count) as [string, number][];
	};
</script>

<Accordion.Trigger class="w-full">
	<div class="flex flex-row justify-between align-middle w-full">
		<div class="flex flex-row gap-2 align-middle items-center">
			{#if rank}
				<div class="text-green-800 dark:text-green-300">
					<p>
						<span class="text-sm sm:text-xl">#</span><span class="text-lg sm:text-2xl">{rank}</span>
					</p>
				</div>
			{/if}
			<img
				src="https://mc-heads.net/avatar/{member.playerUuid}"
				alt="Player Head"
				class="w-8 h-8 pixelated aspect-square rounded-sm"
			/>
			<p class="text-lg">{member.playerName}</p>
			{#if owner}
				<Popover.Mobile>
					<div slot="trigger" class="flex flex-row items-end">
						<Crown size="sm" class="w-4 mt-1.5 text-yellow-400" />
					</div>
					<p class="text-lg font-semibold">Team Owner</p>
				</Popover.Mobile>
			{/if}
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
			{#if member.score && +member.score > 0}
				{(+(member.score ?? 0)).toLocaleString()}
			{:else if running}
				<span class="text-red-800 dark:text-red-500">Zero!</span>
			{/if}
		</p>
	</div>
</Accordion.Trigger>
<Accordion.Content>
	<div class="flex flex-col md:flex-row gap-4 items-center w-full">
		{#if event.type === +EventType.Medals}
			<div class="flex flex-col w-full gap-1">
				{#each earnedMedals() as [medal, count]}
					<div class="flex flex-row justify-center items-center gap-2">
						<p>{medal}&nbsp;<span class="font-semibold">x{count}</span></p>
						<div class="border-b-2 border-dotted border-primary/70 flex-grow h-2 mb-1 w-full" />
						<p class="font-semibold">{count * medalWeight(medal)}</p>
					</div>
				{/each}
			</div>
		{/if}
		<div class="flex flex-row justify-between items-center w-full">
			<div>
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
	</div>
</Accordion.Content>
