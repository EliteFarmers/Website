<script lang="ts">
	import type { PageData } from './$types';
	import Serverbar from '$comp/stats/discord/serverbar.svelte';
	import Event from '$comp/stats/discord/event.svelte';
	import Head from '$comp/head.svelte';
	import { PUBLIC_COMMUNITY_ID } from '$env/static/public';

	export let data: PageData;
	$: events = data.events ?? [];

	$: pinned = (data.guilds ?? []).find((g) => g.id === PUBLIC_COMMUNITY_ID);
	$: guilds = (data.guilds ?? []).filter((g) => g.id !== PUBLIC_COMMUNITY_ID);
</script>

<Head title="Browse Servers" description="Browse Discord servers and Events available to join!" />

<main class="flex flex-col justify-center items-center text-center my-16" data-sveltekit-preload-data="tap">
	{#if events.length > 0}
		<section class="flex flex-col gap-8 w-[90%] md:w-[70%] max-w-7xl my-16 dark:text-white">
			<h1 class="text-4xl">Join Public Events</h1>
			{#each events ?? [] as event (event.id)}
				<Event {event} guild={data.guilds?.find((g) => g.id === event.guildId)} />
			{/each}
		</section>
	{/if}
	<section class="flex flex-col gap-8 w-[90%] md:w-[70%] max-w-7xl my-16 dark:text-white">
		<h1 class="text-4xl">Explore Public Discord Servers</h1>
		{#if pinned}
			<Serverbar guild={pinned} />
		{/if}
		{#each guilds as guild (guild.id)}
			<Serverbar {guild} />
		{/each}
	</section>
</main>
