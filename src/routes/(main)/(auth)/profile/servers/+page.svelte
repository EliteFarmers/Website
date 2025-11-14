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

<div class="my-16 flex flex-col gap-16 lg:flex-row">
	<section class="flex w-full max-w-3xl flex-col gap-y-16">
		<section class="rounded-lg border-2 p-4">
			<h1 class="mb-4 text-2xl">Manage Servers</h1>
			{#if data.adminGuilds.length === 0}
				<p>You don't manage any servers with the bot invited!</p>
			{/if}
			<div class="grid grid-flow-row-dense grid-cols-1 md:grid-cols-2">
				{#each data.adminGuilds as guild (guild.id)}
					<Guild {guild} />
				{/each}
			</div>
		</section>

		<section class="rounded-lg border-2 p-4">
			<h1 class="mb-4 text-3xl">Public Servers</h1>
			{#if data.publicGuilds.length === 0}
				<p>You're not a member of any public guilds!</p>
			{/if}
			<div class="grid grid-flow-row-dense grid-cols-1 md:grid-cols-2">
				{#each data.publicGuilds as guild (guild.id)}
					<Guild {guild} link={true} />
				{/each}
			</div>
		</section>

		<section class="rounded-lg border-2 p-4">
			<h1 class="mb-4 text-2xl">Other Servers</h1>
			<p>Missing a server above? <a href="/invite" class="text-link underline">Invite the bot!</a></p>
		</section>
	</section>
</div>
