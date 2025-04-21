<script lang="ts">
	import type { PageData } from './$types';
	import Serverbar from '$comp/discord/serverbar.svelte';
	import Event from '$comp/discord/event.svelte';
	import Head from '$comp/head.svelte';
	import { PUBLIC_COMMUNITY_ID } from '$env/static/public';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let events = $derived(data.events ?? []);

	let pinned = $derived((data.guilds ?? []).find((g) => g.id === PUBLIC_COMMUNITY_ID));
	let guilds = $derived((data.guilds ?? []).filter((g) => g.id !== PUBLIC_COMMUNITY_ID));
</script>

<Head title="Browse Servers" description="Browse Discord servers and Events available to join!" />

<div class="flex flex-col items-center justify-center text-center" data-sveltekit-preload-data="tap">
	{#if events.length > 0}
		<section class="my-16 flex w-[90%] max-w-7xl flex-col gap-8 md:w-[70%]">
			<h1 class="mb-8 text-2xl md:text-4xl">Join Public Events</h1>
			{#each events ?? [] as event (event.id)}
				<Event {event} guild={data.guilds?.find((g) => g.id === event.guildId)} showRecentlyEnded={true} />
			{/each}
		</section>
	{/if}
	<section class="my-16 flex w-[90%] max-w-7xl flex-col gap-8 md:w-[70%]">
		<h1 class="mb-8 text-2xl md:text-4xl">Explore Public Discord Servers</h1>
		{#if pinned}
			<Serverbar guild={pinned} />
		{/if}
		{#each guilds as guild (guild.id)}
			<Serverbar {guild} />
		{/each}
	</section>
</div>
