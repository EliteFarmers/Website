<script lang="ts">
	import GuildsList from '$comp/guilds/guilds-list.svelte';
	import Head from '$comp/head.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let description = $derived.by(() => {
		let content = 'Browse Hypixel Guilds and view leaderboards!\n\n';

		content += data.guilds?.guilds
			.slice(0, 5)
			.map((guild, i) => {
				return `${i + 1}. ${guild.name} - Members: ${guild.memberCount} - Avg Skyblock Level: ${((guild.stats?.skyblockExperience.average ?? 0) / 100).toFixed(1)}`;
			})
			.join('\n');

		return content;
	});
</script>

<Head title="Hypixel Guilds" {description} />

<main class="flex flex-col items-center gap-8">
	<h1 class="my-16 text-4xl">Hypixel Guilds</h1>
	{#if data.guilds?.guilds}
		<GuildsList guilds={data.guilds?.guilds} />
	{:else}
		<p>No guilds found.</p>
	{/if}
</main>

<pre>{JSON.stringify(data.guilds, null, 2)}</pre>
