<script lang="ts">
	import Head from '$comp/head.svelte';
	import Guild from '../guild.svelte';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
</script>

<Head title="Profile" description="View your profile and link your Minecraft account!" />

<main class="flex flex-col lg:flex-row gap-16 my-16">
	<section class="flex flex-col max-w-3xl w-full">
		<h1 class="text-3xl mb-4">Public Servers</h1>
		{#if data.publicGuilds.length === 0}
			<p>You're not a member of any public guilds!</p>
		{/if}
		<div class="grid grid-cols-1 md:grid-cols-2 grid-flow-row-dense mb-16">
			{#each data.publicGuilds as guild (guild.id)}
				<Guild {guild} link={true} />
			{/each}
		</div>

		<h1 class="text-2xl mb-4">Manage Servers</h1>
		{#if data.adminGuilds.length === 0}
			<p>You don't manage any servers with the bot invited!</p>
		{/if}
		<div class="grid grid-cols-1 md:grid-cols-2 grid-flow-row-dense mb-16">
			{#each data.adminGuilds as guild (guild.id)}
				<Guild {guild} />
			{/each}
		</div>

		<h1 class="text-2xl mb-4">Other Servers</h1>
		<p>Missing a server above? <a href="/invite" class="text-blue-500 underline">Invite the bot!</a></p>
	</section>
</main>
