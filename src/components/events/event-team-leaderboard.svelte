<script lang="ts">
	import EventTeam from '$comp/events/event-team.svelte';
	import type { EventDetailsDto, EventTeamWithMembersDto } from '$lib/api';
	import * as Accordion from '$ui/accordion';

	interface Props {
		highlightUuid?: string | undefined;
		highlightTeam?: string | undefined;
		started?: boolean;
		running?: boolean;
		event: EventDetailsDto;
		teams: EventTeamWithMembersDto[];
	}

	let {
		highlightUuid = undefined,
		highlightTeam = undefined,
		started = false,
		running = false,
		event,
		teams,
	}: Props = $props();
</script>

<Accordion.Root type="multiple" class="w-full" value={highlightTeam ? [highlightTeam] : []}>
	{#each teams as team, i (team.id ?? i)}
		<EventTeam {team} rank={i + 1} {started} {running} {event} {highlightUuid} />
	{/each}
</Accordion.Root>
