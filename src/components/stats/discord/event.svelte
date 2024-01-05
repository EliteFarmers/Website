<script lang="ts">
	import type { components } from '$lib/api/api';
	import Guildicon from '$comp/stats/discord/guildicon.svelte';

	export let event: components['schemas']['EventDetailsDto'];
	export let guild: components['schemas']['GuildDetailsDto'] | undefined;
</script>

<a
	href={`/event/${event?.id}`}
	class="relative flex flex-row justify-between flex-1 p-8 py-8 bg-cover bg-no-repeat bg-center rounded-lg w-full text-white bg-zinc-800"
	style={guild?.banner
		? `background-image: url('https://cdn.discordapp.com/splashes/${guild?.id}/${guild?.banner}.png?size=1280')`
		: ''}
>
	{#if guild?.banner}
		<div
			class="absolute top-0 left-0 right-0 bottom-0 rounded-lg bg-gradient-to-r from-zinc-900/70 via-transparent to-zinc-900/70"
		/>
	{/if}
	<div class="flex flex-row gap-4 z-10 items-center">
		<Guildicon {guild} size={16} />
		<h2 class="text-3xl font-semibold">{event.name}</h2>
	</div>
	<div class="flex flex-row gap-2 font-semibold items-center z-10 text-lg">
		<span>{new Date(+(event.startTime ?? 0) * 1000).toLocaleDateString()}</span>
		<span> - </span>
		<span>{new Date(+(event.endTime ?? 0) * 1000).toLocaleDateString()}</span>
	</div>
</a>
