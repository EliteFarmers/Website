<script lang="ts">
	import { UserGroupSolid } from 'flowbite-svelte-icons';
	import type { PageData } from './$types';
	import Serverbar from '$comp/stats/discord/serverbar.svelte';

	export let data: PageData;
</script>

<main class="flex flex-col justify-center items-center my-16">
	<h1 class="text-4xl">Explore Public Discord Servers</h1>
	<p class="text-xl my-4">Look through the Discord servers with Jacob Leaderboard access!</p>

	<section class="flex flex-col gap-8 w-[90%] md:w-[70%] max-w-7xl my-16 text-white">
		{#each data.guilds ?? [] as guild (guild.id)}
			<Serverbar {guild} />
		{/each}
	</section>
</main>
