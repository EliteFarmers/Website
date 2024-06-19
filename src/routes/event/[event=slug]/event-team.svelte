<script lang="ts">
	import type { components } from '$lib/api/api';
	import EventMember from './event-member.svelte';
	import * as Accordion from '$ui/accordion';
	import Users from 'lucide-svelte/icons/users';

	export let event: components['schemas']['EventDetailsDto'];
	export let team: components['schemas']['EventTeamWithMembersDto'];
	export let rank: number;
	export let running: boolean;

	$: members = team.members ?? [];
	$: full = event.maxTeamMembers && event.maxTeamMembers > 0 && members.length >= event.maxTeamMembers;
</script>

<div class="flex flex-col gap-2 outline-2 rounded-lg outline p-4">
	<div class="flex flex-row justify-between items-center">
		<div class="flex flex-row gap-4 items-center">
			{#if running}
				<div class="text-green-800 dark:text-green-300">
					<p>
						<span class="text-sm sm:text-xl">#</span><span class="text-lg sm:text-2xl">{rank}</span>
					</p>
				</div>
			{/if}
			<p class="text-lg sm:text-xl">{team.name}</p>
			<div class="flex flex-row gap-2 font-semibold items-end">
				<p class="text-xl leading-none">
					{#if event.maxTeamMembers === -1 && !full}
						{members.length?.toLocaleString()}
					{:else}
						{members.length?.toLocaleString()}/{event.maxTeamMembers}
					{/if}
				</p>
				<Users size={18} />
			</div>
		</div>
		<p class="text-lg block pr-2 font-semibold">
			{#if team.score && +team.score > 0}
				{(+(team.score ?? 0)).toLocaleString()}
			{:else if running}
				<span class="text-red-800 dark:text-red-500">No Progress Yet!</span>
			{/if}
		</p>
	</div>

	<Accordion.Root class="w-full text-black dark:text-white">
		{#each members as member, i}
			<Accordion.Item value={i.toString()} class="border-none">
				<EventMember {member} {running} {event} />
			</Accordion.Item>
		{/each}
	</Accordion.Root>
</div>
