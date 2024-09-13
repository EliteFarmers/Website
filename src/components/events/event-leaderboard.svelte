<script lang="ts">
	import EventMember from '$comp/events/event-member.svelte';
	import type { components } from '$lib/api/api';
	import * as Accordion from '$ui/accordion';

	export let highlightUuid: string | undefined = undefined;
	export let running = false;
	export let event: components['schemas']['EventDetailsDto'];
	export let members: components['schemas']['EventMemberDetailsDto'][];
</script>

<Accordion.Root class="w-full" value={highlightUuid}>
	{#each members as member, i}
		{@const key = member.playerUuid ?? i.toString()}
		<Accordion.Item
			value={key}
			id={key}
			class="px-1 w-full {highlightUuid === member.playerUuid
				? 'border-2 border-blue-400 rounded-md'
				: 'border-none'}"
		>
			<EventMember {member} rank={i + 1} {running} {event} />
		</Accordion.Item>
	{/each}
</Accordion.Root>
