<script lang="ts">
	import EventTeam from '$comp/events/event-team.svelte';
	import type { components } from '$lib/api/api';
	import * as Accordion from '$ui/accordion';

	interface Props {
		highlightUuid?: string | undefined;
		highlightTeam?: string | undefined;
		started?: boolean;
		running?: boolean;
		event: components['schemas']['EventDetailsDto'];
		teams: components['schemas']['EventTeamWithMembersDto'][];
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

<Accordion.Root type="single" class="w-full" value={highlightTeam}>
	{#each teams as team, i}
		<EventTeam {team} rank={i + 1} {started} {running} {event} {highlightUuid} />
	{/each}
</Accordion.Root>
