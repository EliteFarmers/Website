<script lang="ts">
	import type { components } from '$lib/api/api';
	import { Button } from '$ui/button';
	import * as Accordion from '$ui/accordion';
	import { EventType } from '$lib/utils';
	import Crown from 'lucide-svelte/icons/crown';
	import TooltipSimple from '$ui/tooltip/tooltip-simple.svelte';

	interface Props {
		owner?: boolean;
		event: components['schemas']['EventDetailsDto'];
		member: components['schemas']['EventMemberDto'] | components['schemas']['EventMemberDetailsDto'];
		rank?: number | undefined;
		running: boolean;
	}

	let { owner = false, event, member, rank = undefined, running }: Props = $props();

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

	const pestWeights = () => {
		const data = member.data as { countedPests?: Record<string, number> } | undefined;
		const eventData = event.data as { pestWeights?: Record<string, number> } | undefined;
		return Object.entries(data?.countedPests ?? {})
			.map(([name, kills]) => ({
				name,
				weight: (eventData?.pestWeights?.[name] ?? 0) * kills,
			}))
			.sort((a, b) => b.weight - a.weight);
	};

	const collectionWeights = () => {
		const data = member.data as { countedCollections?: Record<string, number> } | undefined;
		const eventData = event.data as
			| { collectionWeights?: Record<string, { name: string; weight: number }> }
			| undefined;
		return Object.entries(data?.countedCollections ?? {})
			.map(([name, value]) => ({
				name: eventData?.collectionWeights?.[name]?.name ?? name,
				weight: (eventData?.collectionWeights?.[name]?.weight ?? 0) * value,
			}))
			.sort((a, b) => b.weight - a.weight);
	};
</script>

<Accordion.Trigger class="w-full">
	<div id={member.playerUuid} class="flex w-full scroll-mt-64 flex-row justify-between align-middle">
		<div class="flex flex-row items-center gap-2 align-middle">
			{#if rank}
				<div>
					<p class="text-progress">
						<span class="text-sm sm:text-xl">#</span><span class="text-lg sm:text-2xl">{rank}</span>
					</p>
				</div>
			{/if}
			<img
				src="https://mc-heads.net/avatar/{member.playerUuid}"
				alt="Player Head"
				class="pixelated aspect-square size-8 rounded-sm"
			/>
			<p class="text-lg">{member.playerName}</p>
			{#if owner}
				<TooltipSimple>
					{#snippet trigger()}
						<div class="flex flex-row items-end">
							<Crown size={16} class="w-4 text-completed" />
						</div>
					{/snippet}
					<p>Team Owner</p>
				</TooltipSimple>
			{/if}
			{#if running}
				<TooltipSimple>
					{#snippet trigger()}
						<div class="flex flex-col items-center justify-center">
							{#if member.status === 0}
								<div class="h-2 w-2 rounded-full bg-muted"></div>
							{/if}
							{#if member.status === 1}
								<div class="text-bg-progress h-2 w-2 rounded-full"></div>
							{/if}
						</div>
					{/snippet}
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
				</TooltipSimple>
			{/if}
		</div>
		<p class="block pr-2 text-lg">
			{#if member.score && +member.score > 0}
				{(+(member.score ?? 0)).toLocaleString()}
			{:else}
				<span class="text-destructive">Zero!</span>
			{/if}
		</p>
	</div>
</Accordion.Trigger>
<Accordion.Content>
	<div class="flex w-full flex-col items-start gap-4 md:flex-row">
		{#if event.type === +EventType.Medals}
			<div class="flex w-full flex-col gap-1">
				{#each earnedMedals() as [medal, count]}
					<div
						class="flex flex-row items-center justify-between gap-2 p-1 even:rounded-sm even:bg-background"
					>
						<div class="flex flex-row items-center gap-2">
							<img
								src="/images/medals/{medal.toLowerCase()}.webp"
								alt={medal}
								class="pixelated aspect-square"
							/>
							<p class="whitespace-nowrap font-semibold">{medal} <span>x{count}</span></p>
						</div>
						<p class="font-semibold">{(count * medalWeight(medal)).toLocaleString()}</p>
					</div>
				{/each}
			</div>
		{:else if event.type === +EventType.Pests}
			<div class="flex w-full flex-col gap-1">
				{#each pestWeights() as { name, weight }}
					<div
						class="flex flex-row items-center justify-between gap-2 p-1 even:rounded-sm even:bg-background"
					>
						<div class="flex flex-row items-center gap-2">
							<img
								src="/images/pests/{name.toLowerCase()}.png"
								alt={name}
								class="pixelated aspect-square"
							/>
							<p class="whitespace-nowrap font-semibold">{name}</p>
						</div>
						<p class="font-semibold">{weight.toLocaleString()}</p>
					</div>
				{/each}
			</div>
		{:else if event.type === +EventType.Collections}
			<div class="flex w-full flex-col gap-1">
				{#each collectionWeights() as { name, weight }}
					<div
						class="flex flex-row items-center justify-between gap-2 p-1 even:rounded-sm even:bg-background"
					>
						<div class="flex flex-row items-center gap-2">
							<p class="whitespace-nowrap font-semibold">{name}</p>
						</div>
						<p class="font-semibold">{weight.toLocaleString()}</p>
					</div>
				{/each}
			</div>
		{/if}
		<div class="flex w-full flex-row items-center justify-between">
			<div>
				<p class="text-muted-foreground">Last Updated</p>
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
