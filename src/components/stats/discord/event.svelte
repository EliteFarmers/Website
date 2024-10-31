<script lang="ts">
	import type { components } from '$lib/api/api';
	import GuildIcon from '$comp/stats/discord/guild-icon.svelte';
	import EventType from '$comp/events/event-type.svelte';

	export let event: components['schemas']['EventDetailsDto'];
	export let guild: components['schemas']['GuildDetailsDto'] | undefined;

	$: start = new Date(+(event.startTime ?? 0) * 1000);
	$: end = new Date(+(event.endTime ?? 0) * 1000);
</script>

<a
	href="/event/{event?.id}"
	class="relative flex flex-row justify-start items-centers align-middle flex-1 gap-8 p-8 py-8 bg-cover bg-no-repeat bg-center rounded-lg w-full bg-primary-foreground"
	style={guild?.banner?.url ? `background-image: url(${guild.banner.url}); color: white;` : ''}
>
	{#if guild?.banner}
		<div
			class="absolute top-0 left-0 right-0 bottom-0 rounded-lg bg-gradient-to-r from-zinc-900/70 via-transparent to-zinc-900/70"
		/>
	{/if}
	<GuildIcon {guild} size={16} class="z-10" />
	<div class="flex flex-col md:flex-row justify-between w-full z-10 gap-1">
		<div class="flex flex-col gap-1 items-start">
			<h2 class="text-md xs:text-lg sm:text-2xl md:text-2xl font-semibold">{event.name}</h2>
			<EventType type={event.type ?? 1} />
		</div>
		<div class="flex flex-row gap-2 font-semibold items-center z-10 sm:text-sm md:text-lg">
			<span>{start.toLocaleDateString()}</span>
			<span> - </span>
			<span>{end.toLocaleDateString()}</span>
		</div>
	</div>
</a>
