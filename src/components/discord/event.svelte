<script lang="ts">
	import type { components } from '$lib/api/api';
	import GuildIcon from '$comp/discord/guild-icon.svelte';
	import EventType from '$comp/events/event-type.svelte';

	interface Props {
		event: components['schemas']['EventDetailsDto'];
		guild: components['schemas']['GuildDetailsDto'] | undefined;
	}

	let { event, guild }: Props = $props();

	let start = $derived(new Date(+(event.startTime ?? 0) * 1000));
	let end = $derived(new Date(+(event.endTime ?? 0) * 1000));
</script>

<a
	href="/event/{event?.id}"
	class="items-centers relative flex w-full flex-1 flex-row justify-start gap-8 rounded-lg bg-primary-foreground bg-cover bg-center bg-no-repeat p-8 py-8 align-middle"
	style={guild?.banner?.url ? `background-image: url(${guild.banner.url}); color: white;` : ''}
>
	{#if guild?.banner}
		<div
			class="absolute bottom-0 left-0 right-0 top-0 rounded-lg bg-gradient-to-r from-zinc-900/70 via-transparent to-zinc-900/70"
		></div>
	{/if}
	<GuildIcon {guild} size={16} class="z-10" />
	<div class="z-10 flex w-full flex-col justify-between gap-1 md:flex-row">
		<div class="flex flex-col items-start gap-1">
			<h2 class="text-md xs:text-lg font-semibold sm:text-2xl md:text-2xl">{event.name}</h2>
			<EventType type={event.type ?? 1} />
		</div>
		<div class="z-10 flex flex-row items-center gap-2 font-semibold sm:text-sm md:text-lg">
			<span>{start.toLocaleDateString()}</span>
			<span> - </span>
			<span>{end.toLocaleDateString()}</span>
		</div>
	</div>
</a>
