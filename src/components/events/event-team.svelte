<script lang="ts">
	import type { EventDetailsDto, EventTeamWithMembersDto } from '$lib/api';
	import * as Accordion from '$ui/accordion';
	import Users from '@lucide/svelte/icons/users';
	import EventMember from './event-member.svelte';

	interface Props {
		event: EventDetailsDto;
		team: EventTeamWithMembersDto;
		rank: number;
		started: boolean;
		running: boolean;
		highlightUuid?: undefined | string;
	}

	let { event, team, rank, started, running, highlightUuid = undefined }: Props = $props();

	let key = $derived((team.id ?? '').toString() || rank.toString());
	let members = $derived((team.members ?? []).sort((a, b) => +(b.score ?? 0) - +(a?.score ?? 0)));
	let full = $derived(event.maxTeamMembers && event.maxTeamMembers > 0 && members.length >= event.maxTeamMembers);
</script>

<Accordion.Item value={key} id={key} class="outline-border my-2 rounded-lg outline-2">
	<Accordion.Trigger class="w-full pr-4">
		<div class="flex w-full flex-col gap-2 px-4">
			<div class="flex flex-row items-center justify-between">
				<div class="flex flex-wrap items-center gap-4 md:flex-row">
					{#if started}
						<div class="text-progress">
							<p>
								<span class="text-sm sm:text-xl">#</span><span class="text-lg sm:text-2xl">{rank}</span>
							</p>
						</div>
					{/if}
					<p class="order-3 basis-full text-start text-lg sm:text-xl md:order-2 md:basis-auto">{team.name}</p>
					<div class="order-2 flex flex-row items-end gap-2 font-semibold md:order-3">
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
				<p class="block pr-2 text-lg font-semibold">
					{#if team.score && +team.score > 0}
						{(+(team.score ?? 0)).toLocaleString()}
					{:else if started}
						<span class="text-destructive">No Progress Yet!</span>
					{/if}
				</p>
			</div>
		</div>
	</Accordion.Trigger>
	<Accordion.Content>
		<Accordion.Root type="multiple" class="text-primary w-full">
			{#each members as member, i (member.playerUuid ?? i)}
				<Accordion.Item
					value={team.id + i.toString()}
					class="px-4 {highlightUuid === member.playerUuid
						? 'border-link rounded-md border-2'
						: 'border-none'}"
				>
					<EventMember {member} {running} {event} owner={team.ownerUuid === member.playerUuid} />
				</Accordion.Item>
			{/each}
		</Accordion.Root>
	</Accordion.Content>
</Accordion.Item>
