<script lang="ts">
	import type { PageData } from './$types';
	import Serverbar from '$comp/stats/discord/serverbar.svelte';
	import Event from '$comp/stats/discord/event.svelte';

	export let data: PageData;
	$: events = data.events ?? [];
	$: guilds = data.guilds ?? [];
</script>

<main class="flex flex-col justify-center items-center text-center my-16" data-sveltekit-preload-data="tap">
	{#if events.length > 0}
		<section class="flex flex-col gap-8 w-[90%] md:w-[70%] max-w-7xl my-16 text-white">
			<h1 class="text-4xl">Join Public Events</h1>
			<p class="text-xl my-4">Join Farming Weight Events!</p>
			{#each events ?? [] as event (event.id)}
				<Event {event} guild={guilds.find((g) => g.id === event.guildId)} />
			{/each}
		</section>
	{/if}
	<section class="flex flex-col gap-8 w-[90%] md:w-[70%] max-w-7xl my-16 text-white">
		<h1 class="text-4xl">Explore Public Discord Servers</h1>
		<p class="text-xl my-4">Look through the Discord servers with Jacob Leaderboard access!</p>
		{#each data.guilds ?? [] as guild (guild.id)}
			<Serverbar {guild} />
		{/each}
	</section>
</main>
