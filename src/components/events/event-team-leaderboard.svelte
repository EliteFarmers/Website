<script lang="ts">
	import EventTeam from '$comp/events/event-team.svelte';
	import type { components } from '$lib/api/api';
	import * as Accordion from '$ui/accordion';

	export let highlightUuid: string | undefined = undefined;
	export let highlightTeam: string | undefined = undefined;
	export let running = false;
	export let event: components['schemas']['EventDetailsDto'];
	export let teams: components['schemas']['EventTeamWithMembersDto'][];
</script>

<Accordion.Root class="w-full" value={highlightTeam}>
	{#each teams as team, i}
		<EventTeam {team} rank={i + 1} {running} {event} {highlightUuid} />
	{/each}
</Accordion.Root>
