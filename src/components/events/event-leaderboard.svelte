<script lang="ts">
	import EventMember from '$comp/events/event-member.svelte';
	import type { components } from '$lib/api/api';
	import * as Accordion from '$ui/accordion';

	interface Props {
		highlightUuid?: string | undefined;
		running?: boolean;
		event: components['schemas']['EventDetailsDto'];
		members: components['schemas']['EventMemberDetailsDto'][];
	}

	let {
		highlightUuid = undefined,
		running = false,
		event,
		members
	}: Props = $props();
</script>

<Accordion.Root type="single" class="w-full" value={highlightUuid}>
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
